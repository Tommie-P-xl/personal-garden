import './drawers';
import './reading-mode';
const globals = window as any;
function getTheme() { try { const value = localStorage.getItem('theme'); return ['light','dark','system'].includes(value || '') ? value! : 'system'; } catch { return 'system'; } }
function applyTheme(theme: string, save = false) {
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  if (save) { try { localStorage.setItem('theme', theme); } catch {} }
  for (const mode of ['light','dark','system']) for (const suffix of ['', '-mobile']) document.getElementById(`icon-${mode}${suffix}`)?.classList.toggle('hidden', theme !== mode);
}
function init() {
  applyTheme(getTheme());
  document.querySelectorAll('pre').forEach(pre => {
    if (pre.querySelector('.code-copy-btn')) return;
    const button = document.createElement('button');
    button.className = 'code-copy-btn'; button.type = 'button'; button.textContent = '复制'; button.setAttribute('aria-label', '复制代码');
    pre.append(button);
  });
}
document.addEventListener('astro:before-swap', (event: any) => {
  event.newDocument.documentElement.classList.toggle('dark', document.documentElement.classList.contains('dark'));
  event.newDocument.documentElement.dataset.readingMode = document.documentElement.dataset.readingMode || 'default';
});
document.addEventListener('astro:page-load', init);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if(getTheme() === 'system') applyTheme('system'); });
document.addEventListener('keydown', event => {
  if(event.key !== 'Escape') return;
  document.getElementById('theme-dropdown')?.classList.add('hidden');
  document.getElementById('theme-toggle')?.setAttribute('aria-expanded','false');
  document.getElementById('mobile-menu')?.classList.add('hidden');
  document.getElementById('mobile-menu-btn')?.setAttribute('aria-expanded','false');
});
document.addEventListener('click', async event => {
  const target = event.target instanceof Element ? event.target : null;
  if(!target) return;
  if(target.closest('#theme-toggle')) {
    const dropdown = document.getElementById('theme-dropdown'); dropdown?.classList.toggle('hidden');
    document.getElementById('theme-toggle')?.setAttribute('aria-expanded', String(!dropdown?.classList.contains('hidden'))); return;
  }
  const choice = target.closest<HTMLElement>('#theme-dropdown [data-theme]');
  if(choice) { applyTheme(choice.dataset.theme || 'system',true); document.getElementById('theme-dropdown')?.classList.add('hidden'); document.getElementById('theme-toggle')?.setAttribute('aria-expanded','false'); return; }
  if(!target.closest('#theme-dropdown')) { document.getElementById('theme-dropdown')?.classList.add('hidden'); document.getElementById('theme-toggle')?.setAttribute('aria-expanded','false'); }
  if(target.closest('#theme-toggle-mobile')) { const modes=['system','light','dark']; applyTheme(modes[(modes.indexOf(getTheme())+1)%3],true); return; }
  if(target.closest('#mobile-menu-btn')) { const menu=document.getElementById('mobile-menu'); menu?.classList.toggle('hidden'); document.getElementById('mobile-menu-btn')?.setAttribute('aria-expanded',String(!menu?.classList.contains('hidden'))); return; }
  const tag = target.closest<HTMLElement>('#tag-filter button[data-tag]');
  if(tag) { globals.__gardenTagFilter?.(tag); return; }
  const button = target.closest<HTMLButtonElement>('.code-copy-btn');
  if(button) {
    const text=button.closest('pre')?.querySelector('code')?.textContent || '';
    let copied=false;
    try { await navigator.clipboard.writeText(text); copied=true; } catch {
      const input=document.createElement('textarea'); input.value=text; input.style.position='fixed'; input.style.opacity='0'; document.body.append(input); input.select();
      try { copied=document.execCommand('copy'); } finally { input.remove(); }
    }
    button.textContent=copied ? '已复制' : '复制失败';
    setTimeout(()=>{button.textContent='复制';},1500);
  }
});
document.addEventListener('input', event => {
  const input=event.target as HTMLInputElement;
  if(input.id !== 'search-input') return;
  if(document.getElementById('categories-grid')) { globals.__gardenSearch?.(input.value); return; }
  if(!document.getElementById('projects-grid')) return;
  const term=input.value.trim().toLowerCase(); let count=0;
  document.querySelectorAll<HTMLElement>('.project-card').forEach(card=>{
    const matches=!term || [card.dataset.title,card.dataset.tech,card.dataset.desc].some(value=>value?.includes(term));
    card.hidden=!matches; if(matches) count++;
  });
  document.getElementById('no-results')?.classList.toggle('hidden',count>0 || !term);
});
init();
