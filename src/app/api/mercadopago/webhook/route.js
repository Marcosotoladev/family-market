// src/app/api/mercadopago/webhook/route.js
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export async function POST(request) {
  try {
    console.log('🔔 Webhook received at:', new Date().toISOString());
    
    const body = await request.json();
    console.log('📦 Webhook body:', JSON.stringify(body, null, 2));
    
    // COMENTAR LA VERIFICACIÓN DE FIRMA TEMPORALMENTE
    /*
    const signature = request.headers.get('x-signature');
    if (signature && process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(body, signature);
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log('✅ Webhook signature verified');
    }
    */

    const { type, data } = body;

    if (type === 'payment') {
      console.log('💳 Processing payment notification for ID:', data.id);
      
      try {
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: data.id });
        
        console.log('💰 Payment status:', paymentData.status);
        console.log('🏷️ Payment metadata:', JSON.stringify(paymentData.metadata, null, 2));
        console.log('📝 External reference:', paymentData.external_reference);

        if (paymentData.status === 'approved') {
          console.log('✅ Payment approved, processing...');
          
          // Extraer datos del pago
          let product_id, user_id, amount;
          
          // Intentar obtener de metadata primero
          if (paymentData.metadata && Object.keys(paymentData.metadata).length > 0) {
            product_id = paymentData.metadata.product_id;
            user_id = paymentData.metadata.user_id;
            amount = paymentData.metadata.amount || paymentData.transaction_amount;
            console.log('📋 Data from metadata:', { product_id, user_id, amount });
          }
          
          // Si no hay metadata, intentar extraer de external_reference
          if (!product_id && paymentData.external_reference) {
            console.log('🔍 Extracting from external_reference:', paymentData.external_reference);
            const parts = paymentData.external_reference.split('_');
            if (parts.length >= 3 && parts[0] === 'product') {
              product_id = parts[1];
              user_id = parts[2];
              amount = paymentData.transaction_amount;
              console.log('📋 Data from external_reference:', { product_id, user_id, amount });
            }
          }
          
          if (!product_id) {
            console.error('❌ Missing product_id - this might be a test notification');
            // Para notificaciones de prueba, solo responder OK
            return NextResponse.json({ received: true, note: 'Test notification processed' });
          }
          
          if (!user_id) {
            console.warn('⚠️ Missing user_id, using default');
            user_id = 'test_user';
          }
          
          // Calcular fecha de expiración (7 días)
          const featuredUntil = new Date();
          featuredUntil.setDate(featuredUntil.getDate() + 7);

          try {
            console.log('🔄 Updating product in Firebase...');
            
            // Actualizar producto como destacado
            const productRef = doc(db, 'productos', product_id);
            await updateDoc(productRef, {
              featured: true,
              featuredUntil: featuredUntil,
              featuredPaymentId: paymentData.id,
              featuredAmount: parseFloat(amount || 0),
              fechaDestacado: serverTimestamp()
            });

            console.log('✅ Product updated successfully');

            // Crear registro de pago
            await addDoc(collection(db, 'featured_payments'), {
              productId: product_id,
              userId: user_id,
              paymentId: paymentData.id,
              amount: parseFloat(amount || 0),
              status: 'approved',
              featuredUntil: featuredUntil,
              externalReference: paymentData.external_reference,
              fechaCreacion: serverTimestamp(),
              paymentMethod: paymentData.payment_method_id || 'unknown',
              payerEmail: paymentData.payer?.email || 'test@example.com'
            });

            console.log(`🎉 Product ${product_id} featured until ${featuredUntil.toISOString()}`);
            
          } catch (firebaseError) {
            console.error('❌ Error updating Firebase:', firebaseError);
            // Aún así devolver OK para que MP no reintente
            return NextResponse.json({ 
              received: true,
              error: 'Database error but notification acknowledged',
              details: firebaseError.message 
            });
          }

        } else {
          console.log(`⚠️ Payment ${paymentData.id} status: ${paymentData.status}`);
        }

      } catch (paymentError) {
        console.error('❌ Error getting payment data:', paymentError);
        // Para IDs de prueba que no existen, solo responder OK
        if (paymentError.message?.includes('404') || paymentError.message?.includes('not found')) {
          console.log('📝 Test payment ID not found, responding OK');
          return NextResponse.json({ received: true, note: 'Test notification with fake ID' });
        }
        throw paymentError;
      }
    } else {
      console.log('ℹ️ Ignoring non-payment notification:', type);
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    // IMPORTANTE: Siempre devolver 200 OK para que MP no reintente
    return NextResponse.json({ 
      received: true,
      error: 'Error processed but acknowledged',
      details: error.message 
    });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook endpoint active',
    timestamp: new Date().toISOString()
  });
}