import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOTES_DIR = path.join(ROOT, 'src/content/notes');
const errors = [];
const notes = [];
const routes = new Map();
const titles = new Map();

function addIssue(collection, file, message) {
  const relativeFile = path.relative(ROOT, file).split(path.sep).join('/');
  collection.push(`${relativeFile}: ${message}`);
}

function stripCodeExamples(markdown) {
  const withoutFences = [];
  let fence = null;

  for (const line of markdown.split(/\r?\n/)) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (!fence && marker) {
      fence = { char: marker[1][0], length: marker[1].length };
      continue;
    }
    if (fence) {
      const close = new RegExp(`^\\s{0,3}${fence.char}{${fence.length},}\\s*$`);
      if (close.test(line)) fence = null;
      continue;
    }
    withoutFences.push(line);
  }

  return withoutFences.join('\n').replace(/(^|[^\\])(`+)[^`\n]*?\2/g, '$1');
}

function addRoute(slug, kind, file) {
  const normalized = slug.toLowerCase();
  const previous = routes.get(normalized);
  if (previous) {
    addIssue(errors, file, `重复 slug "${normalized}"，与 ${path.relative(ROOT, previous.file).split(path.sep).join('/')} (${previous.kind}) 冲突`);
  } else {
    routes.set(normalized, { kind, file });
  }
}

function scanDirectory(directory, parentSlug = '') {
  if (!fs.existsSync(directory)) return;

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const slug = (parentSlug ? `${parentSlug}/${entry.name}` : entry.name).toLowerCase();
      addRoute(slug, '目录', fullPath);
      scanDirectory(fullPath, slug);
      continue;
    }

    if (!entry.isFile() || !/\.mdx?$/i.test(entry.name)) continue;

    const fileSlug = entry.name.replace(/\.mdx?$/i, '');
    const slug = (parentSlug ? `${parentSlug}/${fileSlug}` : fileSlug).toLowerCase();
    let parsed;
    try {
      parsed = matter(fs.readFileSync(fullPath, 'utf8'));
    } catch (error) {
      addIssue(errors, fullPath, `无法解析 frontmatter: ${error.message}`);
      continue;
    }

    const title = typeof parsed.data.title === 'string' ? parsed.data.title.trim() : '';
    if (!title) addIssue(errors, fullPath, '缺少有效的 title frontmatter');

    addRoute(slug, '笔记', fullPath);
    const normalizedTitle = title.replace(/\s+/g, '');
    if (normalizedTitle) {
      const previous = titles.get(normalizedTitle);
      if (previous) {
        addIssue(errors, fullPath, `重复标题 "${title}"，与 ${path.relative(ROOT, previous.file).split(path.sep).join('/')} 冲突`);
      } else {
        titles.set(normalizedTitle, { title, file: fullPath, draft: parsed.data.draft === true });
      }
    }

    notes.push({ file: fullPath, slug, title, draft: parsed.data.draft === true, body: parsed.content });
  }
}

function checkWikiLinks() {
  const titleTargets = new Map();
  for (const note of notes) {
    if (!note.title) continue;
    const key = note.title.replace(/\s+/g, '');
    if (!titleTargets.has(key)) titleTargets.set(key, []);
    titleTargets.get(key).push(note);
  }

  for (const note of notes) {
    if (note.draft) continue;
    const content = stripCodeExamples(note.body);
    const seen = new Set();
    for (const match of content.matchAll(/\[\[([^\]]+)\]\]/g)) {
      const targetTitle = match[1].trim();
      const key = targetTitle.replace(/\s+/g, '');
      if (!key || seen.has(key)) continue;
      seen.add(key);

      const targets = titleTargets.get(key) || [];
      if (targets.length === 0) {
        addIssue(errors, note.file, `Wiki 链接 [[${targetTitle}]] 没有对应笔记`);
      } else if (targets.length > 1) {
        addIssue(errors, note.file, `Wiki 链接 [[${targetTitle}]] 对应多个同名笔记`);
      } else if (targets[0].draft) {
        addIssue(errors, note.file, `Wiki 链接 [[${targetTitle}]] 指向草稿 ${path.relative(ROOT, targets[0].file).split(path.sep).join('/')}`);
      }
    }
  }
}

function checkMediaReferences() {
  const mediaReferencePattern = /(?:\.\.\/|\.\/)+_media\/[^\s"'<>)]*/g;
  const attributePattern = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;
  const markdownLinkPattern = /!?\[[^\]]*\]\(([^\s)]+)(?:\s+["'][^)]*)?\)/g;

  for (const note of notes) {
    if (note.draft) continue;
    const content = stripCodeExamples(note.body);
    const references = new Set();

    for (const match of content.matchAll(mediaReferencePattern)) references.add(match[0]);
    for (const match of content.matchAll(attributePattern)) {
      if (match[1].includes('_media/')) references.add(match[1]);
    }
    for (const match of content.matchAll(markdownLinkPattern)) {
      if (match[1].includes('_media/')) references.add(match[1]);
    }

    for (const reference of references) {
      const cleanReference = reference.split(/[?#]/, 1)[0];
      const mediaPath = path.resolve(path.dirname(note.file), cleanReference);
      const relative = path.relative(NOTES_DIR, mediaPath);
      if (relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) {
        addIssue(errors, note.file, `媒体路径越出笔记目录: ${reference}`);
      } else if (!fs.existsSync(mediaPath) || !fs.statSync(mediaPath).isFile()) {
        addIssue(errors, note.file, `媒体文件不存在: ${reference}`);
      }
    }
  }
}

if (!fs.existsSync(NOTES_DIR)) {
  console.error(`内容目录不存在: ${path.relative(ROOT, NOTES_DIR)}`);
  process.exit(1);
}

scanDirectory(NOTES_DIR);
checkWikiLinks();
checkMediaReferences();

console.log(`内容检查完成：扫描 ${notes.length} 篇笔记、${routes.size} 个唯一 slug。`);
for (const error of errors) console.error(`✖ ${error}`);

if (errors.length > 0) {
  console.error(`发现 ${errors.length} 个问题。`);
  process.exit(1);
}

console.log('未发现内容问题。');
