// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  build: { format: 'directory' },
  // 首版无服务端需求。地图与场景交互全部在客户端，用原生 TS island。
});
