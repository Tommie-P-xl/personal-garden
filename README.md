# 个人数字花园

Digital Garden 风格的个人网站，用于记录学习笔记和展示项目。采用菜鸟教程风格的教程式布局，左侧目录树 + 右侧内容区。

**在线访问**: https://tommie-p-xl.github.io/personal-garden/

## 功能特性

- **教程式布局** — 左侧目录树 + 右侧内容区，支持三级子目录
- **双向链接** — `[[笔记标题]]` 语法，笔记之间互相引用
- **全文搜索** — 支持搜索各级子目录下的笔记
- **标签分类** — 按主题组织笔记
- **LaTeX 公式** — `$行内$` 和 `$$块级$$` 数学公式渲染（KaTeX）
- **代码高亮** — Shiki 多语言语法高亮，支持亮色/暗色双主题
- **暗黑模式** — 支持亮色/暗色/跟随系统三种模式
- **响应式设计** — 桌面端侧边栏 + 移动端抽屉式导航
- **项目展示** — 项目卡片展示，支持 GitHub 链接和外部链接
- **GitHub Stars** — 构建时自动获取项目 Star 数量并排序
- **代码复制** — 一键复制代码块内容
- **优雅背景** — 多层视觉效果：点阵纹理 + 网格线 + 多彩浮动光斑动画
- **平滑导航** — 导航指示条跟随滑动，带有明确的起点和终点动画
- **无闪变切换** — View Transitions 页面切换时主题颜色即时响应，无白闪

## 技术栈

| 技术 | 用途 |
|------|------|
| [Astro](https://astro.build/) | 静态站点生成器 |
| [Tailwind CSS](https://tailwindcss.com/) | CSS 框架 |
| [KaTeX](https://katex.org/) | LaTeX 数学公式渲染 |
| [Shiki](https://shiki.style/) | 代码语法高亮 |
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

## 项目结构

```
src/
├── components/           # 组件
│   ├── Sidebar.astro     # 侧边栏目录树
│   ├── NoteCard.astro    # 笔记卡片
│   ├── ProjectCard.astro # 项目卡片
│   ├── PrevNextNav.astro # 上下篇导航
│   └── Backlinks.astro   # 反向链接
├── content/
│   ├── notes/            # 笔记内容（Markdown）
│   └── projects/         # 项目展示（Markdown）
├── layouts/
│   └── BaseLayout.astro  # 基础布局（导航栏、页脚、主题切换）
├── lib/
│   └── scan-notes.ts     # 笔记扫描工具
└── pages/
    ├── index.astro       # 首页
    ├── about.astro       # 关于页
    ├── garden/           # 笔记页
    │   ├── index.astro   # 笔记列表
    │   └── [...slug].astro # 笔记详情/目录页
    └── projects/         # 项目页
        ├── index.astro   # 项目列表
        └── [...slug].astro # 项目详情
```

## 笔记架构

笔记按目录层级组织，最多支持三级子目录。目录和笔记都使用**四位数序号前缀**控制排列顺序。

### 目录结构示例

```
src/content/notes/
├── 0001-linux/                         # 一级分类（大类）
│   ├── _meta.json                      # 大类元数据
│   ├── 0000-测试笔记.md                # 笔记（与子目录并列）
│   ├── 0001-memory-management/         # 二级子目录
│   │   ├── _meta.json                  # 子目录元数据
│   │   ├── 0001-虚拟内存.md            # 笔记
│   │   └── 0002-分页机制.md            # 笔记
│   └── 0002-process-scheduling/        # 二级子目录
│       ├── _meta.json
│       └── 0001-CFS调度器.md
├── 0002-coding/                        # 另一个大类
│   ├── _meta.json
│   └── 0001-python/
│       ├── _meta.json
│       └── 0001-基础语法.md
└── 0003-其他大类/
    └── ...
```

### 命名规则

- **四位数序号前缀**：`0000-`、`0001-`、`0013-` 控制同级内的排列顺序
- **笔记和目录都带序号**：如 `0000-测试笔记.md`、`0001-memory-management/`
- **渲染时去掉序号**：`0001-虚拟内存.md` 显示为 `虚拟内存`

### `_meta.json` 格式

每个目录下可创建 `_meta.json` 定义显示名称：

```json
{
  "title": "Linux",
  "description": "Linux 内核与系统相关笔记"
}
```

- **必填**：`title`（目录显示名称）
- **可选**：`description`
- **默认行为**：没有 `_meta.json` 时，使用目录名作为标题
- **图标**：统一使用 `public/icons/` 下的 SVG 文件，由系统自动匹配

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
# 2. 创建文件：{四位数序号}-{标题}.md
#    例：src/content/notes/0001-linux/0001-memory-management/0003-新笔记.md

# 3. 写 frontmatter 和内容
# 4. 提交推送
git add .
git commit -m "feat: 添加新笔记"
git push
```

### 添加新子目录

```bash
# 1. 创建目录：{四位数序号}-{名称}/
#    例：src/content/notes/0001-linux/0003-文件系统/

# 2. 创建 _meta.json
echo '{"title": "文件系统", "description": "文件系统相关笔记"}' > src/content/notes/0001-linux/0003-文件系统/_meta.json

# 3. 在目录下创建带序号的 md 文件
# 4. 提交推送
```

> 图标已统一使用 `public/icons/` 目录下的 SVG 文件，无需在 `_meta.json` 中配置。

### 侧边栏行为

- 进入某个大类后，侧边栏只显示该大类下的内容
- 笔记和子目录按序号混合排列
- 当前页面高亮显示
- 目录可折叠/展开

### 双向链接

使用 `[[笔记标题]]` 语法引用其他笔记，支持忽略空格的模糊匹配：

```markdown
这个概念与 [[CFS调度器]] 密切相关。
参见 [[虚拟内存]] 的地址空间布局。
```

### LaTeX 公式

```markdown
行内公式：$E = mc^2$

块级公式：
$$\text{vruntime} += \Delta_{exec} \times \frac{NICE\_0\_LOAD}{weight}$$
```

### 代码块

支持多种编程语言的语法高亮，自动适配亮色/暗色主题：

````markdown
```python
def hello():
    print("Hello, World!")
```
````

## 添加项目

在 `src/content/projects/` 目录下创建 Markdown 文件：

```markdown
---
title: 项目名称
description: 项目描述
tech: [技术1, 技术2]
github: https://github.com/...
link: https://...
featured: true
date: 2025-06-25
---

项目详情...
```

- `featured: true` 的项目会显示在首页
- 构建时自动从 GitHub API 获取 Star 数量
- 按 Star 数量降序排列，Star 相同时按日期降序

## 部署

1. 在 GitHub 创建仓库
2. 推送代码到 `main` 分支
3. 在仓库设置中启用 GitHub Pages（Source: GitHub Actions）
4. 每次推送自动部署

## 更新日志

### 2025-07-01 视觉效果优化

**修复：页面切换闪变问题**
- 在 View Transitions 的 `astro:after-swap` 事件中立即应用主题
- 添加 CSS 变量（`--bg-primary`、`--bg-card`、`--border-color`）确保所有元素即时响应
- 彻底解决了从首页切换到笔记/项目时圆角矩形卡片和搜索栏的白闪问题

**改进：导航指示条动效**
- 优化导航方向追踪逻辑，使用 `getPathIdx` 函数准确匹配当前页面
- 导航指示条现在有明确的起点和终点，平滑滑动到目标位置
- 使用 `cubic-bezier(0.25,0.1,0.25,1)` 缓动函数实现更自然的动画
- 在页面切换时先立即定位（无动画），再恢复动画，避免跳动

**增强：背景视觉丰富性**
- 增加点阵纹理透明度（亮色 0.4，暗色 0.15）
- 添加网格线纹理层，增加背景层次感
- 增强主光斑可见度：琥珀色（左上）、紫色（右下）、青色（中央）
- 新增次光斑：玫瑰色（右上）、绿色（左下）
- 添加微妙的渐变叠加层
- 改进浮动动画，添加旋转效果使其更自然

## 许可

MIT
