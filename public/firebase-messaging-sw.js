// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuración de Firebase con tus datos
const firebaseConfig = {
  apiKey: "AIzaSyDptJ7MH9xcrWCal4X38OU9FDbokm0vIP8",
  authDomain: "familymarket-b9da2.firebaseapp.com",
  projectId: "familymarket-b9da2",
  storageBucket: "familymarket-b9da2.firebasestorage.app",
  messagingSenderId: "330651711838",
  appId: "1:330651711838:web:3d13f351aa64edf78b37cf",
  measurementId: "G-5DC7915W5R"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar Firebase Messaging
const messaging = firebase.messaging();

// Manejar mensajes en segundo plano
messaging.onBackgroundMessage(function(payload) {
  console.log('Mensaje recibido en segundo plano: ', payload);
  
  const notificationTitle = payload.notification?.title || 'Family Market';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva notificación',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'family-market-notification',
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', function(event) {
  console.log('Clic en notificación: ', event.notification);
  
  event.notification.close();
  
  // Determinar la URL según los datos de la notificación
  let urlToOpen = '/';
  if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  }
  
  // Abrir la aplicación cuando se hace clic en la notificación
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Si hay una ventana abierta, enfocarla
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Manejar acciones de notificación
self.addEventListener('notificationclick', function(event) {
  if (event.action === 'close') {
    event.notification.close();
    return;
  }
  
  if (event.action === 'open') {
    event.notification.close();
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});