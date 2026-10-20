const aliases: Record<string, string> = {
  git: 'Git', 'github-actions': 'GitHub Actions', 'github actions': 'GitHub Actions',
  python: 'Python', pytorch: 'PyTorch', javascript: 'JavaScript', typescript: 'TypeScript',
  latex: 'LaTeX', mdx: 'MDX', rf: 'RF', sqlite: 'SQLite', 'ci-cd': 'CI/CD',
};
export function normalizeTag(tag: string): string {
  const clean = tag.trim();
  return aliases[clean.toLowerCase()] || clean;
}
export function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map(normalizeTag).filter(Boolean))];
}
