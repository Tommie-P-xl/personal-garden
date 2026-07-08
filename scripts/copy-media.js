import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const NOTES_DIR = path.join(ROOT, 'src/content/notes');
const PUBLIC_MEDIA = path.join(ROOT, 'public/media');

/**
 * 递归扫描所有 _media 目录并复制到 public/media
 */
function copyMediaDirectories() {
  console.log('📦 开始复制媒体文件...\n');

  if (!fs.existsSync(PUBLIC_MEDIA)) {
    fs.mkdirSync(PUBLIC_MEDIA, { recursive: true });
  }

  let copiedCount = 0;

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === '_media') {
          // 找到 _media 目录，复制其内容
          const relativePath = path.relative(NOTES_DIR, fullPath);
          const publicPath = path.join(PUBLIC_MEDIA, relativePath);

          copyDirectory(fullPath, publicPath);
          copiedCount++;
        } else {
          // 递归扫描子目录
          scanDir(fullPath);
        }
      }
    }
  }

  function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        // 只复制目标不存在或源文件更新的文件
        if (!fs.existsSync(destPath) ||
            fs.statSync(srcPath).mtime > fs.statSync(destPath).mtime) {
          fs.copyFileSync(srcPath, destPath);
          console.log(`  ✓ ${path.relative(ROOT, srcPath)}`);
        }
      }
    }
  }

  scanDir(NOTES_DIR);

  console.log(`\n✅ 完成！处理了 ${copiedCount} 个 _media 目录`);
}

copyMediaDirectories();
