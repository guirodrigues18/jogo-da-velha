// Fica separado de firebase.ts para que o app saiba se o modo online existe
// sem precisar baixar o SDK do Firebase

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

/** O modo online só aparece quando o Firebase está configurado no .env */
export const isOnlineConfigured = Object.values(firebaseConfig).every(Boolean);
