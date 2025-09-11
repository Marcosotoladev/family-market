// src/lib/services/notificationService.js - Versión limpia sin logs de debug
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app } from '../firebase/config';

class NotificationService {
  constructor() {
    this.messaging = null;
    this.vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    this.isInitialized = false;
    this.initPromise = null;
  }

  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    if (this.isInitialized) {
      return true;
    }

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  async _doInitialize() {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      const supported = await isSupported();
      if (!supported) {
        return false;
      }

      this.messaging = getMessaging(app);
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error al inicializar Firebase Messaging:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async requestPermission() {
    try {
      const initialized = await this.initialize();
      if (!initialized) return null;

      if (!this.vapidKey) {
        throw new Error('VAPID key no configurada en variables de entorno');
      }

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        return await this.getToken();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      throw error;
    }
  }

  async getToken() {
    try {
      const initialized = await this.initialize();
      if (!initialized) return null;

      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey
      });
      
      return token || null;
    } catch (error) {
      console.error('Error al obtener token FCM:', error);
      throw error;
    }
  }

  async onMessageListener() {
    try {
      const initialized = await this.initialize();
      if (!initialized || !this.messaging) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        onMessage(this.messaging, (payload) => {
          resolve(payload);
        });
      });
    } catch (error) {
      console.error('Error configurando listener:', error);
      return Promise.resolve();
    }
  }

  async showLocalNotification(title, body, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200],
          tag: 'family-market-local',
          ...options
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        return notification;
      } catch (error) {
        console.error('Error mostrando notificación local:', error);
      }
    }
  }

  isSupported() {
    return (
      'Notification' in window && 
      'serviceWorker' in navigator &&
      typeof window !== 'undefined'
    );
  }
}

export default new NotificationService();