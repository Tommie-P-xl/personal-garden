import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

/**
 * rehype 插件：自动为所有 <table> 元素添加 Table 组件的包装样式
 * 支持 Markdown 表格和 HTML 表格，统一渲染效果
 * Markdown 表格默认居中对齐
 */
export default function rehypeTableWrapper() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      // 只处理 <table> 元素
      if (node.tagName !== 'table') return;
      if (typeof index !== 'number' || !parent) return;

      // 如果父节点是 <figure class="table-wrapper">，说明已经被 Table 组件处理
      if (
        parent.type === 'element' &&
        parent.tagName === 'figure' &&
        hasClass(parent, 'table-wrapper')
      ) {
        return;
      }

      // 如果父节点是 MDX JSX 元素（<Table> 组件），跳过
      if ((parent as any).type === 'mdxJsxFlowElement') {
        return;
      }

      // 如果已经在 .table-scroll 中，跳过
      if (
        parent.type === 'element' &&
        hasClass(parent, 'table-scroll')
      ) {
        return;
      }

      // 构建包装结构：
      // <figure class="table-wrapper table-align-center">
      //   <div class="table-scroll">
      //     <table>...</table>
      //   </div>
      // </figure>
      const wrappedTable: Element = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-scroll'] },
        children: [node],
      };

      const figure: Element = {
        type: 'element',
        tagName: 'figure',
        properties: { className: ['table-wrapper', 'table-align-center'] },
        children: [wrappedTable],
      };

      // 替换原来的 <table> 节点
      parent.children[index] = figure;
    });
  };
}

function hasClass(node: Element, className: string): boolean {
  const cls = node.properties?.className;
  return Array.isArray(cls) && cls.includes(className);
}
