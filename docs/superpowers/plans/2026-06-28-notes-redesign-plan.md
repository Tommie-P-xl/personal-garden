# 笔记系统重构实施计划

> **For agentic workers:** 使用 superpowers:executing-plans 逐步执行此计划。

**Goal:** 将笔记系统重构为菜鸟教程风格的教程式布局，支持多级目录、KaTeX 数学公式、双主题代码块。

**Architecture:** 使用构建时文件系统扫描生成目录树，Astro content collection 保留用于列表页，详情页改用自定义路由 + fs 读取。新增 Sidebar 组件和教程式详情页布局。

**Tech Stack:** Astro, Tailwind CSS, KaTeX (remark-math + rehype-katex), Shiki (双主题), Node.js fs

---

## 文件结构

### 新建文件
- `src/lib/scan-notes.ts` — 构建时扫描笔记目录树的工具函数
- `src/components/Sidebar.astro` — 左侧目录树导航组件
- `src/components/PrevNextNav.astro` — 上/下篇导航组件
- `src/components/CopyButton.astro` — 代码块复制按钮组件
- `src/components/KaTeXLoader.astro` — KaTeX 样式加载组件

### 修改文件
- `package.json` — 添加 KaTeX 依赖
- `astro.config.mjs` — 配置 KaTeX 插件和 Shiki 双主题
- `src/content.config.ts` — 简化 notes schema
- `src/pages/garden/[...slug].astro` — 重写为教程式详情页
- `src/pages/garden/index.astro` — 适配新目录结构
- `src/components/NoteCard.astro` — 简化 props
- `src/pages/index.astro` — 适配新数据结构
- `src/layouts/BaseLayout.astro` — 添加 KaTeX 全局样式
- `tailwind.config.mjs` — 添加 sidebar 相关样式

### 删除文件（迁移后）
- `src/content/notes/linux/memory-management.md` — 迁移到新目录
- `src/content/notes/linux/process-scheduling.md` — 迁移到新目录

### 新建目录结构
```
src/content/notes/
├── _meta.json                    # 全局配置（可选）
├── 0001-linux/
│   ├── _meta.json
│   ├── 0001-memory-management/
│   │   ├── _meta.json
│   │   ├── 0001-虚拟内存.md
│   │   ├── 0002-分页机制.md
│   │   └── 0003-伙伴系统.md
│   └── 0002-process-scheduling/
│       ├── _meta.json
│       ├── 0001-CFS调度器.md
│       └── 0002-进程状态.md
└── 0002-coding/
    ├── _meta.json
    └── 0001-python/
        ├── _meta.json
        ├── 0001-基础语法.md
        └── 0002-数据类型.md
```

---

## Task 1: 安装依赖并配置 astro.config.mjs

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`

- [ ] **Step 1: 安装 KaTeX 依赖**

```bash
cd D:\Desktop\暑假\个人网站
npm install remark-math rehype-katex katex
```

- [ ] **Step 2: 更新 astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://tommie-p-xl.github.io',
  base: '/personal-garden/',
  integrations: [
    mdx(),
    tailwind(),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
```

- [ ] **Step 3: 验证构建**

```bash
npm run build
```

Expected: 构建成功（现有页面不受影响）

- [ ] **Step 4: 提交**

```bash
git add package.json package-lock.json astro.config.mjs
git commit -m "feat: 添加 KaTeX 支持和 Shiki 双主题配置"
```

---

## Task 2: 创建笔记目录扫描工具函数

**Files:**
- Create: `src/lib/scan-notes.ts`

- [ ] **Step 1: 创建 scan-notes.ts**

```typescript
import fs from 'node:fs';
import path from 'node:path';

export interface NoteMeta {
  title: string;
  description?: string;
  icon?: string;
}

export interface NoteFile {
  /** 显示标题（去掉序号前缀） */
  title: string;
  /** 文件路径（相对于 src/content/notes） */
  filePath: string;
  /** URL slug（相对于 /garden/） */
  slug: string;
  /** 序号 */
  order: number;
  /** 类型：文件或目录 */
  type: 'file' | 'dir';
  /** 子项（仅目录） */
  children?: NoteFile[];
  /** 目录元数据（仅目录） */
  meta?: NoteMeta;
}

const NOTES_DIR = path.resolve('src/content/notes');

/**
 * 从文件名中提取序号和显示名
 * "0001-虚拟内存.md" → { order: 1, title: "虚拟内存" }
 * "0001-memory-management" → { order: 1, title: "memory-management" }
 */
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

/**
 * 读取目录的 _meta.json
 */
function readMeta(dirPath: string): NoteMeta | undefined {
  const metaPath = path.join(dirPath, '_meta.json');
  if (!fs.existsSync(metaPath)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  } catch {
    return undefined;
  }
}

/**
 * 递归扫描笔记目录，生成目录树
 */
export function scanNotes(dir: string = NOTES_DIR, parentSlug: string = ''): NoteFile[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const items: NoteFile[] = [];

  for (const entry of entries) {
    // 跳过 _meta.json 和隐藏文件
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

  // 按序号排序
  items.sort((a, b) => a.order - b.order);
  return items;
}

/**
 * 扫描所有笔记（扁平化），用于列表页
 */
export interface FlatNote {
  title: string;
  slug: string;
  filePath: string;
  category: string;      // 一级目录的 title
  categoryIcon?: string;  // 一级目录的 icon
  tags: string[];         // 从 frontmatter 读取
  summary?: string;       // 从 frontmatter 读取
}

/**
 * 读取 md 文件的 frontmatter
 */
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
      // 解析数组 [a, b, c]
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map((s: string) => s.trim().replace(/['"]/g, ''));
      }
      fm[key] = value;
    }
  }
  return fm;
}

/**
 * 获取所有笔记的扁平列表（用于列表页和首页标签提取）
 */
export function getAllFlatNotes(): FlatNote[] {
  const tree = scanNotes();
  const notes: FlatNote[] = [];

  function walk(items: NoteFile[], category: string, categoryIcon?: string) {
    for (const item of items) {
      if (item.type === 'file') {
        const fm = readFrontmatter(item.filePath);
        notes.push({
          title: fm.title || item.title,
          slug: item.slug,
          filePath: item.filePath,
          category,
          categoryIcon,
          tags: Array.isArray(fm.tags) ? fm.tags : [],
          summary: fm.summary,
        });
      } else if (item.type === 'dir' && item.children) {
        // 如果是一级目录，更新 category
        const cat = item.meta?.title || item.title;
        const icon = item.meta?.icon;
        walk(item.children, category || cat, categoryIcon || icon);
      }
    }
  }

  walk(tree, '', undefined);
  return notes;
}

/**
 * 获取某个笔记的上下篇
 */
export function getPrevNext(currentSlug: string): { prev?: NoteFile; next?: NoteFile } {
  const tree = scanNotes();

  // 收集所有文件类型的笔记（按序号排序）
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
```

- [ ] **Step 2: 验证函数可用**

在项目根目录创建临时测试脚本运行验证（用完删除）：

```bash
cd D:\Desktop\暑假\个人网站
node -e "
const { scanNotes } = require('./src/lib/scan-notes.ts');
console.log(JSON.stringify(scanNotes(), null, 2));
"
```

Expected: 因为还没有新目录结构，返回空数组 `[]`

- [ ] **Step 3: 提交**

```bash
git add src/lib/scan-notes.ts
git commit -m "feat: 添加笔记目录扫描工具函数"
```

---

## Task 3: 创建 Sidebar 组件

**Files:**
- Create: `src/components/Sidebar.astro`

- [ ] **Step 1: 创建 Sidebar.astro**

```astro
---
import type { NoteFile } from '../lib/scan-notes';

interface Props {
  tree: NoteFile[];
  currentSlug: string;
}

const { tree, currentSlug } = Astro.props;
const base = import.meta.env.BASE_URL;

function renderTitle(item: NoteFile): string {
  return item.meta?.title || item.title;
}

function isActive(item: NoteFile): boolean {
  if (item.type === 'file') return item.slug === currentSlug;
  return item.children?.some(child => isActive(child)) ?? false;
}

function isOpen(item: NoteFile): boolean {
  return isActive(item) || (item.children?.some(child => isOpen(child)) ?? false);
}
---

<aside id="note-sidebar" class="hidden lg:block w-64 flex-shrink-0">
  <nav class="sticky top-20 overflow-y-auto max-h-[calc(100vh-6rem)] pr-2 pb-8
    scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
    <div class="space-y-1">
      {tree.map((item) => (
        item.type === 'dir' ? (
          <div class="sidebar-group">
            <button
              class="sidebar-toggle w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              data-open={isOpen(item) ? 'true' : 'false'}
            >
              <span class="text-base">{item.meta?.icon || '📁'}</span>
              <span class="flex-1 text-left">{renderTitle(item)}</span>
              <svg class={`w-4 h-4 transition-transform ${isOpen(item) ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            <div class={`sidebar-children ml-4 ${isOpen(item) ? '' : 'hidden'}`}>
              {item.children?.map((child) => (
                child.type === 'file' ? (
                  <a
                    href={`${base}garden/${child.slug}/`}
                    class:list={[
                      'block px-3 py-1.5 rounded-lg text-sm transition-colors',
                      child.slug === currentSlug
                        ? 'bg-garden-100 dark:bg-garden-900/40 text-garden-700 dark:text-garden-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                    ]}
                  >
                    {renderTitle(child)}
                  </a>
                ) : (
                  <div class="sidebar-subgroup">
                    <button
                      class="sidebar-toggle w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                        text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      data-open={isOpen(child) ? 'true' : 'false'}
                    >
                      <span class="text-sm">{child.meta?.icon || '📁'}</span>
                      <span class="flex-1 text-left">{renderTitle(child)}</span>
                      <svg class={`w-3 h-3 transition-transform ${isOpen(child) ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                    <div class={`sidebar-children ml-4 ${isOpen(child) ? '' : 'hidden'}`}>
                      {child.children?.map((grandchild) => (
                        <a
                          href={`${base}garden/${grandchild.slug}/`}
                          class:list={[
                            'block px-3 py-1.5 rounded-lg text-sm transition-colors',
                            grandchild.slug === currentSlug
                              ? 'bg-garden-100 dark:bg-garden-900/40 text-garden-700 dark:text-garden-400 font-semibold'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                          ]}
                        >
                          {renderTitle(grandchild)}
                        </a>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        ) : (
          <a
            href={`${base}garden/${item.slug}/`}
            class:list={[
              'block px-3 py-2 rounded-lg text-sm transition-colors',
              item.slug === currentSlug
                ? 'bg-garden-100 dark:bg-garden-900/40 text-garden-700 dark:text-garden-400 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
            ]}
          >
            {renderTitle(item)}
          </a>
        )
      ))}
    </div>
  </nav>
</aside>

<!-- 移动端侧边栏触发按钮 -->
<button
  id="sidebar-toggle-btn"
  class="lg:hidden fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg
    bg-garden-600 text-white hover:bg-garden-700 transition-colors"
  aria-label="打开目录"
>
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path>
  </svg>
</button>

<!-- 移动端侧边栏遮罩 -->
<div id="sidebar-overlay" class="lg:hidden fixed inset-0 bg-black/50 z-40 hidden"></div>

<!-- 移动端侧边栏抽屉 -->
<div id="sidebar-drawer" class="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-[#16213e] z-50 transform -translate-x-full transition-transform overflow-y-auto">
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">目录</h2>
      <button id="sidebar-close-btn" class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    <nav class="space-y-1">
      {tree.map((item) => (
        item.type === 'dir' ? (
          <div class="sidebar-group">
            <button
              class="sidebar-toggle w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              data-open={isOpen(item) ? 'true' : 'false'}
            >
              <span>{item.meta?.icon || '📁'}</span>
              <span class="flex-1 text-left">{renderTitle(item)}</span>
              <svg class={`w-4 h-4 transition-transform ${isOpen(item) ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            <div class={`sidebar-children ml-4 ${isOpen(item) ? '' : 'hidden'}`}>
              {item.children?.map((child) => (
                child.type === 'file' ? (
                  <a
                    href={`${base}garden/${child.slug}/`}
                    class:list={[
                      'block px-3 py-1.5 rounded-lg text-sm transition-colors',
                      child.slug === currentSlug
                        ? 'bg-garden-100 dark:bg-garden-900/40 text-garden-700 dark:text-garden-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                    ]}
                  >
                    {renderTitle(child)}
                  </a>
                ) : (
                  <div class="sidebar-subgroup">
                    <button
                      class="sidebar-toggle w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                        text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      data-open={isOpen(child) ? 'true' : 'false'}
                    >
                      <span class="text-sm">{child.meta?.icon || '📁'}</span>
                      <span class="flex-1 text-left">{renderTitle(child)}</span>
                      <svg class={`w-3 h-3 transition-transform ${isOpen(child) ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                    <div class={`sidebar-children ml-4 ${isOpen(child) ? '' : 'hidden'}`}>
                      {child.children?.map((grandchild) => (
                        <a
                          href={`${base}garden/${grandchild.slug}/`}
                          class:list={[
                            'block px-3 py-1.5 rounded-lg text-sm transition-colors',
                            grandchild.slug === currentSlug
                              ? 'bg-garden-100 dark:bg-garden-900/40 text-garden-700 dark:text-garden-400 font-semibold'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                          ]}
                        >
                          {renderTitle(grandchild)}
                        </a>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        ) : (
          <a
            href={`${base}garden/${item.slug}/`}
            class:list={[
              'block px-3 py-2 rounded-lg text-sm transition-colors',
              item.slug === currentSlug
                ? 'bg-garden-100 dark:bg-garden-900/40 text-garden-700 dark:text-garden-400 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
            ]}
          >
            {renderTitle(item)}
          </a>
        )
      ))}
    </nav>
  </div>
</div>

<script>
  // 目录折叠/展开
  document.querySelectorAll('.sidebar-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const children = btn.nextElementSibling;
      const arrow = btn.querySelector('svg');
      if (!children) return;

      const isOpen = children.classList.toggle('hidden');
      arrow?.classList.toggle('rotate-90', !isOpen);
      btn.setAttribute('data-open', (!isOpen).toString());
    });
  });

  // 移动端侧边栏
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const overlay = document.getElementById('sidebar-overlay');
  const drawer = document.getElementById('sidebar-drawer');
  const closeBtn = document.getElementById('sidebar-close-btn');

  function openDrawer() {
    overlay?.classList.remove('hidden');
    drawer?.classList.remove('-translate-x-full');
  }

  function closeDrawer() {
    overlay?.classList.add('hidden');
    drawer?.classList.add('-translate-x-full');
  }

  toggleBtn?.addEventListener('click', openDrawer);
  overlay?.addEventListener('click', closeDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
</script>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/Sidebar.astro
git commit -m "feat: 添加 Sidebar 目录树导航组件"
```

---

## Task 4: 创建 PrevNextNav 组件

**Files:**
- Create: `src/components/PrevNextNav.astro`

- [ ] **Step 1: 创建 PrevNextNav.astro**

```astro
---
import type { NoteFile } from '../lib/scan-notes';

interface Props {
  prev?: NoteFile;
  next?: NoteFile;
}

const { prev, next } = Astro.props;
const base = import.meta.env.BASE_URL;

function renderTitle(item: NoteFile): string {
  return item.meta?.title || item.title;
}
---

{(prev || next) && (
  <nav class="flex items-center justify-between gap-4 py-4 border-t border-gray-200 dark:border-gray-700 mt-8">
    <div class="flex-1">
      {prev && (
        <a
          href={`${base}garden/${prev.slug}/`}
          class="group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-garden-600 dark:hover:text-garden-400 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <div>
            <div class="text-xs text-gray-400 dark:text-gray-500">上一篇</div>
            <div class="font-medium group-hover:text-garden-600 dark:group-hover:text-garden-400">{renderTitle(prev)}</div>
          </div>
        </a>
      )}
    </div>
    <div class="flex-1 text-right">
      {next && (
        <a
          href={`${base}garden/${next.slug}/`}
          class="group inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-garden-600 dark:hover:text-garden-400 transition-colors"
        >
          <div>
            <div class="text-xs text-gray-400 dark:text-gray-500">下一篇</div>
            <div class="font-medium group-hover:text-garden-600 dark:group-hover:text-garden-400">{renderTitle(next)}</div>
          </div>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </a>
      )}
    </div>
  </nav>
)}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/PrevNextNav.astro
git commit -m "feat: 添加 PrevNextNav 上下篇导航组件"
```

---

## Task 5: 迁移现有笔记到新目录结构

**Files:**
- Create: `src/content/notes/0001-linux/_meta.json`
- Create: `src/content/notes/0001-linux/0001-memory-management/_meta.json`
- Create: `src/content/notes/0001-linux/0001-memory-management/0001-虚拟内存.md`
- Create: `src/content/notes/0001-linux/0001-memory-management/0002-分页机制.md`
- Create: `src/content/notes/0001-linux/0002-process-scheduling/_meta.json`
- Create: `src/content/notes/0001-linux/0002-process-scheduling/0001-CFS调度器.md`
- Delete: `src/content/notes/linux/memory-management.md`
- Delete: `src/content/notes/linux/process-scheduling.md`

- [ ] **Step 1: 创建目录结构和 _meta.json 文件**

```bash
mkdir -p "src/content/notes/0001-linux/0001-memory-management"
mkdir -p "src/content/notes/0001-linux/0002-process-scheduling"
```

创建 `src/content/notes/0001-linux/_meta.json`:
```json
{
  "title": "Linux",
  "icon": "🐧",
  "description": "Linux 内核与系统相关笔记"
}
```

创建 `src/content/notes/0001-linux/0001-memory-management/_meta.json`:
```json
{
  "title": "内存管理",
  "icon": "🧠",
  "description": "Linux 内存管理相关笔记"
}
```

创建 `src/content/notes/0001-linux/0002-process-scheduling/_meta.json`:
```json
{
  "title": "进程调度",
  "icon": "⚙️",
  "description": "Linux 进程调度机制"
}
```

- [ ] **Step 2: 迁移 memory-management.md 的内容**

将原 `src/content/notes/linux/memory-management.md` 拆分为多个笔记文件。

创建 `src/content/notes/0001-linux/0001-memory-management/0001-虚拟内存.md`:
```markdown
---
title: 虚拟内存
summary: Linux 虚拟内存机制和地址空间布局
tags: [内核, 内存, 虚拟内存]
---

# 虚拟内存

Linux 使用虚拟内存机制，每个进程都有自己独立的虚拟地址空间。

## 为什么需要虚拟内存？

1. **隔离性**：每个进程有独立的地址空间，互不干扰
2. **安全性**：防止进程访问其他进程的内存
3. **灵活性**：可以使用比物理内存更大的地址空间

## 地址空间布局

```
高地址
┌─────────────────┐
│     内核空间      │
├─────────────────┤
│      栈 ↓        │
│        ...       │
│      空闲区域     │
│        ...       │
│      堆 ↑        │
├─────────────────┤
│     BSS 段       │
├─────────────────┤
│     数据段       │
├─────────────────┤
│     代码段       │
└─────────────────┘
低地址
```
```

创建 `src/content/notes/0001-linux/0001-memory-management/0002-分页机制.md`:
```markdown
---
title: 分页机制
summary: Linux 内存分页机制，页表和 TLB
tags: [内核, 内存, 分页]
---

# 分页机制

Linux 使用分页机制管理内存：

- **页（Page）**：内存管理的基本单位，通常 4KB
- **页表（Page Table）**：虚拟地址到物理地址的映射表
- **TLB（Translation Lookaside Buffer）**：页表缓存，加速地址转换

## 与进程调度的关系

内存管理与[[CFS调度器]]密切相关：
- 调度器切换进程时需要切换页表
- 内存压力会影响调度决策
- OOM Killer 会在内存不足时杀死进程

## 待学习

- [ ] 伙伴系统（Buddy System）
- [ ] Slab 分配器
- [ ] 页面置换算法
- [ ] 内存映射（mmap）

## 参考资料

- 《深入理解 Linux 内核》第 2 章
- 《Linux 内核源代码情景分析》
```

- [ ] **Step 3: 迁移 process-scheduling.md 的内容**

创建 `src/content/notes/0001-linux/0002-process-scheduling/0001-CFS调度器.md`:
```markdown
---
title: CFS 调度器
summary: Linux 完全公平调度器的工作原理
tags: [内核, 进程, 调度, CFS]
---

# CFS 调度器

CFS（Completely Fair Scheduler）是 Linux 的默认调度策略。

## 核心思想

CFS 的核心思想是**公平性**——让每个进程都能获得公平的 CPU 时间。

关键概念：
- **虚拟运行时间（vruntime）**：记录进程已经使用的 CPU 时间
- **红黑树**：CFS 使用红黑树按 vruntime 排序所有可运行进程
- **时间片**：每个进程获得的 CPU 时间份额

```c
// 简化的 CFS 调度逻辑
struct sched_entity {
    struct rb_node run_node;  // 红黑树节点
    u64 vruntime;             // 虚拟运行时间
    // ...
};
```

## vruntime 计算公式

$$\text{vruntime} += \Delta_{exec} \times \frac{NICE\_0\_LOAD}{weight}$$

- nice 值越低，权重越高，获得的 CPU 时间越多
- 实时进程优先级高于普通进程

## 参考资料

- 《Linux 内核设计与实现》第 4 章
- 《深入理解 Linux 内核》第 7 章
```

- [ ] **Step 4: 删除旧文件**

```bash
rm src/content/notes/linux/memory-management.md
rm src/content/notes/linux/process-scheduling.md
rmdir src/content/notes/linux
```

- [ ] **Step 5: 提交**

```bash
git add src/content/notes/
git commit -m "feat: 迁移笔记到新目录结构（四位数序号+三级目录）"
```

---

## Task 6: 更新 content.config.ts 简化 schema

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: 更新 content.config.ts**

```typescript
import { defineCollection, z } from 'astro:content';

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()).default([]),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tech: z.array(z.string()).default([]),
    link: z.string().optional(),
    github: z.string().optional(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    date: z.date(),
  }),
});

export const collections = { notes, projects };
```

- [ ] **Step 2: 验证构建**

```bash
npm run build
```

Expected: 构建成功（旧的 notes 会被新目录结构中的 notes 替代）

- [ ] **Step 3: 提交**

```bash
git add src/content.config.ts
git commit -m "refactor: 简化 notes schema，移除 category/growth/created 字段"
```

---

## Task 7: 重写笔记详情页（教程式布局）

**Files:**
- Modify: `src/pages/garden/[...slug].astro`

- [ ] **Step 1: 重写 [...slug].astro**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Sidebar from '../../components/Sidebar.astro';
import PrevNextNav from '../../components/PrevNextNav.astro';
import Backlinks from '../../components/Backlinks.astro';
import { scanNotes, getPrevNext, readFrontmatter } from '../../lib/scan-notes';
import fs from 'node:fs';
import path from 'node:path';
import { render } from 'astro:content';

const base = import.meta.env.BASE_URL;

export async function getStaticPaths() {
  const tree = scanNotes();
  const paths: Array<{ params: { slug: string }; props: any }> = [];

  function walk(items: typeof tree) {
    for (const item of items) {
      if (item.type === 'file') {
        paths.push({
          params: { slug: item.slug },
          props: { noteFile: item },
        });
      } else if (item.children) {
        walk(item.children);
      }
    }
  }

  walk(tree);
  return paths;
}

const { noteFile } = Astro.props;
const currentSlug = noteFile.slug;

// 读取文件内容
const filePath = path.resolve('src/content/notes', noteFile.filePath);
const fileContent = fs.readFileSync(filePath, 'utf-8');

// 解析 frontmatter 和内容
const fmMatch = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
let frontmatter: Record<string, any> = {};
let markdownContent = fileContent;

if (fmMatch) {
  // 简单解析 YAML frontmatter
  const fmLines = fmMatch[1].split('\n');
  for (const line of fmLines) {
    const kv = line.match(/^(\w+):\s*(.+)/);
    if (kv) {
      const key = kv[1].trim();
      let value: any = kv[2].trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map((s: string) => s.trim().replace(/['"]/g, ''));
      }
      frontmatter[key] = value;
    }
  }
  markdownContent = fmMatch[2];
}

const title = frontmatter.title || noteFile.title;
const summary = frontmatter.summary || '';
const tags: string[] = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];

// 获取目录树和上下篇
const tree = scanNotes();
const { prev, next } = getPrevNext(currentSlug);

// 查找反向链接
const allFlatNotes = (await import('../../lib/scan-notes')).getAllFlatNotes();
const backlinks = allFlatNotes
  .filter(n => {
    if (n.slug === currentSlug) return false;
    const fullPath = path.resolve('src/content/notes', n.filePath);
    if (!fs.existsSync(fullPath)) return false;
    const body = fs.readFileSync(fullPath, 'utf-8');
    return body.includes(`[[${title}]]`);
  })
  .map(n => ({ title: n.title, slug: n.slug, summary: n.summary }));
---

<BaseLayout title={title} description={summary}>
  <div class="flex gap-8">
    <!-- 左侧边栏 -->
    <Sidebar tree={tree} currentSlug={currentSlug} />

    <!-- 主内容区 -->
    <article class="flex-1 min-w-0 max-w-3xl">
      <!-- 面包屑导航 -->
      <nav class="mb-6 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 flex-wrap">
        <a href={`${base}garden/`} class="hover:text-garden-600 dark:hover:text-garden-400 transition-colors">🌱 笔记</a>
        {noteFile.filePath.split('/').slice(0, -1).map((part, i, arr) => {
          // 从目录路径生成面包屑
          const dirName = part.replace(/^\d{4}-/, '');
          return (
            <>
              <span class="text-gray-300 dark:text-gray-600">/</span>
              <span class="text-gray-600 dark:text-gray-300">{dirName}</span>
            </>
          );
        })}
        <span class="text-gray-300 dark:text-gray-600">/</span>
        <span class="text-gray-700 dark:text-gray-200 font-medium">{title}</span>
      </nav>

      <!-- 文章头部 -->
      <header class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>

        {tags.length > 0 && (
          <div class="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span class="bg-garden-50 dark:bg-garden-900/30 text-garden-700 dark:text-garden-400 px-3 py-1 rounded-full text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <!-- 文章内容（由 Astro markdown 渲染） -->
      <div class="prose">
        <Fragment set:html={markdownContent} />
      </div>

      <!-- 上下篇导航 -->
      <PrevNextNav prev={prev} next={next} />

      <!-- 反向链接 -->
      <Backlinks backlinks={backlinks} />
    </article>
  </div>
</BaseLayout>
```

- [ ] **Step 2: 验证构建**

```bash
npm run build
```

Expected: 构建成功，新笔记页面可访问

- [ ] **Step 3: 提交**

```bash
git add src/pages/garden/\[...slug\].astro
git commit -m "feat: 重写笔记详情页为教程式布局（侧边栏+上下篇导航）"
```

---

## Task 8: 更新列表页适配新数据结构

**Files:**
- Modify: `src/pages/garden/index.astro`
- Modify: `src/components/NoteCard.astro`

- [ ] **Step 1: 更新 NoteCard.astro 简化 props**

```astro
---
interface Props {
  title: string;
  category: string;
  categoryIcon?: string;
  tags: string[];
  summary?: string;
  slug: string;
}

const { title, category, categoryIcon, tags, summary, slug } = Astro.props;
const base = import.meta.env.BASE_URL;
---

<a
  href={`${base}garden/${slug}/`}
  class="block bg-white dark:bg-[#16213e] rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-garden-300 dark:hover:border-garden-700 transition-all duration-200 group"
>
  <div class="flex items-start justify-between gap-3 mb-3">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-garden-700 dark:group-hover:text-garden-400 transition-colors line-clamp-2">
      {title}
    </h3>
    {category && (
      <span class="flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
        {categoryIcon || '📁'} {category}
      </span>
    )}
  </div>

  {summary && (
    <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{summary}</p>
  )}

  {tags.length > 0 && (
    <div class="flex items-center gap-1 flex-wrap">
      {tags.slice(0, 3).map((tag) => (
        <span class="inline-flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">#{tag}</span>
      ))}
    </div>
  )}
</a>
```

- [ ] **Step 2: 重写 garden/index.astro 使用新数据源**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import NoteCard from '../../components/NoteCard.astro';
import { getAllFlatNotes } from '../../lib/scan-notes';

const base = import.meta.env.BASE_URL;

const allNotes = getAllFlatNotes();

// 按一级分类分组
const categoryMap = new Map<string, typeof allNotes>();
for (const note of allNotes) {
  const cat = note.category || '其他';
  if (!categoryMap.has(cat)) categoryMap.set(cat, []);
  categoryMap.get(cat)!.push(note);
}

const categories = [
  { id: 'all', label: '全部', emoji: '📋' },
  ...Array.from(categoryMap.entries()).map(([cat, notes]) => ({
    id: cat,
    label: cat,
    emoji: notes[0]?.categoryIcon || '📁',
  })),
];

// 获取所有标签
const allTags = [...new Set(allNotes.flatMap(note => note.tags))];
---

<BaseLayout title="笔记">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
      <img src={`${base}icons/note.svg`} alt="" class="w-8 h-8 dark:invert" /> 笔记
    </h1>
    <p class="text-gray-600 dark:text-gray-300">在这里记录学习的点滴，让知识像花园一样生长</p>
  </div>

  <!-- 搜索栏 -->
  <div class="mb-6">
    <div class="relative">
      <input
        type="text"
        id="search-input"
        placeholder="搜索笔记标题、内容、标签..."
        class="w-full px-4 py-3 pl-10 bg-white dark:bg-[#16213e] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-garden-400 dark:focus:border-garden-600 focus:ring-2 focus:ring-garden-100 dark:focus:ring-garden-900/40 transition-all"
      />
      <svg class="absolute left-3 top-3.5 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
    </div>
  </div>

  <!-- 分类筛选 -->
  <div class="flex flex-wrap gap-2 mb-6" id="category-filter">
    {categories.map((cat) => (
      <button
        data-category={cat.id}
        class:list={[
          'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
          cat.id === 'all'
            ? 'bg-garden-600 dark:bg-garden-700 text-white'
            : 'bg-white dark:bg-[#16213e] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-garden-300 dark:hover:border-garden-700 hover:text-garden-700 dark:hover:text-garden-400',
        ]}
      >
        {cat.emoji} {cat.label}
      </button>
    ))}
  </div>

  <!-- 标签云 -->
  {allTags.length > 0 && (
    <div class="flex flex-wrap gap-2 mb-8" id="tag-filter">
      {allTags.map((tag) => (
        <button
          data-tag={tag}
          class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs hover:bg-garden-100 dark:hover:bg-garden-900/40 hover:text-garden-700 dark:hover:text-garden-400 transition-colors whitespace-nowrap"
        >
          #{tag}
        </button>
      ))}
    </div>
  )}

  <!-- 笔记列表 -->
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" id="notes-grid">
    {allNotes.map((note) => (
      <div
        class="note-item"
        data-category={note.category}
        data-tags={note.tags.join(',')}
        data-title={note.title}
        data-summary={note.summary || ''}
      >
        <NoteCard
          title={note.title}
          category={note.category}
          categoryIcon={note.categoryIcon}
          tags={note.tags}
          summary={note.summary}
          slug={note.slug}
        />
      </div>
    ))}
  </div>

  <!-- 空状态 -->
  <div id="empty-state" class="hidden text-center py-12">
    <div class="text-4xl mb-4">🌿</div>
    <p class="text-gray-500 dark:text-gray-400">没有找到匹配的笔记</p>
    <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">试试其他搜索词或分类</p>
  </div>
</BaseLayout>

<script>
  // 分类筛选
  const categoryButtons = document.querySelectorAll('#category-filter button');
  const tagButtons = document.querySelectorAll('#tag-filter button');
  const noteItems = document.querySelectorAll('.note-item');
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const emptyState = document.getElementById('empty-state');

  let activeCategory = 'all';
  let activeTag: string | null = null;

  function filterNotes() {
    const searchTerm = searchInput?.value.toLowerCase() || '';
    let visibleCount = 0;

    noteItems.forEach((item) => {
      const el = item as HTMLElement;
      const category = el.dataset.category || '';
      const tags = el.dataset.tags || '';
      const title = el.dataset.title?.toLowerCase() || '';
      const summary = el.dataset.summary?.toLowerCase() || '';

      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const matchesTag = !activeTag || tags.split(',').includes(activeTag);
      const matchesSearch = !searchTerm ||
        title.includes(searchTerm) ||
        summary.includes(searchTerm) ||
        tags.includes(searchTerm);

      if (matchesCategory && matchesTag && matchesSearch) {
        el.style.display = '';
        visibleCount++;
      } else {
        el.style.display = 'none';
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('hidden', visibleCount > 0);
    }
  }

  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = (btn as HTMLElement).dataset.category || 'all';
      activeCategory = category;

      const isDark = document.documentElement.classList.contains('dark');

      categoryButtons.forEach((b) => {
        const isActive = (b as HTMLElement).dataset.category === category;
        if (isActive) {
          b.className = 'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-garden-600 dark:bg-garden-700 text-white';
        } else {
          b.className = isDark
            ? 'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-[#16213e] text-gray-300 border border-gray-700 hover:border-garden-700 hover:text-garden-400'
            : 'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-white text-gray-600 border border-gray-200 hover:border-garden-300 hover:text-garden-700';
        }
      });

      filterNotes();
    });
  });

  tagButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tag = (btn as HTMLElement).dataset.tag || '';
      activeTag = activeTag === tag ? null : tag;

      const isDark = document.documentElement.classList.contains('dark');

      tagButtons.forEach((b) => {
        const isActive = (b as HTMLElement).dataset.tag === activeTag;
        if (isActive) {
          b.className = 'px-3 py-1 bg-garden-600 dark:bg-garden-700 text-white rounded-full text-xs transition-colors whitespace-nowrap';
        } else {
          b.className = isDark
            ? 'px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs hover:bg-garden-900/40 hover:text-garden-400 transition-colors whitespace-nowrap'
            : 'px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-garden-100 hover:text-garden-700 transition-colors whitespace-nowrap';
        }
      });

      filterNotes();
    });
  });

  searchInput?.addEventListener('input', filterNotes);
</script>
```

- [ ] **Step 3: 提交**

```bash
git add src/pages/garden/index.astro src/components/NoteCard.astro
git commit -m "feat: 更新列表页和 NoteCard 适配新目录结构"
```

---

## Task 9: 更新首页适配新数据结构

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: 更新 index.astro 的笔记数据源**

修改 `src/pages/index.astro` 的 frontmatter 部分，将 `getCollection('notes')` 替换为 `getAllFlatNotes()`：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';
import { getAllFlatNotes } from '../lib/scan-notes';

const base = import.meta.env.BASE_URL;

// 使用新的目录扫描方式获取笔记
const allFlatNotes = getAllFlatNotes();
const recentNotes = allFlatNotes.slice(0, 6);

const featuredProjects = (await getCollection('projects'))
  .filter(p => p.data.featured)
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 4);

// 从笔记和项目中提取所有标签，按频率排序
const tagFrequency: Record<string, number> = {};
allFlatNotes.forEach(note => {
  note.tags.forEach(tag => {
    tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
  });
});
const allProjects = await getCollection('projects');
allProjects.forEach(project => {
  project.data.tech.forEach(tech => {
    tagFrequency[tech] = (tagFrequency[tech] || 0) + 1;
  });
});

const sortedTags = Object.entries(tagFrequency)
  .sort((a, b) => b[1] - a[1])
  .map(([tag]) => tag);

const displayTags = sortedTags.slice(0, 12);
const remainingTags = sortedTags.slice(12);
---
```

然后更新"最近笔记"部分的渲染，将 `note.data.title` 改为 `note.title`，`note.data.created.toLocaleDateString` 改为去掉日期显示（新结构没有 created 字段），`note.id.replace(/\.md$/, '')` 改为 `note.slug`：

```astro
<!-- 最近笔记 -->
<section class="mb-12">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
      <span class="text-garden-600 dark:text-garden-400">🌱</span> 最近笔记
    </h2>
    <a href={`${base}garden/`} class="text-sm text-garden-600 dark:text-garden-400 hover:text-garden-500 dark:hover:text-garden-300 font-medium">
      查看全部 →
    </a>
  </div>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {recentNotes.map((note) => (
      <a
        href={`${base}garden/${note.slug}/`}
        class="block bg-white dark:bg-[#16213e] rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-garden-300 dark:hover:border-garden-700 transition-all duration-200 group"
      >
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs text-gray-400 dark:text-gray-500">{note.categoryIcon || '📁'}</span>
          <span class="text-xs text-gray-400 dark:text-gray-500">{note.category}</span>
        </div>
        <h3 class="font-medium text-gray-900 dark:text-white group-hover:text-garden-700 dark:group-hover:text-garden-400 transition-colors line-clamp-2 mb-2">
          {note.title}
        </h3>
        {note.summary && (
          <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{note.summary}</p>
        )}
      </a>
    ))}
  </div>
</section>
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/index.astro
git commit -m "feat: 更新首页适配新笔记目录结构"
```

---

## Task 10: 添加代码块复制按钮和 KaTeX 样式

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css` (如果存在) 或直接在 BaseLayout 中添加

- [ ] **Step 1: 在 BaseLayout.astro 的 `<head>` 中添加 KaTeX CSS**

在 `<head>` 部分添加：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" crossorigin="anonymous">
```

- [ ] **Step 2: 在 BaseLayout.astro 的 `<style is:global>` 中添加代码块复制按钮样式和 Shiki 双主题支持**

在 `<style is:global>` 部分添加：

```css
/* Shiki 双主题：亮色/暗色 */
html.dark .shiki,
html.dark .shiki span {
  background-color: var(--shiki-dark-bg) !important;
  color: var(--shiki-dark) !important;
}
html.dark .shiki .line,
html.dark .shiki span {
  color: var(--shiki-dark) !important;
}

/* 代码块容器 */
pre {
  position: relative;
}

/* 复制按钮 */
.code-copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #9ca3af;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
}

pre:hover .code-copy-btn {
  opacity: 1;
}

.code-copy-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.code-copy-btn.copied {
  color: #4ade80;
}

/* h2 标题分割线 */
.prose h2 {
  @apply pb-2 border-b border-gray-200 dark:border-gray-700;
}

/* 表格斑马纹 */
.prose table {
  @apply rounded-lg overflow-hidden;
}
.prose tbody tr:nth-child(even) {
  @apply bg-gray-50 dark:bg-gray-800/50;
}

/* 引用块 */
.prose blockquote {
  @apply border-l-4 border-garden-500 bg-garden-50 dark:bg-garden-900/20 rounded-r-lg;
}
```

- [ ] **Step 3: 在 BaseLayout.astro 的 `<script>` 中添加代码块复制功能**

在已有的 script 部分末尾添加：

```javascript
// 代码块复制按钮
document.querySelectorAll('pre').forEach(pre => {
  if (pre.querySelector('.code-copy-btn')) return;

  const btn = document.createElement('button');
  btn.className = 'code-copy-btn';
  btn.textContent = '复制';
  btn.addEventListener('click', async () => {
    const code = pre.querySelector('code')?.textContent || pre.textContent || '';
    try {
      await navigator.clipboard.writeText(code);
      btn.textContent = '✓ 已复制';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = '复制';
        btn.classList.remove('copied');
      }, 1500);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.textContent = '✓ 已复制';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = '复制';
        btn.classList.remove('copied');
      }, 1500);
    }
  });

  pre.appendChild(btn);
});
```

- [ ] **Step 4: 验证构建**

```bash
npm run build
```

Expected: 构建成功，KaTeX CSS 加载正常，代码块有复制按钮

- [ ] **Step 5: 提交**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: 添加 KaTeX 样式、代码块复制按钮和 Shiki 双主题支持"
```

---

## Task 11: 最终验证和部署

**Files:**
- None (验证步骤)

- [ ] **Step 1: 完整构建验证**

```bash
cd D:\Desktop\暑假\个人网站
npm run build
```

Expected: 所有页面构建成功，无错误

- [ ] **Step 2: 本地预览验证**

```bash
npm run dev
```

访问 http://localhost:4321/personal-garden/ 验证：
- 首页显示笔记卡片正常
- 笔记列表页显示所有笔记
- 点击笔记进入教程式详情页
- 侧边栏目录树显示正确
- 上下篇导航正常
- KaTeX 公式渲染正常
- 代码块有复制按钮
- 暗黑模式切换正常
- 响应式布局正常

- [ ] **Step 3: 提交并推送**

```bash
git add -A
git commit -m "feat: 笔记系统重构完成 - 菜鸟教程风格"
git push origin main
```

- [ ] **Step 4: 验证 GitHub Pages 部署**

```bash
gh run list --limit 1
gh run watch <run-id> --exit-status
```

Expected: 部署成功，访问 https://tommie-p-xl.github.io/personal-garden/ 正常
