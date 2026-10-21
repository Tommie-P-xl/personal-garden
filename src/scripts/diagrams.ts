type Mermaid = typeof import('mermaid')['default'];
let library: Promise<Mermaid> | undefined;
let revision = 0;
let sequence = 0;
let queue = Promise.resolve();
let observer: IntersectionObserver | undefined;
let activeFigure: HTMLElement | undefined;
let returnFocus: HTMLElement | undefined;
let previousOverflow = '';
let scale = 1;

const isDark = () => document.documentElement.classList.contains('dark');
const dialog = () => document.querySelector<HTMLDialogElement>('.diagram-dialog');

function config() {
  const dark = isDark();
  return {
    startOnLoad: false,
    securityLevel: 'strict' as const,
    suppressErrorRendering: true,
    theme: 'base' as const,
    themeCSS: '.edgeLabel rect { opacity: 1 !important; } .node rect { rx: 6px; ry: 6px; }',
    fontFamily: 'system-ui, "PingFang SC", "Microsoft YaHei", sans-serif',
    themeVariables: {
      darkMode: dark,
      background: dark ? '#242521' : '#fffdf8',
      primaryColor: dark ? '#303b34' : '#edf3eb',
      primaryTextColor: dark ? '#eee9dd' : '#292e27',
      primaryBorderColor: dark ? '#8fAA91' : '#729273',
      lineColor: dark ? '#b5b6a6' : '#74816d',
      secondaryColor: dark ? '#3d392d' : '#f6eedc',
      tertiaryColor: dark ? '#2b302a' : '#f5f5ee',
      secondaryTextColor: dark ? '#eee9dd' : '#292e27',
      tertiaryTextColor: dark ? '#eee9dd' : '#292e27',
      edgeLabelBackground: dark ? '#242521' : '#fffdf8',
      clusterBkg: dark ? '#292e28' : '#f5f6f0',
      clusterBorder: dark ? '#5b6556' : '#c8d2c1',
      fontSize: '15px',
    },
    flowchart: { htmlLabels: false, useMaxWidth: false, curve: 'basis', nodeSpacing: 30, rankSpacing: 45 },
  };
}

function sizePreview(reset = false) {
  const modal = dialog();
  const svg = modal?.querySelector<SVGSVGElement>('svg');
  const viewport = modal?.querySelector<HTMLElement>('.diagram-dialog-viewport');
  if (!svg || !viewport) return;
  const { width, height } = svg.viewBox.baseVal;
  if (!width || !height) return;
  if (reset) scale = Math.min(1, (viewport.clientWidth - 40) / width, (viewport.clientHeight - 40) / height);
  svg.style.width = `${width * scale}px`;
  svg.style.height = `${height * scale}px`;
}

function refreshPreview() {
  const modal = dialog();
  const source = activeFigure?.querySelector('svg');
  const canvas = modal?.querySelector('.diagram-dialog-canvas');
  if (!modal?.open || !source || !canvas) return;
  // 移动同一个 SVG，避免克隆后重复的 marker/title ID 导致连线或辅助标题串图。
  canvas.replaceChildren(source);
  sizePreview(true);
}

function closePreview() {
  const modal = dialog();
  const svg = modal?.querySelector<SVGSVGElement>('svg');
  if (svg && activeFigure?.isConnected) {
    svg.style.width = `${svg.viewBox.baseVal.width}px`;
    svg.style.height = 'auto';
    activeFigure.querySelector('.diagram-canvas')?.replaceChildren(svg);
  }
  if (activeFigure) document.documentElement.style.overflow = previousOverflow;
  activeFigure = undefined;
  returnFocus?.focus({ preventScroll: true });
  returnFocus = undefined;
}

function schedule(figure: HTMLElement) {
  const current = revision;
  if (figure.dataset.queued === String(current)) return;
  figure.dataset.queued = String(current);
  queue = queue.then(async () => {
    if (current !== revision || !figure.isConnected) return;
    try {
      library ??= import('mermaid').then(module => module.default);
      const mermaid = await library;
      if (current !== revision || !figure.isConnected) return;
      mermaid.initialize(config());
      const { svg } = await mermaid.render(`garden-diagram-${++sequence}`, figure.dataset.mermaid || '');
      if (current !== revision || !figure.isConnected) return;
      const canvas = figure.querySelector('.diagram-canvas')!;
      canvas.innerHTML = svg;
      const image = canvas.querySelector<SVGSVGElement>('svg')!;
      image.style.maxWidth = 'none';
      image.style.width = `${image.viewBox.baseVal.width}px`;
      image.style.height = 'auto';
      image.setAttribute('role', 'img');
      if (!image.hasAttribute('aria-labelledby')) image.setAttribute('aria-label', figure.dataset.title || '流程图');
      figure.dataset.rendered = isDark() ? 'dark' : 'light';
      figure.querySelector<HTMLButtonElement>('.diagram-expand')!.hidden = false;
      const status = figure.querySelector<HTMLElement>('.diagram-status')!;
      status.textContent = '宽图可横向滚动，或放大查看。';
      if (activeFigure === figure) refreshPreview();
    } catch {
      if (current !== revision || !figure.isConnected) return;
      figure.dataset.rendered = 'error';
      figure.querySelector<HTMLElement>('.diagram-status')!.textContent = '图表暂时无法显示，可查看下方 Mermaid 源码。';
      figure.querySelector('details')?.setAttribute('open', '');
      // 网络加载失败允许下次导航重试，语法错误只影响当前图表。
      library = undefined;
    }
  });
}

function init() {
  revision++;
  observer?.disconnect();
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      schedule(entry.target as HTMLElement);
      observer?.unobserve(entry.target);
    }
  }, { rootMargin: '300px' });
  document.querySelectorAll<HTMLElement>('[data-mermaid]').forEach(figure => observer!.observe(figure));
}

document.addEventListener('click', event => {
  const target = event.target instanceof Element ? event.target : null;
  const expand = target?.closest<HTMLElement>('.diagram-expand');
  const modal = dialog();
  if (expand && modal) {
    activeFigure = expand.closest<HTMLElement>('[data-mermaid]')!;
    returnFocus = expand;
    previousOverflow = document.documentElement.style.overflow;
    modal.querySelector('#diagram-dialog-title')!.textContent = activeFigure.dataset.title || '流程图';
    modal.addEventListener('close', closePreview, { once: true });
    modal.showModal();
    document.documentElement.style.overflow = 'hidden';
    refreshPreview();
    modal.querySelector<HTMLButtonElement>('[data-diagram-close]')?.focus();
  }
  if (target?.closest('[data-diagram-close]')) modal?.close();
  const zoom = target?.closest<HTMLElement>('[data-diagram-zoom]')?.dataset.diagramZoom;
  if (zoom) {
    if (zoom !== 'reset') scale = Math.min(4, Math.max(0.15, scale * (zoom === 'in' ? 1.25 : 0.8)));
    sizePreview(zoom === 'reset');
  }
});
// Escape 首先关闭图表，避免同时退出专注阅读。
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && dialog()?.open) { event.preventDefault(); dialog()!.close(); }
}, { capture: true });
document.addEventListener('astro:before-swap', () => {
  dialog()?.close();
  closePreview();
  revision++;
  observer?.disconnect();
});
document.addEventListener('astro:page-load', init);
let previousTheme = isDark();
new MutationObserver(() => {
  const dark = isDark();
  if (dark === previousTheme) return;
  previousTheme = dark;
  revision++;
  document.querySelectorAll<HTMLElement>('[data-mermaid]').forEach(figure => {
    if (figure.dataset.rendered) schedule(figure);
    // 旧主题下尚未完成的任务已取消，重新观察，避免首次加载时切主题导致图表丢失。
    else observer?.observe(figure);
  });
}).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
window.addEventListener('resize', () => sizePreview(true));
init();
