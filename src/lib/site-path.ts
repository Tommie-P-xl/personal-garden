/** Join a deployment base exactly once (GitHub Pages and root deployments). */
export function sitePath(value: string, base: string): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) return value;
  const prefix = `/${base.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\//, '/');
  if (prefix !== '/' && value.startsWith(prefix)) return value;
  return prefix + value.replace(/^\/+/, '');
}
export const deploymentBase = process.env.DEPLOY_TARGET === 'cloudflare' ? '/' : '/personal-garden/';
