# 更新日志

所有版本的更新记录。

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
