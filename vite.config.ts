import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Uma página por idioma (o mesmo app, com textos de SEO próprios)
      input: {
        pt: resolve(import.meta.dirname, 'index.html'),
        en: resolve(import.meta.dirname, 'en/index.html'),
        es: resolve(import.meta.dirname, 'es/index.html')
      }
    }
  }
});
