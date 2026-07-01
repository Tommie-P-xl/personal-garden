---
title: 个人数字花园网站
description: 使用 Astro 构建的 Digital Garden 风格个人网站，用于记录学习笔记和展示项目
tech: [Astro, Tailwind CSS, TypeScript, GitHub Pages]
github: https://github.com/Tommie-P-xl/personal-garden
link: https://tommie-p-xl.github.io/personal-garden
featured: true
date: 2025-06-25
---

## 项目简介

这是一个 Digital Garden（数字花园）风格的个人网站，用于记录学习笔记、展示项目经历。

## 核心功能

### 笔记生长系统

笔记有三种生长状态：
- **种子（Seed）**：刚开始记录，几句话/几个要点
- **发芽（Sprout）**：内容基本成型，有结构但不完整
- **成熟（Evergreen）**：内容完整，可作为参考资料

### 双向链接

使用 `[[笔记名]]` 语法在笔记之间建立链接，形成知识网络。系统会自动生成反向链接，展示哪些笔记引用了当前笔记。

### 关系图谱

通过可视化图谱展示笔记之间的链接关系，帮助发现知识之间的关联。

### 全文搜索

支持搜索笔记标题、内容和标签，快速找到需要的信息。

## 技术栈

- **Astro**：静态站点生成器，零 JS 默认，按需加载
- **Tailwind CSS**：原子化 CSS 框架
- **TypeScript**：类型安全
- **GitHub Pages**：免费静态托管
- **GitHub Actions**：自动构建部署

## 项目结构

```
src/
├── content/
│   ├── notes/          # 笔记内容
│   └── projects/       # 项目展示
├── components/         # UI 组件
├── layouts/            # 页面布局
└── pages/              # 路由页面
```

## 部署流程

1. 本地编写 Markdown 笔记
2. Git Push 到 GitHub
3. GitHub Actions 自动构建
4. 部署到 GitHub Pages

## 未来计划

- [ ] 暗色模式
- [ ] RSS 订阅
- [ ] 评论系统
- [ ] 访问统计
