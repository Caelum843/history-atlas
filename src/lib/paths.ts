/**
 * 为站内绝对路径补上 Astro 的部署 base。
 * 本地开发时 BASE_URL 是 `/`；GitHub Pages 构建时是 `/history-atlas/`。
 */
export function sitePath(path: string): string {
  if (/^(?:https?:)?\/\//.test(path) || path.startsWith('#')) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const normalized = `/${path.replace(/^\/+/, '')}`;
  return `${base}${normalized}` || '/';
}
