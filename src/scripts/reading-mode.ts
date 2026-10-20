const storageKey = 'garden-reading-mode';

function preferredMode(): 'default' | 'focus' {
  try { return localStorage.getItem(storageKey) === 'focus' ? 'focus' : 'default'; }
  catch { return 'default'; }
}

function applyMode(mode: 'default' | 'focus', save = false) {
  document.documentElement.dataset.readingMode = mode;
  const focused = mode === 'focus';
  document.querySelectorAll<HTMLButtonElement>('[data-reading-toggle]').forEach(button => {
    button.setAttribute('aria-pressed', String(focused));
    button.title = focused ? '恢复目录与默认阅读宽度' : '收起两侧目录并加宽正文';
    const label = button.querySelector('[data-reading-label]');
    if (label) label.textContent = focused ? '退出专注' : '专注阅读';
  });
  if (save) { try { localStorage.setItem(storageKey, mode); } catch {} }
}

document.addEventListener('click', event => {
  if (!(event.target instanceof Element) || !event.target.closest('[data-reading-toggle]')) return;
  document.dispatchEvent(new Event('reading:before-toggle'));
  applyMode(document.documentElement.dataset.readingMode === 'focus' ? 'default' : 'focus', true);
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || event.defaultPrevented || !document.querySelector('.note-layout')) return;
  if (document.documentElement.dataset.readingMode !== 'focus') return;
  applyMode('default', true);
  document.querySelector<HTMLButtonElement>('[data-reading-toggle]')?.focus({ preventScroll: true });
});

document.addEventListener('astro:page-load', () => applyMode(preferredMode()));
applyMode(preferredMode());
