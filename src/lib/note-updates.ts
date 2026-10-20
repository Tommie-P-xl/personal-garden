import { execFileSync } from 'node:child_process';
import { readFrontmatter, type FlatNote } from './scan-notes';

/** Dates come from frontmatter or Git, never from checkout file timestamps. */
export function recentNotes(notes: FlatNote[], count = 3) {
  let fullHistory = false;
  try { fullHistory = execFileSync('git', ['rev-parse', '--is-shallow-repository'], { encoding: 'utf-8', timeout: 3000 }).trim() === 'false'; } catch {}
  return notes.map(note => {
    const data = readFrontmatter(note.filePath);
    let updated = data.updated ? new Date(data.updated).toISOString() : '';
    if (!updated && fullHistory) {
      try {
        updated = execFileSync('git', ['log', '-1', '--format=%cI', '--', `src/content/notes/${note.filePath.replace(/\\/g, '/')}`], { encoding: 'utf-8', timeout: 3000 }).trim();
      } catch { /* Source archives may not include Git history. */ }
    }
    return { ...note, updated };
  }).sort((a, b) => b.updated.localeCompare(a.updated) || a.slug.localeCompare(b.slug)).slice(0, count);
}
