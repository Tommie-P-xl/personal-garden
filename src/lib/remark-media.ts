import { visit } from 'unist-util-visit';
import type { Root, Image, Html } from 'mdast';
import path from 'node:path';
import fs from 'node:fs';

const NOTES_DIR = path.resolve('src/content/notes');
const PUBLIC_MEDIA = path.resolve('public/media');
const BASE = process.env.DEPLOY_TARGET === 'cloudflare' ? '/' : '/personal-garden/';

/**
 * 处理媒体文件路径的remark插件
 * 将相对路径的媒体引用复制到public目录并更新URL
 * 支持标准Markdown图片和HTML img标签
 */
export default function remarkMedia() {
  return (tree: Root, file: any) => {
    // 确保public/media目录存在
    if (!fs.existsSync(PUBLIC_MEDIA)) {
      fs.mkdirSync(PUBLIC_MEDIA, { recursive: true });
    }

    // 获取当前文件路径
    const currentFilePath = file.history?.[0] || file.path;
    if (!currentFilePath) {
      return;
    }

    const sourceDir = path.dirname(currentFilePath);

    // 处理媒体文件的通用函数
    function processMediaUrl(url: string): string | null {
      // 只处理相对路径的媒体引用
      if (!url.startsWith('./_media/') && !url.startsWith('../_media/')) {
        return null;
      }

      // 计算源文件的绝对路径
      const mediaPath = path.resolve(sourceDir, url);

      // 检查文件是否存在
      if (!fs.existsSync(mediaPath)) {
        console.warn(`[remark-media] 文件不存在: ${mediaPath}`);
        return null;
      }

      // 计算在public目录中的路径
      const relativeToNotes = path.relative(NOTES_DIR, mediaPath);
      const publicPath = path.join(PUBLIC_MEDIA, relativeToNotes);
      const publicDir = path.dirname(publicPath);

      // 确保目标目录存在
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      // 复制文件（如果目标不存在或源文件更新）
      if (!fs.existsSync(publicPath) ||
          fs.statSync(mediaPath).mtime > fs.statSync(publicPath).mtime) {
        fs.copyFileSync(mediaPath, publicPath);
        console.log(`[remark-media] 复制: ${relativeToNotes}`);
      }

      // 返回绝对路径
      const publicRelativePath = path.relative('public', publicPath).replace(/\\/g, '/');
      return `${BASE}${publicRelativePath}`;
    }

    // 处理标准Markdown图片
    visit(tree, 'image', (node: Image) => {
      const newUrl = processMediaUrl(node.url);
      if (newUrl) {
        node.url = newUrl;
      }
    });

    // 处理HTML中的所有相对路径媒体引用
    visit(tree, 'html', (node: Html) => {
      if (!node.value) return;

      let html = node.value;
      let modified = false;

      // 查找所有相对路径的媒体引用并替换
      // 使用简单的字符串替换
      const mediaPattern = /(\.\/_media\/[^\s"'<>]+)/g;
      let match;

      while ((match = mediaPattern.exec(html)) !== null) {
        const relativePath = match[1];
        const newUrl = processMediaUrl(relativePath);
        if (newUrl) {
          html = html.split(relativePath).join(newUrl);
          modified = true;
        }
      }

      if (modified) {
        node.value = html;
      }
    });
  };
}
