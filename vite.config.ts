import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Uma página do jogo por idioma (o mesmo app, com textos de SEO próprios)
      // e as páginas de regras e estratégias (só HTML e CSS)
      input: {
        pt: resolve(import.meta.dirname, 'index.html'),
        en: resolve(import.meta.dirname, 'en/index.html'),
        es: resolve(import.meta.dirname, 'es/index.html'),
        rulesPt: resolve(import.meta.dirname, 'regras/index.html'),
        rulesEn: resolve(import.meta.dirname, 'en/rules/index.html'),
        rulesEs: resolve(import.meta.dirname, 'es/reglas/index.html'),
        strategyPt: resolve(import.meta.dirname, 'estrategias/index.html'),
        strategyEn: resolve(import.meta.dirname, 'en/strategy/index.html'),
        strategyEs: resolve(import.meta.dirname, 'es/estrategias/index.html')
      }
    }
  }
});
