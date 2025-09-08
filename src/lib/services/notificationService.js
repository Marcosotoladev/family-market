// src/lib/services/notificationService.js
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app } from '../firebase/config';

class NotificationService {
  constructor() {
    this.messaging = null;
    this.vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    this.isInitialized = false;
  }

  // Inicializar Firebase Messaging
  async initialize() {
    try {
      if (typeof window === 'undefined') {
        console.log('Messaging solo funciona en el cliente');
        return false;
      }

      // Verificar si messaging es compatible
      const supported = await isSupported();
      if (!supported) {
        console.log('Firebase Messaging no es compatible en este navegador');
        return false;
      }

      this.messaging = getMessaging(app);
      this.isInitialized = true;
      console.log('Firebase Messaging inicializado correctamente');
      return true;
    } catch (error) {
      console.error('Error al inicializar Firebase Messaging:', error);
      return false;
    }
  }

  // Solicitar permisos de notificación
  async requestPermission() {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return null;
      }

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Permisos de notificación concedidos');
        return await this.getToken();
      } else {
        console.log('Permisos de notificación denegados');
        return null;
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return null;
    }
  }

  // Obtener token FCM
  async getToken() {
    try {
      if (!this.messaging) {
        const initialized = await this.initialize();
        if (!initialized) return null;
      }

      if (!this.vapidKey) {
        console.error('VAPID key no configurada');
        return null;
      }

      // Obtener registration del service worker de Firebase
      let registration;
      try {
        registration = await navigator.serviceWorker.register('/api/firebase-messaging-sw');
        console.log('Service Worker de Firebase registrado');
      } catch (swError) {
        console.warn('Error registrando SW de Firebase, usando default:', swError);
        registration = await navigator.serviceWorker.ready;
      }
      
      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
        serviceWorkerRegistration: registration
      });
      
      if (token) {
        console.log('Token FCM obtenido:', token);
        this.saveTokenToDatabase(token);
        return token;
      } else {
        console.log('No se pudo obtener el token FCM');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener token FCM:', error);
      return null;
    }
  }

  // Escuchar mensajes en primer plano
  onMessageListener() {
    if (!this.messaging) {
      console.warn('Messaging no inicializado para escuchar mensajes');
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      onMessage(this.messaging, (payload) => {
        console.log('Mensaje recibido en primer plano:', payload);
        resolve(payload);
      });
    });
  }

  // Mostrar notificación local
  async showLocalNotification(title, body, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
  }

  // Guardar token en base de datos
  async saveTokenToDatabase(token) {
    try {
      console.log('Token a guardar en BD:', token);
      
      // TODO: Implementar guardado en Firestore
      // Ejemplo:
      // import { doc, setDoc } from 'firebase/firestore';
      // import { db } from '../firebase/config';
      // const userRef = doc(db, 'users', 'current-user-id');
      // await setDoc(userRef, { fcmToken: token }, { merge: true });
      
    } catch (error) {
      console.error('Error al guardar token:', error);
    }
  }

  // Verificar soporte para notificaciones
  isSupported() {
    return (
      'Notification' in window && 
      'serviceWorker' in navigator &&
      typeof window !== 'undefined'
    );
  }
}

export default new NotificationService();