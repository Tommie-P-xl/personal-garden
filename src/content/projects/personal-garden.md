---
title: 个人数字花园
description: 基于 Astro 的静态数字花园，把 Markdown / MDX 学习笔记、双向知识链接和项目档案组织成一套可持续维护的个人网站。
tech: [Astro, TypeScript, Tailwind CSS, Astro Content Collections, Markdown, MDX, KaTeX, Shiki, GitHub Actions]
github: https://github.com/Tommie-P-xl/personal-garden
link: https://tommie-p-xl.github.io/personal-garden/
featured: true
date: 2026-07-13
---

## 项目定位

个人数字花园是一个围绕“持续整理、彼此链接、随写随改”设计的学习笔记与项目展示网站。它不把内容限制为按发布时间排列的文章：读者可以从主题目录进入一组笔记，也可以沿着笔记中的 Wiki 链接、反向链接和上下篇关系继续阅读。站点用 Astro 预先生成静态页面，笔记与项目详情则保存在仓库里的 Markdown / MDX 文件中，内容和页面代码可以一起审阅、版本管理与发布。

## 阅读体验与页面

- **首页**汇总个人介绍、笔记分类、常用标签和精选项目，作为进入不同内容区域的入口。
- **笔记首页**展示顶层分类及笔记数量，并提供按标题、摘要、分类和标签等已索引字段进行的本地搜索与标签筛选。
- **分类页与笔记页**从目录结构生成。笔记页包含当前分类导航、文章目录、上一篇 / 下一篇和反向链接；桌面端可并排阅读，窄屏将侧栏与目录收纳为抽屉入口。
- **项目页**从项目内容集合生成，支持按项目名称、技术栈和简介筛选；卡片按 GitHub Star 数和项目日期排序。单个项目有独立详情页，可展示说明、技术栈、源码链接及可选封面。
- **关于页**承载个人介绍与联系方式。全站采用暖纸色、墨色文字和低饱和强调色，支持亮色、暗色及跟随系统三种主题；主题选择会保存在浏览器中。

## 内容如何变成页面

### 笔记目录与路由

笔记放在 `src/content/notes/`，支持 `.md` 和 `.mdx`。`src/lib/scan-notes.ts` 递归读取目录，按文件名中的四位序号排序，并将文件夹组织为分类树；文件夹内的 `_meta.json` 可提供面向读者的分类标题和说明。Astro Content Collection 负责校验笔记的 `title`、`tags`、`summary` 和 `draft` 等 frontmatter 字段。

构建时，`src/pages/garden/[...slug].astro` 为公开笔记和分类生成静态路由。内部分类和文件路径通过确定性哈希映射为短路由标识；目录树仍保留原始路径，用于生成导航、上一篇 / 下一篇和内容链接。`src/lib/scan-notes.ts` 还会整理笔记元数据并建立反向引用索引。

### Wiki 链接、搜索与媒体

在笔记中写 `[[笔记标题]]`，`src/lib/remark-wiki-links.ts` 会在 Markdown 编译阶段查找标题并转换为站内链接；若目标暂时不存在，链接会带着搜索词转到笔记页，便于继续查找。内容检查会进一步确认被引用标题确实唯一存在，且没有指向草稿。

笔记首页的搜索数据由目录扫描结果和 frontmatter 汇总，供浏览器端按标题、摘要、分类与标签筛选；它不是对正文全文建立索引。媒体通常与笔记放在同级 `_media/` 目录中，`remark-media` 会处理受支持的相对图片 / HTML 媒体引用，`scripts/copy-media.js` 会在构建前把各处 `_media` 文件复制到 `public/media/`，并保留相对目录关系。

### Markdown / MDX 扩展

`src/layouts/NoteLayout.astro` 为 MDX 注册了站点组件：提示框、标签页、折叠面板、代码块、图库、进度条、结构图、数学公式、表格、图片和音视频媒体。数学内容由 Remark Math 与 KaTeX 处理，标题由 rehype 插件生成锚点，外链增加安全属性，代码高亮使用 Shiki 的浅色 / 深色主题。

## 内容维护与质量门禁

新增笔记时，在 `src/content/notes/` 的主题目录中创建带序号的 Markdown / MDX 文件，填写必需的 `title`，并按需补充 `tags`、`summary`、`draft`；需要调整分类显示名称或说明时，编辑对应目录的 `_meta.json`。附件放进笔记的 `_media/` 子目录，并使用相对路径引用。

新增或更新项目时，在 `src/content/projects/` 添加 Markdown 文件。项目集合要求 `title`、`description` 和 `date`，并可选填 `tech`、`github`、`link`、`image` 与 `featured`。首页精选项目和项目详情都由这份内容生成，不必在页面模板中重复维护项目文字。

运行 `npm run build` 时，第一步执行 `scripts/check-content.js`。它扫描笔记 frontmatter 与路径，检查缺少标题、重复标题、重复 slug、无目标或有歧义的 Wiki 链接、引用草稿，以及越界或不存在的媒体文件；有错误时以非零状态退出，后续构建不会继续。该脚本聚焦笔记内容，项目 frontmatter 的结构校验由 Astro Content Collection 在 Astro 构建阶段执行。

## 技术与发布流程

页面使用 Astro 5 静态输出，布局与组件使用 Astro / TypeScript，内容数据由 Astro Content Collections 管理，Tailwind CSS 提供样式工具。Remark / Rehype 插件把 Wiki 链接、媒体、数学公式、标题锚点和外链规则接入 Markdown 编译流程。静态生成适合直接托管，也让笔记正文不依赖运行时数据库。

GitHub Actions 在针对 `main` 的 Pull Request 上执行 Node.js 22 环境安装和 `npm run build`，构建成功后上传 Pages 构建产物，但不会在 PR 上部署。推送到 `main` 或手动触发工作流时，构建任务通过后才部署 GitHub Pages。当前站点的 GitHub Pages 地址使用仓库路径前缀 `/personal-garden/`；Astro 配置也保留了通过 `DEPLOY_TARGET=cloudflare` 切换站点域名与根路径的分支。

## 本地运行

```bash
npm ci
npm run dev
```

开发服务器默认提供热更新。提交内容前可单独运行检查，完整构建后可用 Astro 预览静态产物：

```bash
npm run check:content
npm run build
npm run preview
```

## 关键目录

| 路径 | 职责 |
| --- | --- |
| `src/content/notes/` | Markdown / MDX 笔记、分类目录元数据与笔记媒体 |
| `src/content/projects/` | 项目详情及其结构化 frontmatter |
| `src/content.config.ts` | 笔记与项目内容集合的字段约束 |
| `src/lib/scan-notes.ts` | 笔记目录树、元数据、前后篇与反向链接索引 |
| `src/lib/remark-wiki-links.ts`、`remark-media.ts` | Markdown 编译期间处理 Wiki 链接和媒体引用 |
| `src/components/mdx/` | 笔记中可用的 MDX 扩展组件 |
| `scripts/check-content.js`、`copy-media.js` | 构建前笔记质量检查与媒体整理 |
| `.github/workflows/deploy.yml` | PR 构建检查与 GitHub Pages 发布工作流 |
