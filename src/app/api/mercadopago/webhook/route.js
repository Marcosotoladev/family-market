// src/app/api/mercadopago/webhook/route.js
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

// Función para verificar la firma del webhook
function verifyWebhookSignature(body, signature) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return signature === expectedSignature;
}

export async function POST(request) {
  try {
    console.log('🔔 Webhook received at:', new Date().toISOString());
    console.log('🌐 From URL:', request.url);
    
    // Obtener el cuerpo de la petición
    const body = await request.json();
    console.log('📦 Webhook body:', JSON.stringify(body, null, 2));
    
    // Verificar firma (opcional pero recomendado)
    const signature = request.headers.get('x-signature');
    if (signature && process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(body, signature);
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log('✅ Webhook signature verified');
    }

    const { type, data } = body;

    // Procesar solo notificaciones de pago
    if (type === 'payment') {
      console.log('💳 Processing payment notification for ID:', data.id);
      
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: data.id });
      
      console.log('💰 Payment status:', paymentData.status);
      console.log('🏷️ Payment metadata:', JSON.stringify(paymentData.metadata, null, 2));
      console.log('📝 External reference:', paymentData.external_reference);
      console.log('💵 Payment amount:', paymentData.transaction_amount);

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
        
        if (!product_id || !user_id) {
          console.error('❌ Missing product_id or user_id');
          console.log('Available data:', {
            metadata: paymentData.metadata,
            external_reference: paymentData.external_reference,
            payment_id: paymentData.id
          });
          return NextResponse.json({ error: 'Missing required metadata' }, { status: 400 });
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
            paymentMethod: paymentData.payment_method_id,
            payerEmail: paymentData.payer?.email
          });

          console.log(`🎉 Product ${product_id} featured until ${featuredUntil.toISOString()}`);
          
        } catch (firebaseError) {
          console.error('❌ Error updating Firebase:', firebaseError);
          return NextResponse.json({ 
            error: 'Error updating database',
            details: firebaseError.message 
          }, { status: 500 });
        }

      } else {
        console.log(`⚠️ Payment ${paymentData.id} status: ${paymentData.status}`);
        
        // Registrar pagos no aprobados
        if (paymentData.metadata?.product_id) {
          try {
            await addDoc(collection(db, 'featured_payments'), {
              productId: paymentData.metadata.product_id,
              userId: paymentData.metadata.user_id,
              paymentId: paymentData.id,
              amount: parseFloat(paymentData.metadata.amount || 0),
              status: paymentData.status,
              externalReference: paymentData.external_reference,
              fechaCreacion: serverTimestamp(),
              statusDetail: paymentData.status_detail
            });
          } catch (error) {
            console.error('Error logging payment:', error);
          }
        }
      }
    } else {
      console.log('ℹ️ Ignoring non-payment notification:', type);
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error.message 
    }, { status: 500 });
  }
}

// Endpoint de verificación
export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook endpoint active',
    timestamp: new Date().toISOString()
  });
}