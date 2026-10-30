import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { redirectToSavedLanguage } from './i18n';
import './style.css';

// Quem já escolheu outro idioma é levado para a página dele antes de desenhar o jogo
if (!redirectToSavedLanguage()) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
      <Analytics />
    </StrictMode>
  );
}
