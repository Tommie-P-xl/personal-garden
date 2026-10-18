---
title: 个人数字花园
description: Astro 驱动的个人笔记与项目网站，支持 Markdown / MDX、笔记互链、搜索和明暗主题。
tech: [Astro, TypeScript, Tailwind CSS, Markdown, MDX, GitHub Pages]
github: https://github.com/Tommie-P-xl/personal-garden
link: https://tommie-p-xl.github.io/personal-garden/
featured: true
date: 2026-07-13
---

## 项目简介

个人数字花园用于整理持续更新的学习笔记并展示项目。页面以纸质阅读风格呈现，支持明亮与暗夜主题；内容通过 Markdown 和 MDX 维护，构建为静态网站。

## 当前能力

- 目录导航、全文搜索、标签、目录锚点、上下篇和反向链接。
- 通过 `[[笔记标题]]` 创建 Wiki 链接，并支持 LaTeX 数学公式和语法高亮。
- 可在 MDX 中使用提示框、标签页、折叠面板、表格、媒体等内容组件。
- 构建前检查失效 Wiki 链接、缺失媒体、重复标题 / slug 和指向草稿的引用。
- GitHub Actions 对 Pull Request 执行构建检查，合并到 `main` 后部署 GitHub Pages。

## 技术

Astro、TypeScript、Tailwind CSS、Astro Content Collections、KaTeX、Shiki 与 GitHub Actions。
