/** The page header owns h1; note bodies start at h2. */
export default function remarkNoteHeadings() {
  return (tree: any, file: any) => {
    if (!String(file.path || file.history?.[0] || '').replace(/\\/g, '/').includes('/content/notes/')) return;
    const first = tree.children.findIndex((node: any) => node.type !== 'mdxjsEsm');
    if (tree.children[first]?.type === 'heading' && tree.children[first].depth === 1) tree.children.splice(first, 1);
    for (const node of tree.children) if (node.type === 'heading' && node.depth === 1) node.depth = 2;
  };
}
