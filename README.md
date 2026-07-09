# 个人数字花园

Digital Garden 风格的个人网站，用于记录学习笔记和展示项目。采用菜鸟教程风格的教程式布局，左侧目录树 + 右侧内容区。

**在线访问**:
- Cloudflare Pages: https://tommie-p-xl.pages.dev/ （国内推荐，访问更快）
- GitHub Pages: https://tommie-p-xl.github.io/personal-garden/

## 功能特性

- **教程式布局** — 左侧目录树 + 右侧子标题导航，支持三级子目录
- **MDX 支持** — 在笔记中嵌入自定义组件（提示框、标签页、折叠面板等）
- **双向链接** — `[[笔记标题]]` 语法，笔记之间互相引用
- **反向链接** — 自动构建反向链接索引，展示哪些笔记引用了当前笔记
- **全文搜索** — 支持搜索笔记标题、摘要、标签
- **标签分类** — 按主题组织笔记
- **LaTeX 公式** — `$行内$` 和 `$$块级$$` 数学公式渲染（KaTeX）
- **代码高亮** — Shiki 多语言语法高亮，支持亮色/暗色双主题
- **暗黑模式** — 支持亮色/暗色/跟随系统三种模式
- **View Transitions** — 页面切换动画，导航指示条跨页滑动
- **响应式设计** — 桌面端侧边栏 + 移动端抽屉式导航
- **项目展示** — 项目卡片展示，支持 GitHub 链接和外部链接
- **GitHub Stars** — 构建时自动获取项目 Star 数量（带 24h 本地缓存）
- **Sitemap** — 自动生成站点地图，利于 SEO
- **URL掩码** — 自动生成16位哈希短码URL，隐藏真实目录结构
- **媒体文件支持** — 每级目录各自的 `_media` 文件夹，支持图片、视频、文档等
- **LaTeX对齐** — 块级公式支持左对齐、居中、右对齐
- **表格样式** — Markdown 表格自动转换为带样式的 HTML 表格，支持对齐和标题
- **图片路径** — 支持相对路径、绝对路径和外部 URL

## 技术栈

| 技术 | 用途 |
|------|------|
| [Astro](https://astro.build/) | 静态站点生成器 |
| [Tailwind CSS](https://tailwindcss.com/) | CSS 框架 |
| [gray-matter](https://github.com/jonschlinkert/gray-matter) | Frontmatter 解析 |
| [KaTeX](https://katex.org/) | LaTeX 数学公式渲染 |
| [Shiki](https://shiki.style/) | 代码语法高亮 |
| [d3.js](https://d3js.org/) | 数据可视化（BraceMap 组件） |
| [Cloudflare Pages](https://pages.cloudflare.com/) | 托管服务（国内推荐） |
| [GitHub Pages](https://pages.github.com/) | 托管服务 |

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 一键部署

项目提供 `deploy.ps1` 脚本，方便一键构建并部署到 GitHub Pages。

### 使用方法

```powershell
# 默认部署（自动构建 + 提交 + 推送）
.\deploy.ps1

# 自定义提交信息
.\deploy.ps1 -Message "feat: 添加 Python 笔记"

# 跳过本地构建（快速提交）
.\deploy.ps1 -SkipBuild -Message "docs: 更新文档"

# 只提交不推送
.\deploy.ps1 -SkipPush
```

### 脚本流程

```
deploy.ps1
│
├─ 1. 环境检查
│     ├─ Node.js 是否安装
│     ├─ npm 是否安装
│     └─ Git 是否安装
│
├─ 2. 依赖检查
│     ├─ node_modules 是否存在
│     └─ 缺失包自动安装
│
├─ 3. 本地构建（可跳过）
│     ├─ 清理 dist 目录
│     ├─ 执行 npm run build
│     └─ 构建失败则终止
│
├─ 4. Git 提交
│     ├─ 暂存所有变更
│     └─ 使用指定信息提交
│
└─ 5. 推送 GitHub
      └─ 触发 GitHub Actions 自动部署
```

### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-Message` | 提交信息 | `"feat: update content"` |
| `-SkipBuild` | 跳过本地构建 | `false` |
| `-SkipPush` | 只提交不推送 | `false` |

## 项目结构

```
src/
├── components/                # 组件
│   ├── Background.astro       # 动态背景（光斑、点阵、网格）
│   ├── Navbar.astro           # 导航栏（含主题切换）
│   ├── Footer.astro           # 页脚
│   ├── Sidebar.astro          # 侧边栏目录树（移动端抽屉）
│   ├── SidebarTree.astro      # 递归目录树组件（支持任意深度）
│   ├── TableOfContents.astro  # 右侧子标题导航
│   ├── Backlinks.astro        # 反向链接
│   ├── PrevNextNav.astro      # 上下篇导航
│   ├── ProjectCard.astro      # 项目卡片
│   └── mdx/                   # MDX 组件
│       ├── Callout.astro      # 提示框
│       ├── Tabs.astro         # 标签页
│       ├── TabItem.astro      # 标签页子项
│       ├── Collapse.astro     # 折叠面板
│       ├── BraceMap.astro     # 大括号结构图（d3.js）
│       ├── Table.astro        # 表格组件
│       ├── Image.astro        # 图片组件
│       ├── Media.astro        # 媒体组件（视频/文档）
│       └── ...
├── content/
│   ├── notes/                 # 笔记内容（MDX）
│   └── projects/              # 项目展示（Markdown）
├── layouts/
│   ├── BaseLayout.astro       # 基础布局（组装 Background/Navbar/Footer）
│   └── NoteLayout.astro       # 笔记布局（注册 MDX 组件）
├── lib/
│   ├── github.ts              # GitHub API 工具（Star 获取 + 24h 磁盘缓存）
│   ├── scan-notes.ts          # 笔记扫描 + 反向链接索引 + frontmatter 解析
│   ├── remark-wiki-links.ts   # Wiki 链接 remark 插件
│   ├── remark-media.ts        # 媒体文件路径处理 remark 插件
│   └── rehype-table-wrapper.ts # 表格自动包装 rehype 插件
└── pages/
    ├── index.astro            # 首页
    ├── about.astro            # 关于页
    ├── garden/                # 笔记页
    └── projects/              # 项目页
```

## 笔记架构

笔记按目录层级组织，最多支持三级子目录。目录和笔记都使用**四位数序号前缀**控制排列顺序。

### 目录结构示例

```
src/content/notes/
├── 0001-linux/                         # 一级分类（大类）
│   ├── _meta.json                      # 大类元数据
│   ├── 0000-测试笔记.mdx              # 笔记（与子目录并列）
│   ├── 0001-memory-management/         # 二级子目录
│   │   ├── _meta.json
│   │   ├── 0001-虚拟内存.mdx
│   │   └── 0002-分页机制.mdx
│   └── 0002-process-scheduling/
│       ├── _meta.json
│       └── 0001-CFS调度器.mdx
└── 0002-coding/
    ├── _meta.json
    └── 0001-python/
        ├── _meta.json
        └── 0001-基础语法.mdx
```

### 命名规则

- **四位数序号前缀**：`0000-`、`0001-`、`0013-` 控制同级内的排列顺序
- **笔记和目录都带序号**：如 `0001-虚拟内存.mdx`、`0001-memory-management/`
- **渲染时去掉序号**：`0001-虚拟内存.mdx` 显示为 `虚拟内存`

### _meta.json 格式

每个目录下可创建 `_meta.json` 定义显示名称：

```json
{
  "title": "Linux",
  "description": "Linux 内核与系统相关笔记"
}
```

### 笔记 frontmatter

```yaml
---
title: 笔记标题
tags: [标签1, 标签2]
summary: 笔记简介（可选）
---
```

### 添加新笔记

```bash
# 1. 确定属于哪个分类/主题目录
# 2. 创建文件：{四位数序号}-{标题}.mdx
#    例：src/content/notes/0001-linux/0001-memory-management/0003-新笔记.mdx

# 3. 写 frontmatter 和内容（可使用 MDX 组件）
# 4. 使用部署脚本
.\deploy.ps1 -Message "feat: 添加新笔记"
```

> ⚠️ **重要提醒**：创建新目录时，**必须**同时创建 `_meta.json` 文件！否则该目录在侧边栏中无法正确显示标题和描述。这是新手最容易遗漏的步骤。

### 媒体文件

每级目录可以创建 `_media` 文件夹存放媒体文件：

```
src/content/notes/0002-coding/
├── 0001-python/
│   ├── _media/              # Python笔记的媒体文件
│   │   ├── python-logo.png
│   │   └── data-structure.gif
│   ├── 0001-基础语法.mdx
│   └── 0002-数据结构.mdx
└── _media/                  # Coding分类的媒体文件
    └── coding-banner.jpg
```

**图片引用：**

```mdx
<!-- 基本用法（自动居中，自动适应宽度） -->
![Python Logo](./_media/python-logo.png)

<!-- 使用Image组件调整大小和对齐 -->
<Image src="./_media/python-logo.png" alt="Logo" width="200px" />

<!-- 左对齐 -->
<Image src="./_media/python-logo.png" alt="Logo" width="150px" align="left" />

<!-- 右对齐 -->
<Image src="./_media/python-logo.png" alt="Logo" width="150px" align="right" />

<!-- 带标题说明 -->
<Image src="./_media/python-logo.png" alt="Logo" width="200px" caption="图1：Python Logo" />
```

> **路径支持**：
> - 相对路径：`./_media/photo.png`（相对于当前笔记目录）
> - 绝对路径：`/media/images/photo.png`（相对于站点根目录）
> - 外部URL：`https://example.com/photo.png`

**视频和文档下载（使用Media组件）：**

```mdx
<!-- 视频 -->
<Media type="video" src="./_media/demo.mp4" width="640px" caption="演示视频" />

<!-- 文档下载（支持.md、.mdx、.pdf、.docx等） -->
<Media type="document" src="./_media/guide.md" alt="使用指南" />
```

支持的文件类型：
- 图片：`.png`, `.jpg`, `.gif`, `.svg`, `.webp`
- 视频：`.mp4`, `.webm`
- 音频：`.mp3`, `.wav`
- 文档：`.md`, `.mdx`, `.pdf`, `.docx`, `.txt`（点击下载）

### URL掩码

所有笔记URL自动生成16位哈希短码，隐藏真实目录结构：

- 真实路径：`0002-coding/0001-python/0001-基础语法`
- 显示URL：`/garden/a3f8b2c1d4e5f6a7/`

无需手动配置，构建时自动生成。

### LaTeX公式对齐

使用 `<Latex>` 组件控制块级公式的对齐方式：

```mdx
<!-- 居中对齐（默认） -->
<Latex>
$$
E = mc^2
$$
</Latex>

<!-- 左对齐 -->
<Latex align="left">
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$
</Latex>

<!-- 右对齐 -->
<Latex align="right">
$$
\int_{0}^{\infty} e^{-x} dx = 1
$$
</Latex>
```

### 表格样式

支持两种方式创建表格：

**Markdown 表格（推荐，默认居中对齐）：**

```md
| 名称 | 类型 | 描述 |
|------|------|------|
| Astro | 框架 | 静态站点生成器 |
| Tailwind | CSS | 原子化CSS框架 |
```

**HTML 表格（支持对齐和标题）：**

```mdx
<!-- 左对齐 + 标题 -->
<Table align="left" caption="技术栈">
  <thead>
    <tr><th>技术</th><th>用途</th></tr>
  </thead>
  <tbody>
    <tr><td>React</td><td>UI库</td></tr>
  </tbody>
</Table>

<!-- 右对齐 -->
<Table align="right">
  <thead>
    <tr><th>列1</th><th>列2</th></tr>
  </thead>
  <tbody>
    <tr><td>数据</td><td>数据</td></tr>
  </tbody>
</Table>
```

属性：
- `align` - 文字对齐方式：`left`（左对齐）、`center`（居中，默认）、`right`（右对齐）
- `caption` - 表格标题（可选）
- `scrollable` - 移动端是否可滚动（默认 `true`）

### 可用 MDX 组件

在 `.mdx` 文件中可直接使用以下组件（无需 import）：

```mdx
<Callout type="tip">提示框内容</Callout>

<Tabs labels={['标签1', '标签2']}>
  <TabItem index={0} active>内容1</TabItem>
  <TabItem index={1}>内容2</TabItem>
</Tabs>

<Collapse title="折叠标题">折叠内容</Collapse>

<Progress value={75} label="学习进度" />

<BraceMap data={{ name: "根节点", children: [{ name: "子节点1" }, { name: "子节点2" }] }} />
```

## 部署

### Cloudflare Pages（推荐，国内访问快）

1. 在 [Cloudflare](https://dash.cloudflare.com) 创建 Pages 项目，连接 GitHub 仓库
2. 构建设置：
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. 在 **Environment variables** 中添加 `DEPLOY_TARGET` = `cloudflare`
4. 推送代码到 `main` 分支，自动构建部署

### GitHub Pages

1. 在 GitHub 创建仓库
2. 推送代码到 `main` 分支
3. 在仓库设置中启用 GitHub Pages（Source: GitHub Actions）
4. 使用 `.\deploy.ps1` 一键部署，或手动推送触发自动构建

## 更新日志

详细版本更新记录请查看 [CHANGELOG.md](./CHANGELOG.md)

## 许可

MIT
