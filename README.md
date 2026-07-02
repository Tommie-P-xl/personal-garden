# 个人数字花园

Digital Garden 风格的个人网站，用于记录学习笔记和展示项目。采用菜鸟教程风格的教程式布局，左侧目录树 + 右侧内容区。

**在线访问**:
- Cloudflare Pages: https://tommie-p-xl.pages.dev/ （国内推荐，访问更快）
- GitHub Pages: https://tommie-p-xl.github.io/personal-garden/

## 功能特性

- **教程式布局** — 左侧目录树 + 右侧子标题导航，支持三级子目录
- **MDX 支持** — 在笔记中嵌入自定义组件（提示框、标签页、折叠面板等）
- **双向链接** — `[[笔记标题]]` 语法，笔记之间互相引用
- **全文搜索** — 支持搜索各级子目录下的笔记
- **标签分类** — 按主题组织笔记
- **LaTeX 公式** — `$行内$` 和 `$$块级$$` 数学公式渲染（KaTeX）
- **代码高亮** — Shiki 多语言语法高亮，支持亮色/暗色双主题
- **暗黑模式** — 支持亮色/暗色/跟随系统三种模式
- **响应式设计** — 桌面端侧边栏 + 移动端抽屉式导航
- **项目展示** — 项目卡片展示，支持 GitHub 链接和外部链接
- **GitHub Stars** — 构建时自动获取项目 Star 数量并排序

## 技术栈

| 技术 | 用途 |
|------|------|
| [Astro](https://astro.build/) | 静态站点生成器 |
| [Tailwind CSS](https://tailwindcss.com/) | CSS 框架 |
| [KaTeX](https://katex.org/) | LaTeX 数学公式渲染 |
| [Shiki](https://shiki.style/) | 代码语法高亮 |
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
├── components/           # 组件
│   ├── Sidebar.astro     # 侧边栏目录树
│   ├── TableOfContents.astro  # 右侧子标题导航
│   ├── Backlinks.astro   # 反向链接
│   ├── PrevNextNav.astro # 上下篇导航
│   └── mdx/              # MDX 组件
│       ├── Callout.astro # 提示框
│       ├── Tabs.astro    # 标签页
│       ├── Collapse.astro # 折叠面板
│       └── ...
├── content/
│   ├── notes/            # 笔记内容（MDX）
│   └── projects/         # 项目展示（Markdown）
├── layouts/
│   ├── BaseLayout.astro  # 基础布局
│   └── NoteLayout.astro  # 笔记布局（注册 MDX 组件）
├── lib/
│   ├── scan-notes.ts     # 笔记扫描工具
│   └── remark-wiki-links.ts  # Wiki 链接插件
└── pages/
    ├── index.astro       # 首页
    ├── about.astro       # 关于页
    ├── garden/           # 笔记页
    └── projects/         # 项目页
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

## 许可

MIT
