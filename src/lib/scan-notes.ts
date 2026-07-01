import fs from 'node:fs';
import path from 'node:path';

export interface NoteMeta {
  title: string;
  description?: string;
}

export interface NoteFile {
  title: string;
  filePath: string;
  slug: string;
  order: number;
  type: 'file' | 'dir';
  children?: NoteFile[];
  meta?: NoteMeta;
}

const NOTES_DIR = path.resolve('src/content/notes');

function parseFileName(fileName: string, isDir: boolean): { order: number; title: string } {
  const match = fileName.match(/^(\d{4})-(.+?)(?:\.md)?$/);
  if (!match) {
    return { order: 9999, title: isDir ? fileName : fileName.replace(/\.md$/, '') };
  }
  return {
    order: parseInt(match[1], 10),
    title: match[2],
  };
}

function readMeta(dirPath: string): NoteMeta | undefined {
  const metaPath = path.join(dirPath, '_meta.json');
  if (!fs.existsSync(metaPath)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  } catch {
    return undefined;
  }
}

export function scanNotes(dir: string = NOTES_DIR, parentSlug: string = ''): NoteFile[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const items: NoteFile[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;

    const { order, title } = parseFileName(entry.name, entry.isDirectory());

    if (entry.isDirectory()) {
      const dirPath = path.join(dir, entry.name);
      const slug = parentSlug ? `${parentSlug}/${entry.name}` : entry.name;
      const children = scanNotes(dirPath, slug);
      const meta = readMeta(dirPath);

      items.push({
        title: meta?.title || title,
        filePath: path.relative(NOTES_DIR, dirPath),
        slug,
        order,
        type: 'dir',
        children,
        meta,
      });
    } else if (entry.name.endsWith('.md')) {
      const slug = parentSlug
        ? `${parentSlug}/${entry.name.replace(/\.md$/, '')}`
        : entry.name.replace(/\.md$/, '');

      items.push({
        title,
        filePath: path.relative(NOTES_DIR, path.join(dir, entry.name)),
        slug,
        order,
        type: 'file',
      });
    }
  }

  items.sort((a, b) => a.order - b.order);
  return items;
}

export interface FlatNote {
  title: string;
  slug: string;
  filePath: string;
  category: string;
  tags: string[];
  summary?: string;
}

export function readFrontmatter(filePath: string): Record<string, any> {
  const fullPath = path.resolve('src/content/notes', filePath);
  if (!fs.existsSync(fullPath)) return {};

  const content = fs.readFileSync(fullPath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const fm: Record<string, any> = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const kv = line.match(/^(\w+):\s*(.+)/);
    if (kv) {
      const key = kv[1].trim();
      let value: any = kv[2].trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map((s: string) => s.trim().replace(/['"]/g, ''));
      }
      fm[key] = value;
    }
  }
  return fm;
}

export function getAllFlatNotes(): FlatNote[] {
  const tree = scanNotes();
  const notes: FlatNote[] = [];

  function walk(items: NoteFile[], category: string) {
    for (const item of items) {
      if (item.type === 'file') {
        const fm = readFrontmatter(item.filePath);
        notes.push({
          title: fm.title || item.title,
          slug: item.slug,
          filePath: item.filePath,
          category,
          tags: Array.isArray(fm.tags) ? fm.tags : [],
          summary: fm.summary,
        });
      } else if (item.type === 'dir' && item.children) {
        const cat = item.meta?.title || item.title;
        walk(item.children, category || cat);
      }
    }
  }

  walk(tree, '', undefined);
  return notes;
}

export function getPrevNext(currentSlug: string): { prev?: NoteFile; next?: NoteFile } {
  const tree = scanNotes();
  const allFiles: NoteFile[] = [];

  function collect(items: NoteFile[]) {
    for (const item of items) {
      if (item.type === 'file') {
        allFiles.push(item);
      } else if (item.children) {
        collect(item.children);
      }
    }
  }
  collect(tree);

  const idx = allFiles.findIndex(f => f.slug === currentSlug);
  if (idx === -1) return {};

  return {
    prev: idx > 0 ? allFiles[idx - 1] : undefined,
    next: idx < allFiles.length - 1 ? allFiles[idx + 1] : undefined,
  };
}
