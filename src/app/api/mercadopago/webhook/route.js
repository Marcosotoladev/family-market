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
    const body = await request.json();
    const { type, data } = body;

    console.log('Webhook received:', { type, data });

    if (type === 'payment') {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: data.id });

      console.log('Payment data:', paymentData.status, paymentData.id);

      if (paymentData.status === 'approved') {
        const { product_id, user_id, amount } = paymentData.metadata;
        
        if (!product_id || !user_id) {
          console.error('Missing product_id or user_id in metadata');
          return NextResponse.json({ error: 'Missing required metadata' }, { status: 400 });
        }
        
        // Calcular fecha de expiración (7 días)
        const featuredUntil = new Date();
        featuredUntil.setDate(featuredUntil.getDate() + 7);

        try {
          // Actualizar producto como destacado
          const productRef = doc(db, 'productos', product_id);
          await updateDoc(productRef, {
            featured: true,
            featuredUntil: featuredUntil,
            featuredPaymentId: paymentData.id,
            featuredAmount: parseFloat(amount || 0),
            fechaDestacado: serverTimestamp()
          });

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

          console.log(`Product ${product_id} featured until ${featuredUntil.toISOString()}`);
          
        } catch (firebaseError) {
          console.error('Error updating Firebase:', firebaseError);
          return NextResponse.json({ 
            error: 'Error updating database',
            details: firebaseError.message 
          }, { status: 500 });
        }
      } else if (paymentData.status === 'rejected') {
        console.log(`Payment ${paymentData.id} was rejected`);
        
        // Opcionalmente, registrar pagos rechazados
        const { product_id, user_id, amount } = paymentData.metadata;
        if (product_id && user_id) {
          try {
            await addDoc(collection(db, 'featured_payments'), {
              productId: product_id,
              userId: user_id,
              paymentId: paymentData.id,
              amount: parseFloat(amount || 0),
              status: 'rejected',
              externalReference: paymentData.external_reference,
              fechaCreacion: serverTimestamp(),
              rejectionReason: paymentData.status_detail
            });
          } catch (error) {
            console.error('Error logging rejected payment:', error);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error.message 
    }, { status: 500 });
  }
}