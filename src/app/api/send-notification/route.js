// src/app/api/send-notification/route.js
import { NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase/admin';

export async function POST(request) {
  try {
    console.log('📤 Iniciando envío de notificación...');
    
    const { tokens, payload, notificationId } = await request.json();

    // Validar que tenemos los datos necesarios
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      console.error('❌ Tokens inválidos:', tokens);
      return NextResponse.json(
        { error: 'Se requiere un array de tokens válido' },
        { status: 400 }
      );
    }

    if (!payload || !payload.notification) {
      console.error('❌ Payload inválido:', payload);
      return NextResponse.json(
        { error: 'Se requiere un payload válido con notification' },
        { status: 400 }
      );
    }

    console.log(`📤 Enviando notificación a ${tokens.length} dispositivos`);
    console.log('🔔 Título:', payload.notification.title);
    console.log('📝 Mensaje:', payload.notification.body);

    // Preparar el mensaje para FCM
    const message = {
      notification: {
        title: payload.notification.title,
        body: payload.notification.body,
        // Solo incluir imageUrl si es una URL válida
        ...(payload.notification.icon && payload.notification.icon.startsWith('http') 
            ? { imageUrl: payload.notification.icon } 
            : {})
      },
      data: {
        ...payload.data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      webpush: {
        notification: {
          icon: payload.notification.icon || '/icon-192.png',
          badge: '/icon-192.png',
          requireInteraction: false,
          tag: 'family-market-notification',
          vibrate: [200, 100, 200]
        },
        fcmOptions: {
          link: payload.data?.url || '/dashboard'
        }
      }
    };

    let successCount = 0;
    let failureCount = 0;
    const failedTokens = [];

    // Enviar en lotes de 500 (límite de FCM)
    const batchSize = 500;
    const batches = [];
    
    for (let i = 0; i < tokens.length; i += batchSize) {
      batches.push(tokens.slice(i, i + batchSize));
    }

    console.log(`📦 Procesando ${batches.length} lotes...`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`📦 Procesando lote ${batchIndex + 1}/${batches.length} con ${batch.length} tokens...`);
      
      try {
        const response = await adminMessaging.sendEachForMulticast({
          ...message,
          tokens: batch
        });

        successCount += response.successCount;
        failureCount += response.failureCount;

        console.log(`✅ Lote ${batchIndex + 1}: ${response.successCount} éxitos, ${response.failureCount} fallos`);

        // Registrar tokens que fallaron para limpieza futura
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push({
              token: batch[idx],
              error: resp.error?.message || 'Error desconocido'
            });
            console.warn(`❌ Error enviando a token ${batch[idx].substring(0, 20)}...: ${resp.error?.message}`);
          }
        });

      } catch (batchError) {
        console.error(`❌ Error enviando lote ${batchIndex + 1}:`, batchError);
        failureCount += batch.length;
        batch.forEach(token => {
          failedTokens.push({
            token,
            error: batchError.message
          });
        });
      }
    }

    console.log(`✅ Notificación enviada - Éxito: ${successCount}, Fallos: ${failureCount}`);

    // Respuesta con estadísticas
    const response = {
      success: true,
      successCount,
      failureCount,
      totalTokens: tokens.length,
      notificationId,
      failedTokens: failedTokens.slice(0, 10) // Solo los primeros 10 para no sobrecargar
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error en API de notificaciones:', error);
    console.error('❌ Stack trace:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}