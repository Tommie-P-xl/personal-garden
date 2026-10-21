import { visit } from 'unist-util-visit';
import type { Root, Code } from 'mdast';
import type { Element, ElementContent } from 'hast';

const text = (value: string): ElementContent => ({ type: 'text', value });
const el = (tagName: string, properties: Element['properties'], children: ElementContent[] = []): Element =>
  ({ type: 'element', tagName, properties, children });

/** 在 Shiki 高亮前转换 Mermaid 围栏；Markdown 与 MDX 共用。 */
export default function remarkDiagrams() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code) => {
      if (node.lang !== 'mermaid') return;
      const title = node.meta?.match(/title="([^"]+)"/)?.[1]
        || node.value.match(/^\s*accTitle:\s*(.+)$/m)?.[1] || '流程图';
      node.data = {
        ...node.data,
        hName: 'figure',
        hProperties: { className: ['note-diagram'], 'data-mermaid': node.value, 'data-title': title },
        hChildren: [
          el('figcaption', { className: ['diagram-heading'] }, [
            el('span', {}, [text(title)]),
            el('button', { type: 'button', className: ['diagram-expand'], hidden: true, ariaLabel: `放大查看：${title}` }, [text('放大查看 ↗')]),
          ]),
          el('div', { className: ['diagram-viewport'], tabIndex: 0, role: 'region', ariaLabel: `${title}，宽图可横向滚动` }, [el('div', { className: ['diagram-canvas'] })]),
          el('p', { className: ['diagram-status'], role: 'status' }, [text('图表加载后显示；也可展开查看下方源码。')]),
          el('details', { className: ['diagram-source'] }, [
            el('summary', {}, [text('查看 Mermaid 源码')]),
            el('pre', {}, [el('code', {}, [text(node.value)])]),
          ]),
        ],
      };
    });
  };
}
