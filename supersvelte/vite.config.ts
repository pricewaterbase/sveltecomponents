import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig(({ command }) => ({
  // Inject component styles in dev to avoid separate CSS-module requests through preview proxies.
  plugins: [svelte({ emitCss: command === 'build' })],
  base: process.env.BASE_PATH || '/',
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT || 5173),
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': 'http://127.0.0.1:8080',
    },
  },
}));
