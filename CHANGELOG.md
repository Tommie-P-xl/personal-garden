# 更新日志

所有版本的更新记录。

## 2026-07-09 功能优化与问题修复

### Markdown 表格自动转换
- 新增 `rehype-table-wrapper` 插件，Markdown 表格自动转换为带样式的 HTML 表格
- 无需手动使用 `<Table>` 组件，直接写 Markdown 表格语法即可
- 同时保留对 HTML `<Table>` 组件的支持（用于设置对齐、标题等高级属性）

### 表格样式修复
- 修复 HTML 表格标题（caption）显示异常的问题
- 统一表格样式到全局 CSS，确保 rehype 插件和组件样式一致
- 移除 `.prose table` 的冲突样式，由 `.table-wrapper` 统一管理
- 添加 `writing-mode: horizontal-tb` 确保标题水平显示

### 图片路径增强
- `<Image>` 和 `<Media>` 组件现在同时支持相对路径和绝对路径
- 相对路径：`./_media/photo.png`（相对于当前笔记目录）
- 绝对路径：`/media/images/photo.png`（相对于站点根目录）
- 外部URL：`https://example.com/photo.png`

### MDX 组件文档合并
- 将 `0001-BraceMap-测试.mdx` 和 `0002-新功能测试.mdx` 合并为 `0001-组件说明.mdx`
- 包含所有组件的完整使用说明和示例

### GitHub Actions 修复
- 修复 deployment 清理脚本的权限问题，添加 `deployments: write` 权限
- 改进清理逻辑：先将 deployment 状态设为 inactive 再删除
- 更新 Node.js 版本从 20 升级到 22（20 已被弃用）

---

## 2026-07-08 URL掩码、媒体文件支持与样式增强

### 新增测试笔记
- 新增 `0004-mdx-components/0002-新功能测试.mdx` 测试笔记
- 涵盖URL掩码、媒体文件、LaTeX对齐、表格样式等所有新功能
- 测试页面URL：`/garden/edeff02b80f5320e/`

### URL掩码系统
- 新增16位MD5哈希URL掩码，完全隐藏真实目录结构
- 自动生成，无需手动维护映射表
- 相同路径始终生成相同URL，稳定可预测
- 示例：`0002-coding/0001-python/0001-基础语法` → `/garden/a3f8b2c1d4e5f6a7/`
- 所有页面链接、侧边栏、导航、搜索结果均使用哈希URL

### 媒体文件支持
- 新增每级目录独立的 `_media` 文件夹结构
- 新增 `<Image>` 组件，支持调整大小和对齐
- 图片自动居中显示，最大宽度100%，自动适应容器
- 图片支持对齐：左对齐（`align="left"`）、居中（默认）、右对齐（`align="right"`）
- 图片支持标题说明（`caption`），对齐方式跟随图片
- 新增 `<Media>` 组件支持视频播放和文档下载
- 文档类型（`.md`、`.mdx`、`.pdf`、`.docx`）支持点击下载
- 构建时自动复制到 `public/media/` 目录
- 新增 `remark-media` 插件自动处理路径转换

### 表格样式
- 新增 `<Table>` 组件创建样式化表格
- 支持文字左对齐（`align="left"`）、居中（`align="center"`，默认）、右对齐（`align="right"`）
- 支持表格标题（`caption`），可选，对齐方式跟随表格
- 移动端自动横向滚动

### 其他改进
- 右侧目录导航（TOC）隐藏滚动条但保持可滚动功能
- 图片默认居中显示，最大宽度100%
- 图片和表格的标题对齐方式跟随父元素
- 全局表格对齐样式已修复，使用 `!important` 确保优先级

### LaTeX公式对齐
- 新增 `<Latex>` 组件控制块级公式对齐
- 支持左对齐（`align="left"`）、居中（`align="center"`）、右对齐（`align="right"`）
- 默认居中对齐
- 移动端自动添加横向滚动

### 表格样式
- 新增 `<Table>` 组件创建样式化表格
- 支持文字左对齐（`align="left"`）、居中（`align="center"`，默认）、右对齐（`align="right"`）
- 支持表格标题（`caption`）
- 移动端自动横向滚动

### 隐藏目录滚动条
- 右侧目录导航（TOC）隐藏滚动条但保持可滚动功能

### 组件使用示例

```mdx
<!-- URL掩码：自动生成，无需配置 -->

<!-- 图片（推荐使用标准Markdown语法，自动居中） -->
![照片](./_media/photo.png)

<!-- 视频 -->
<Media type="video" src="./_media/demo.mp4" width="640px" caption="演示视频" />

<!-- 文档下载 -->
<Media type="document" src="./_media/guide.md" alt="使用指南" />

<!-- LaTeX公式（默认居中） -->
<Latex>
$$
E = mc^2
$$
</Latex>

<!-- LaTeX公式（左对齐） -->
<Latex align="left">
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$
</Latex>

<!-- 表格（默认居中） -->
<Table caption="示例表格">
  <thead>
    <tr><th>列1</th><th>列2</th></tr>
  </thead>
  <tbody>
    <tr><td>数据1</td><td>数据2</td></tr>
  </tbody>
</Table>

<!-- 表格（左对齐） -->
<Table align="left">
  <thead>
    <tr><th>列1</th><th>列2</th></tr>
  </thead>
  <tbody>
    <tr><td>数据1</td><td>数据2</td></tr>
  </tbody>
</Table>
```

---

## 2025-07-04 全面性能优化

### 缓存策略优化
- 添加 `_headers` 文件，为静态资源设置合理的缓存策略
- HTML 页面：浏览器缓存 1 小时，CDN 缓存 24 小时
- Astro 指纹化资源：1 年 immutable 缓存
- 图片和图标：24 小时缓存

### KaTeX CSS 自托管
- 将 KaTeX CSS 从 jsdelivr CDN 改为本地自托管，消除外部依赖
- 首屏加载提速 1-2 秒，特别改善国内访问体验
- 60 个字体文件（woff2/woff/ttf）完整托管

### View Transition 动画优化
- 页面切换动画时间从 550ms 缩短到 200ms（减少 64%）
- 保留页面切换的流畅感和方向感知滑动效果
- 显著减少导航感知延迟

### 事件委托优化
- 主题切换、移动端菜单、代码复制按钮等交互改为事件委托模式
- 减少每次页面导航时的 DOM 查询和事件绑定
- 降低主线程阻塞时间，提升页面导航流畅度

### 可访问性改进
- 添加 `prefers-reduced-motion` 支持，当用户系统设置减少动画时：
  - 禁用背景光球动画
  - 禁用 View Transition 动画
  - 禁用所有 CSS transition
- 符合 WCAG 2.1 SC 2.3.3 标准，改善前庭功能障碍用户体验

---

## 2025-07-04 性能优化与微信验证

### 页面加载性能优化
- 移除 Google Fonts 渲染阻塞：将 `@import url('fonts.googleapis.com/...')` 替换为系统字体栈（PingFang SC / Microsoft YaHei / system-ui），消除国内访问 Google CDN 被墙导致的 2-3 秒白屏
- KaTeX CSS CDN 替换为 jsdelivr（原 bootcdn 不收录 KaTeX 导致公式渲染失败）
- 精简 `is:inline` 脚本结构，优化 ViewTransitions 页面切换性能

### 微信域名验证
- 在 `public/` 目录下部署微信验证文件，解除微信内置浏览器对网站的拦截
- GitHub Pages 和 Cloudflare Pages 两个域名共用同一份构建产物

### 导航指示器优化
- 移除基于 `getBoundingClientRect()` 的 JS 定位方案，改为 CSS `opacity` 过渡
- 消除移动端强制重绘导致的布局抖动

### 脚本架构优化
- 主题切换、移动端菜单、代码复制按钮等交互逻辑统一在 `is:inline` 脚本中管理
- 使用 `data-bound` 标记防止 ViewTransitions 导航时重复绑定事件
- 页面搜索脚本移入 `<BaseLayout>` 内部，修复 ViewTransitions 导航后搜索失效的问题
