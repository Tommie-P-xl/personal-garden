import fs from 'node:fs';
import path from 'node:path';
import { sitePath } from './site-path';

/** Resolve relative attachments from their source note, never by basename. */
export function resolveMediaPath(src: string, sourceFile: string | undefined, base: string, notesDir = path.resolve('src/content/notes')): string {
  if (/^(?:https?:|data:|blob:|\/\/)/i.test(src)) return src;
  if (src.startsWith('/')) return sitePath(src, base);
  if (!sourceFile) throw new Error(`媒体缺少源笔记上下文：${src}`);
  const split = src.search(/[?#]/);
  const pathname = split < 0 ? src : src.slice(0, split);
  const suffix = split < 0 ? '' : src.slice(split);
  const source = path.resolve(path.dirname(sourceFile), decodeURIComponent(pathname));
  const relative = path.relative(notesDir, source);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error(`媒体路径越出笔记目录：${src}`);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) throw new Error(`媒体文件不存在：${source}`);
  const target = path.resolve('public/media', relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  return sitePath(`media/${relative.split(path.sep).map(encodeURIComponent).join('/')}`, base) + suffix;
}
