import { visit } from 'unist-util-visit';
import type { Root, Text, Link } from 'mdast';
import fs from 'node:fs';
import path from 'node:path';

const NOTES_DIR = path.resolve('src/content/notes');

// 构建标题到 slug 的映射表
function buildTitleSlugMap(): Map<string, string> {
  const map = new Map<string, string>();

  function scanDir(dir: string, parentSlug: string = '') {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;

      if (entry.isDirectory()) {
        const dirPath = path.join(dir, entry.name);
        const slug = (parentSlug ? `${parentSlug}/${entry.name}` : entry.name).toLowerCase();
        scanDir(dirPath, slug);
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        const slug = (parentSlug
          ? `${parentSlug}/${entry.name.replace(/\.(md|mdx)$/, '')}`
          : entry.name.replace(/\.(md|mdx)$/, '')).toLowerCase();

        const fullPath = path.join(dir, entry.name);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const match = content.match(/^---\n([\s\S]*?)\n---/);

        if (match) {
          const titleMatch = match[1].match(/title:\s*(.+)/);
          if (titleMatch) {
            const title = titleMatch[1].trim().replace(/['"]/g, '');
            // 使用 base URL 构建完整路径
            map.set(title, `/personal-garden/garden/${slug}/`);
          }
        }
      }
    }
  }

  scanDir(NOTES_DIR);
  return map;
}

// 缓存映射表
let titleSlugMap: Map<string, string> | null = null;

function getTitleSlugMap(): Map<string, string> {
  if (!titleSlugMap) {
    titleSlugMap = buildTitleSlugMap();
  }
  return titleSlugMap;
}

export default function remarkWikiLinks() {
  return (tree: Root) => {
    const map = getTitleSlugMap();

    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined) return;

      const regex = /\[\[([^\]]+)\]\]/g;
      const parts: Array<Text | Link> = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(node.value)) !== null) {
        // 添加匹配前的文本
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            value: node.value.slice(lastIndex, match.index),
          });
        }

        const title = match[1].trim();
        // 支持忽略空格的模糊匹配
        const normalizedTitle = title.replace(/\s+/g, '');
        let href = map.get(title);

        if (!href) {
          // 尝试模糊匹配
          for (const [mapTitle, mapHref] of map.entries()) {
            if (mapTitle.replace(/\s+/g, '') === normalizedTitle) {
              href = mapHref;
              break;
            }
          }
        }

        // 创建链接节点
        parts.push({
          type: 'link',
          url: href || `/personal-garden/garden/?search=${encodeURIComponent(title)}`,
          children: [{ type: 'text', value: title }],
        } as Link);

        lastIndex = match.index + match[0].length;
      }

      // 如果有匹配，替换原节点
      if (lastIndex > 0) {
        // 添加剩余文本
        if (lastIndex < node.value.length) {
          parts.push({
            type: 'text',
            value: node.value.slice(lastIndex),
          });
        }

        parent.children.splice(index, 1, ...parts);
        return index + parts.length;
      }
    });
  };
}
