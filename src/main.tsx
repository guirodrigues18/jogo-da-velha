import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { redirectToSavedLanguage } from './i18n';
import { applyTheme } from './shop/wallet';
import { startAnalyticsIfAllowed } from './online/consent';
import './style.css';

// Tema da loja aplicado antes de desenhar, para não piscar o tema padrão
applyTheme();

// Quem já escolheu outro idioma é levado para a página dele antes de desenhar o jogo
if (!redirectToSavedLanguage()) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
      <Analytics />
    </StrictMode>
  );

  // Google Analytics só para quem aceitou os cookies, depois que a página terminou de carregar
  window.addEventListener('load', startAnalyticsIfAllowed, { once: true });
}
