// src/lib/firebase/admin.js - Configuración corregida
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';

// Verificar que las variables de entorno existan
if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error('FIREBASE_PROJECT_ID no está configurado');
}

if (!process.env.FIREBASE_CLIENT_EMAIL) {
  throw new Error('FIREBASE_CLIENT_EMAIL no está configurado');
}

if (!process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error('FIREBASE_PRIVATE_KEY no está configurado');
}

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  projectId: process.env.FIREBASE_PROJECT_ID,
};

// Inicializar app solo si no existe
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

// Exportar servicios
export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
export const adminMessaging = getMessaging(app);

export default app;