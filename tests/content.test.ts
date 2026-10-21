import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { sitePath } from '../src/lib/site-path';
import { normalizeTags } from '../src/lib/tags';
import { scanNotes, getAllFlatNotes } from '../src/lib/scan-notes';
import { resolveMediaPath } from '../src/lib/media-path';
import headings from '../src/lib/remark-note-headings';
import matter from 'gray-matter';

test('repository skills have valid YAML metadata', () => {
  const root = path.resolve('skills');
  for (const file of fs.readdirSync(root, { recursive: true }).filter(file => path.basename(String(file)) === 'SKILL.md')) {
    const { data } = matter(fs.readFileSync(path.join(root, String(file)), 'utf8'));
    assert.equal(typeof data.name, 'string', String(file));
    assert.equal(typeof data.description, 'string', String(file));
    assert.ok(data.description.length > 0);
  }
});

test('deployment paths preserve external URLs and do not duplicate the base', () => {
  for (const base of ['/', '/personal-garden/']) {
    assert.equal(sitePath('garden/example/', base), `${base}garden/example/`);
    assert.equal(sitePath(`${base}media/icon.svg`, base), `${base}media/icon.svg`);
    assert.equal(sitePath('https://example.com/a.svg', base), 'https://example.com/a.svg');
    assert.equal(sitePath('//example.com/a.svg', base), '//example.com/a.svg');
  }
});
test('aliases are normalized and deduplicated', () => {
  assert.deepEqual(normalizeTags(['git', 'Git', 'github-actions', 'GitHub Actions', 'PyTorch']), ['Git', 'GitHub Actions', 'PyTorch']);
});
test('published tree, counts and search metadata exclude drafts and empty directories', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'garden-published-'));
  try {
    fs.mkdirSync(path.join(root, '0001-draft-only'));
    fs.writeFileSync(path.join(root, '0001-draft-only', '0001-hidden.mdx'), '---\ntitle: SECRET\nsummary: DO_NOT_PUBLISH\ndraft: true\n---\nsecret');
    fs.writeFileSync(path.join(root, '0002-visible.mdx'), '---\ntitle: Visible\ntags: [git, Git]\n---\nhello');
    const tree = scanNotes(root);
    assert.equal(tree.length, 1);
    assert.equal(tree[0].title, 'Visible');
    const flat = getAllFlatNotes(tree);
    assert.deepEqual(flat[0].tags, ['Git']);
    assert.doesNotMatch(JSON.stringify(flat), /SECRET|DO_NOT_PUBLISH/);
  } finally {
    assert.ok(root.startsWith(path.join(os.tmpdir(), 'garden-published-')));
    fs.rmSync(root, { recursive: true });
  }
});
test('same-named attachments resolve from their own note, preserving suffixes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'garden-media-'));
  const oldCwd = process.cwd();
  try {
    process.chdir(root);
    const notes = path.join(root, 'notes');
    for (const name of ['a','b']) {
      fs.mkdirSync(path.join(notes,name,'_media'), { recursive:true });
      fs.writeFileSync(path.join(notes,name,'_media','图片.svg'),name);
    }
    for (const base of ['/', '/personal-garden/']) {
      const result=resolveMediaPath('./_media/图片.svg?download=1#preview',path.join(notes,'b','note.mdx'),base,notes);
      assert.equal(result,`${base}media/b/_media/${encodeURIComponent('图片.svg')}?download=1#preview`);
      assert.equal(fs.readFileSync(path.join(root,'public/media/b/_media/图片.svg'),'utf8'),'b');
    }
    assert.throws(()=>resolveMediaPath('./_media/missing.svg',path.join(notes,'b','note.mdx'),'/',notes),/不存在/);
    assert.throws(()=>resolveMediaPath('../../../outside.svg',path.join(notes,'b','note.mdx'),'/',notes),/越出/);
    assert.throws(()=>resolveMediaPath('./_media/图片.svg',undefined,'/',notes),/上下文/);
  } finally {
    process.chdir(oldCwd);
    assert.ok(root.startsWith(path.join(os.tmpdir(),'garden-media-')));
    fs.rmSync(root,{recursive:true});
  }
});
test('note h1 is owned by the page while project headings stay intact', () => {
  const tree:any={children:[{type:'heading',depth:1},{type:'heading',depth:2},{type:'heading',depth:1}]};
  headings()(tree,{path:'D:/repo/src/content/notes/example.mdx'});
  assert.deepEqual(tree.children.map((n:any)=>n.depth),[2,2]);
  const project:any={children:[{type:'heading',depth:1}]};
  headings()(project,{path:'D:/repo/src/content/projects/example.md'});
  assert.equal(project.children[0].depth,1);
});
