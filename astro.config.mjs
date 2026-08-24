// @ts-check
import { defineConfig } from 'astro/config';

const onGitHubPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  output: 'static',
  build: { format: 'directory' },
  site: 'https://caelum843.github.io',
  // 本地仍使用 http://localhost:4321/；Pages 构建部署到项目子路径。
  base: onGitHubPages ? '/history-atlas' : '/',
  // 首版无服务端需求。地图与场景交互全部在客户端，用原生 TS island。
});
