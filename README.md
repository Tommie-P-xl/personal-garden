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
- **阅读工具**：全文搜索、目录导航、上下篇跳转、LaTeX 公式和代码高亮。
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

## 构建与部署

GitHub Actions 在推送到 `main`、针对 `main` 创建或更新 Pull Request，以及手动触发时运行生产构建。Pull Request 只检查构建；合并到 `main` 后才部署 GitHub Pages。

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
└── pages/            # 首页、笔记、项目与关于页面
scripts/
└── check-content.js  # 构建前内容检查
```

## 许可

网站代码与内容主要用于个人展示和学习记录。引用的第三方资料仍归其原作者或版权方所有。
