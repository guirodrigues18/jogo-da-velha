import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './config';

/** App do Firebase, um só para o modo online e para o Analytics */
export const app = initializeApp(firebaseConfig);
