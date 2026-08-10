import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Канонический домен: https://southwood.pw
 * (аналог поля site в Astro — sitemap и SEO опираются на него)
 */
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});
