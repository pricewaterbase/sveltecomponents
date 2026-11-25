import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: process.env.BASE_PATH || '/',
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT || 5173),
    strictPort: true,
    allowedHosts: ['fix-workspace-preview-error-supersvelte-ff472b33667d0d00.v0.build'],
    proxy: {
      '/api': 'http://127.0.0.1:8080',
    },
  },
});
