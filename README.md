<div align="center">

# Tommie 的个人数字花园

**一处持续生长的笔记、项目与学习记录。**

[在线访问](https://tommie-p-xl.github.io/personal-garden/) · [GitHub 主页](https://github.com/Tommie-P-xl) · [项目列表](https://tommie-p-xl.github.io/personal-garden/projects/)

![Astro](https://img.shields.io/badge/Astro-5.x-BC52EE?logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-content%20tools-3178C6?logo=typescript&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-222?logo=github&logoColor=white)

</div>

---

## 关于这个项目

这是一个以长时间阅读为目标的个人网站，收录学习笔记、项目记录和它们之间的关联。界面采用纸质阅读风格，并支持明亮与暗夜主题；笔记通过 Markdown / MDX 编写，构建为静态页面并部署到 GitHub Pages。

## 内容与功能

- **笔记花园**：按目录组织 Markdown 与 MDX 笔记，支持标签、摘要和草稿状态。
- **Wiki 双向链接**：使用 `[[笔记标题]]` 建立笔记关联，并生成反向链接。
- **阅读工具**：标题 / 摘要 / 标签搜索、目录导航、上下篇跳转、LaTeX 公式和代码高亮。
- **MDX 组件**：在笔记中使用提示框、标签页、折叠面板、媒体、表格和进度等组件。
- **媒体管理**：支持笔记目录中的 `_media` 文件，并在构建时复制到站点输出。
- **项目展示**：从 Markdown 内容生成项目卡片，并展示公开 GitHub 仓库信息。
- **主题与响应式布局**：明亮 / 暗夜主题，桌面和移动端均可阅读。
- **构建前内容检查**：检查失效 Wiki 链接、缺失媒体、重复标题或 slug，以及引用草稿的链接。

## 技术栈

| 部分 | 技术 |
| --- | --- |
| 网站与构建 | [Astro](https://astro.build/) 5、TypeScript |
| 样式 | [Tailwind CSS](https://tailwindcss.com/) |
| 内容 | Markdown、MDX、gray-matter |
| 数学与代码 | KaTeX、Shiki |
| 发布 | GitHub Actions、GitHub Pages |

## 本地运行

需要 Node.js 22 和 npm。

```bash
git clone https://github.com/Tommie-P-xl/personal-garden.git
cd personal-garden
npm ci
npm run dev
```

开发服务器默认地址为 `http://localhost:4321/personal-garden/`。

常用命令：

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run check:content` | 单独检查笔记内容 |
| `npm run build` | 内容检查、媒体复制并构建生产站点 |
| `npm run preview` | 本地预览生产构建 |

## 添加笔记

在 `src/content/notes/` 下按主题创建 `.md` 或 `.mdx` 文件，并添加 frontmatter：

```yaml
---
title: 笔记标题
tags: [主题]
summary: 一句话摘要
draft: false
---
```

笔记之间可用 `[[目标笔记标题]]` 链接。图片、音视频或文档放在相邻目录的 `_media/` 中，并使用相对路径引用。运行 `npm run check:content` 可在提交前检查内容引用；`npm run build` 会自动执行同一检查，发现问题时构建失败并给出文件位置。

项目介绍放在 `src/content/projects/` 下，每个 Markdown 文件对应一张项目卡，字段定义见 `src/content.config.ts`。

## 笔记可视化与维护模板

概念分类使用 **KnowledgeMap 知识卡片**，流程与状态变化使用 **Mermaid**（[官方语法](https://mermaid.js.org/intro/)）。不再用空格与字符边框拼流程图。矩阵组合等纯数据使用表格。

```mdx
<KnowledgeMap data={{
  name: "Git 五大区域",
  children: [
    { name: "工作区", description: "编辑文件的地方", command: "git status · git diff" },
    { name: "暂存区", description: "准备提交的内容", children: [
      { name: "添加修改", command: "git add <file>" }
    ] }
  ]
}} />
```

- `name` 必填；`description` 始终显示；`detail` 展开后显示；`command` 放短命令；`children` 递归。字段为纯文本，不解析 Markdown。
- 多列自适应、长文字换行，使用原生 `<details>` 折叠，关闭 JavaScript 仍可阅读。
- 旧 `BraceMap` 保留为相同卡片的兼容入口，原固定节点宽度/配色参数不再生效。新笔记统一使用 `KnowledgeMap`。

Markdown 和 MDX 均可直接写，无需 import：

````md
```mermaid title="提交流程"
flowchart LR
  accTitle: 提交流程
  A["修改文件"] -->|git add| B["暂存修改"]
  B -->|git commit| C["记录版本"]
```
````

- 默认居中；长流程建议 `flowchart TB`，宽图在图内滚动。图表可放大、缩放与适应窗口；Escape 关闭并恢复按钮焦点，专注模式保持。
- 图进入视口附近才加载本地打包的 Mermaid；无需第三方 CDN。主题切换后重新绘制，支持 Astro 页面导航。
- 保留可展开、可复制的源码。禁用 JavaScript、网络加载失败或语法错误时显示源码降级。SVG 使用 strict 安全模式；笔记不使用 HTML 标签、脚本或 click 回调。
- 完整示例见站内“MDX 组件说明”；维护规则及字段模板位于 `.claude/skills/note-to-mdx/SKILL.md` 与 `component-reference.md`。
- 实现位于 `src/lib/remark-diagrams.ts`、`src/scripts/diagrams.ts`、`src/components/mdx/KnowledgeMap.astro` 和 `src/styles/diagrams.css`。

## 个人资料维护

首页和关于页的教育信息使用英文，日期保留原经历；在读项目标记预计毕业。联系方式使用邮箱、GitHub 和 [X · @wux4948](https://x.com/wux4948)。首页资料位于 `src/pages/index.astro`，完整教育经历位于 `src/pages/about.astro`。项目介绍中的第三方渠道说明仍按项目实际功能撰写。

## 构建与部署

GitHub Actions 在推送到 `main`、针对 `main` 创建或更新 Pull Request，以及手动触发时运行生产构建。Pull Request 执行单元测试、双部署构建、静态链接与浏览器回归；合并到 `main` 后，检查通过才部署 GitHub Pages。

站点地址：[tommie-p-xl.github.io/personal-garden](https://tommie-p-xl.github.io/personal-garden/)

## 项目结构

```text
src/
├── components/       # 页面与 MDX 组件
├── content/
│   ├── notes/        # Markdown / MDX 笔记与媒体
│   └── projects/     # 项目介绍
├── layouts/          # 页面布局
├── lib/              # Wiki 链接、媒体处理、GitHub 数据等
├── scripts/          # 主题、抽屉、搜索委托与阅读模式
├── styles/           # 主题变量、阅读排版与组件规则
└── pages/            # 首页、笔记、项目与关于页面
scripts/
├── check-content.js  # 构建前内容检查
└── verify-integration.ts # 双部署与浏览器回归
tests/                 # 内容规则与浏览器用例
```

## 许可

网站代码与内容主要用于个人展示和学习记录。引用的第三方资料仍归其原作者或版权方所有。

## 页面与交互约定

- 配色、排版与组件样式位于 `src/styles/site.css`；页面共享 `paper-surface`、`paper-tag` 等明确样式类。导航和笔记分类共用线性图标。
- 首页展示最近更新、人工排序的精选研究项目与主题分类。最近日期优先读取笔记 `updated`，否则读取完整 Git 历史；浅克隆或源码压缩包没有日期时显示“笔记选读”，不把检出时间当成更新时间。
- 项目的 `featuredOrder` 数字越小越靠前；项目卡片使用真实图片或标明“流程示意”的结构图。技术标签默认展示四个，其他可展开。
- 笔记正文从 `##` 开始。为兼容旧笔记，构建时移除开头的重复一级标题，其余一级标题降为二级；原有页面哈希地址保持不变。
- 目录树、计数、搜索、上下篇与 Wiki 链接共用已发布笔记。`draft: true` 不会进入公开导航或搜索元数据。
- `_meta.json` 可添加 `"kind": "documentation"`，把组件演示单列到笔记页的“组件文档”入口。
- 标签统一 Git、GitHub Actions 等名称，搜索链接支持 `?search=关键词&tag=标签`，并在前进后退和页面切换后同步。
- 关闭的移动目录为 `inert` 且从辅助技术隐藏；打开时管理焦点、锁定背景滚动，关闭后恢复。
- 图片、视频与附件统一从源笔记目录解析 `./_media/`、`../_media/` 路径。同名文件不会全局匹配；缺失文件或越界路径会令构建失败。静态 MDX 属性和标准 Markdown 均受支持。

## 回归验证

```bash
npm test                  # 路径、草稿过滤、媒体和标题规则
npx playwright install chromium
npm run test:integration  # 临时草稿与同名附件 + 两种部署构建 + 浏览器测试
```

集成测试创建独立的临时笔记目录，结束后自动清理；测试构建输出写入 `.review-builds/`，正式输出仍为 `dist/`。

GitHub Pages 默认使用 `/personal-garden/`；Cloudflare Pages 构建需设置 `DEPLOY_TARGET=cloudflare`。两个环境运行相同的回归用例。

## 技术笔记阅读布局

笔记详情页采用宽屏布局，首页、项目页和目录索引保留各自的宽度。正文保留桌面 17px、手机 16px 字号，通过增加可用宽度来容纳长命令、表格、公式和代码。

| 浏览器视口宽度 | 笔记目录 | 文章章节目录 | 正文与页面宽度 |
| --- | --- | --- | --- |
| 1600px 及以上 | 左侧常驻，200px | 右侧常驻，176px | 页面最大 1680px；正文最大 1040px |
| 1280–1599px | 左侧常驻，200px | 通过浮动按钮打开抽屉 | 优先分配空间给正文，上限 1040px |
| 小于 1280px | 通过浮动按钮打开抽屉 | 通过浮动按钮打开抽屉 | 单栏，自适应屏幕；手机保留 17px 内边距 |

- 桌面文章卡片的内边距为 28px，手机仍为上下 20px、左右 17px；正文和标题对齐。
- 点击文章顶部的 **专注阅读** 可收起两侧目录和目录按钮，页面最大 1360px，正文最大 1200px，适合长代码与宽表格。
- 再次点击 **退出专注** 或按 `Escape` 可恢复默认布局。恢复后仍按视口大小决定显示常驻目录或抽屉入口。
- 阅读偏好保存在本机 `localStorage` 的 `garden-reading-mode`，刷新和笔记间导航时保留；不会改变首页与项目页的布局。禁用存储时，本次页面仍可切换模式。
- 目录抽屉打开时锁定背景滚动并限制焦点；关闭、换页或进入常驻目录的宽度区间时恢复。文章目录断点为 1600px，笔记目录断点为 1280px。
- 阅读模式逻辑位于 `src/scripts/reading-mode.ts`，布局规则位于 `src/styles/site.css`。`--note-content-width` 统一控制笔记标题与正文上限，不需要缩小字号。

### 回归范围

`npm run test:integration` 为 GitHub Pages 和 Cloudflare 分别构建同一套临时用例，并检查：

- 搜索结果路径、查询参数、标签、前进后退及页面切换后的搜索状态；
- 目录抽屉的关闭状态、焦点循环、Escape 和滚动恢复；
- 单一主标题、目录高亮、主题持久化、技术标签展开与响应式页面；
- 草稿元数据及路由隔离，以及同名媒体的源笔记相对路径；
- 1440px / 1920px 正文宽度、1024px 单栏布局、目录断点切换；
- 专注阅读的加宽、刷新和跨笔记持久化、退出状态及手机端溢出检查；
- 全部已发布图表的渲染、明暗重绘、手机溢出、放大缩放与关闭焦点；
- Markdown 图表语法错误降级、旧结构图兼容、X 联系方式与英文教育信息。

测试使用 Chromium，覆盖桌面与手机尺寸；这不等同于所有浏览器的兼容性认证。发布工作流使用完整 Git 历史计算最近笔记日期，测试通过后再上传正式 `dist/` 并发布。
