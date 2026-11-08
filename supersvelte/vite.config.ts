import path from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

const port = Number(process.env.PORT);
if (!port) throw new Error('PORT environment variable is required.');
const basePath = process.env.BASE_PATH;
if (!basePath) throw new Error('BASE_PATH environment variable is required.');

export default defineConfig({
  base: basePath,
  plugins: [svelte()],
  root: path.resolve(import.meta.dirname),
  build: { outDir: path.resolve(import.meta.dirname, 'dist/public'), emptyOutDir: true },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  preview: { port, host: '0.0.0.0', allowedHosts: true },
});
