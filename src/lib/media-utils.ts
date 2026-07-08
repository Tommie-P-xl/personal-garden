/**
 * 媒体文件路径工具函数
 */

const BASE = process.env.DEPLOY_TARGET === 'cloudflare' ? '/' : '/personal-garden/';

/**
 * 将相对媒体路径转换为绝对路径
 * @param relativePath 相对路径，如 "./_media/image.png"
 * @param currentNotePath 当前笔记的路径，如 "0004-mdx-components/0002-新功能测试"
 * @returns 绝对路径
 */
export function getMediaPath(relativePath: string, currentNotePath: string): string {
  // 如果已经是绝对路径或外部URL，直接返回
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('/')) {
    return relativePath;
  }

  // 解析相对路径
  let mediaPath = relativePath;

  // 处理 ./_media/ 前缀
  if (relativePath.startsWith('./_media/')) {
    mediaPath = relativePath.slice(2); // 移除 ./
  } else if (relativePath.startsWith('../_media/')) {
    // 处理上级目录的 _media
    const parts = currentNotePath.split('/');
    if (parts.length > 1) {
      parts.pop(); // 移除当前目录
      mediaPath = parts.join('/') + '/_media/' + relativePath.slice('../_media/'.length);
    }
  }

  // 构建绝对路径
  return `${BASE}media/${currentNotePath}/${mediaPath}`;
}

/**
 * 获取当前笔记的目录路径
 * @param filePath 笔记文件路径，如 "src/content/notes/0004-mdx-components/0002-新功能测试.mdx"
 * @returns 目录路径，如 "0004-mdx-components"
 */
export function getNoteDirectory(filePath: string): string {
  // 从文件路径提取目录
  const parts = filePath.replace(/\.mdx?$/, '').split('/');
  // 移除文件名，只保留目录
  if (parts.length > 1) {
    parts.pop();
  }
  // 返回相对于 notes 目录的路径
  const notesIndex = parts.indexOf('notes');
  if (notesIndex !== -1) {
    return parts.slice(notesIndex + 1).join('/');
  }
  return parts.join('/');
}
