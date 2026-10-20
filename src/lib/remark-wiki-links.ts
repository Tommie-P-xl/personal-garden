import { visit } from 'unist-util-visit';
import type { Root, Text, Link } from 'mdast';
import { getAllFlatNotes } from './scan-notes';
import { registerSlug } from './slug-hash';
import { deploymentBase as BASE } from './site-path';

function getTitleSlugMap(): Map<string, string> {
  return new Map(getAllFlatNotes().map(note => [note.title, `${BASE}garden/${registerSlug(note.slug)}/`]));
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
          url: href || `${BASE}garden/?search=${encodeURIComponent(title)}`,
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
