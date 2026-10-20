/** Closed drawers are inert; only an open dialog may trap focus. */
let closeActive: ((restore?: boolean) => void) | undefined;

function bindDrawer(buttonId: string, drawerId: string, overlayId: string, closeId: string, breakpoint: number) {
  const button = document.getElementById(buttonId);
  const drawer = document.getElementById(drawerId);
  const overlay = document.getElementById(overlayId);
  const closeButton = document.getElementById(closeId);
  if (!button || !drawer || !overlay || button.dataset.drawerBound) return;
  button.dataset.drawerBound = 'true';
  let open = false;
  let previousOverflow = '';
  let background: HTMLElement[] = [];
  function close(restore = true) {
    if (!open) return;
    open = false;
    drawer!.inert = true;
    drawer!.setAttribute('aria-hidden', 'true');
    drawer!.removeAttribute('data-open');
    overlay!.classList.add('hidden');
    button!.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = previousOverflow;
    background.forEach(el => { el.inert = false; });
    background = [];
    if (closeActive === close) closeActive = undefined;
    if (restore && button!.isConnected) button!.focus();
    window.removeEventListener('resize', resize);
  }
  function resize() { if (window.innerWidth >= breakpoint) close(false); }
  button.addEventListener('click', () => {
    closeActive?.(false);
    open = true;
    closeActive = close;
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    drawer.inert = false;
    drawer.setAttribute('aria-hidden', 'false');
    drawer.setAttribute('data-open', 'true');
    overlay.classList.remove('hidden');
    button.setAttribute('aria-expanded', 'true');
    // Inert siblings along the ancestor chain without disabling the dialog itself.
    let branch: Element = drawer;
    while (branch.parentElement && branch.parentElement !== document.documentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling !== overlay && sibling instanceof HTMLElement && !sibling.inert && !['SCRIPT', 'STYLE'].includes(sibling.tagName)) {
          sibling.inert = true;
          background.push(sibling);
        }
      }
      branch = branch.parentElement;
    }
    // Flush the visibility change before moving focus into a previously hidden drawer.
    drawer.getBoundingClientRect();
    requestAnimationFrame(() => { if (open) (closeButton || drawer).focus({ preventScroll: true }); });
    window.addEventListener('resize', resize);
  });
  overlay.addEventListener('click', () => close());
  closeButton?.addEventListener('click', () => close());
  drawer.addEventListener('keydown', event => {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const elements = Array.from(drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]')).filter(el => el.getClientRects().length && !el.closest('[inert]'));
    const first = elements[0], last = elements.at(-1);
    if (!first) { event.preventDefault(); drawer.focus(); return; }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  drawer.querySelectorAll('a[href]').forEach(link => link.addEventListener('click', () => close(false)));
}

function initDrawers() {
  bindDrawer('sidebar-toggle-btn', 'sidebar-drawer', 'sidebar-overlay', 'sidebar-close-btn', 1280);
  bindDrawer('toc-mobile-btn', 'toc-mobile-drawer', 'toc-mobile-overlay', 'toc-mobile-close', 1600);
}
document.addEventListener('reading:before-toggle', () => closeActive?.(false));
document.addEventListener('astro:before-swap', () => closeActive?.(false));
document.addEventListener('astro:page-load', initDrawers);
initDrawers();
