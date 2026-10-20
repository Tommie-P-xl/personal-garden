import { visit } from 'unist-util-visit';
import { resolveMediaPath } from './media-path';
import { deploymentBase } from './site-path';

/** Resolve Markdown, HTML and MDX attachments from their source note. */
export default function remarkMedia() {
  return (tree: any, file: any) => {
    const sourceFile = file.history?.[0] || file.path;
    if (!sourceFile) return;
    const resolve = (url: string) => /^(?:\.\.?\/)+_media\//.test(url)
      ? resolveMediaPath(url, sourceFile, deploymentBase) : url;
    visit(tree, (node: any) => {
      if (node.type === 'image' || node.type === 'link') node.url = resolve(node.url);
      if (node.type === 'html') {
        node.value = node.value.replace(/((?:src|href)\s*=\s*["'])([^"']+)(["'])/gi,
          (_: string, start: string, url: string, end: string) => start + resolve(url) + end);
      }
      if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
        for (const attr of node.attributes || []) {
          if (['src', 'href'].includes(attr.name) && typeof attr.value === 'string') attr.value = resolve(attr.value);
        }
      }
    });
  };
}
