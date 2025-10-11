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
    
    const { type, data } = body;

    if (type === 'payment') {
      console.log('💳 Processing payment notification for ID:', data.id);
      
      try {
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: data.id });
        
        console.log('💰 Payment status:', paymentData.status);
        console.log('💰 Payment state:', paymentData.status_detail);
        console.log('🏷️ Payment metadata:', JSON.stringify(paymentData.metadata, null, 2));
        console.log('📝 External reference:', paymentData.external_reference);

        const isSuccessfulPayment = paymentData.status === 'approved' || 
                                  paymentData.status === 'in_process' ||
                                  (paymentData.status === 'pending' && paymentData.status_detail === 'pending_waiting_payment');

        if (isSuccessfulPayment) {
          console.log('✅ Payment successful, processing...');
          
          let item_id, user_id, amount, item_type;
          
          // Intentar obtener de metadata primero
          if (paymentData.metadata && Object.keys(paymentData.metadata).length > 0) {
            item_id = paymentData.metadata.item_id;
            user_id = paymentData.metadata.user_id;
            amount = paymentData.metadata.amount || paymentData.transaction_amount;
            item_type = paymentData.metadata.item_type || 'product';
            console.log('📋 Data from metadata:', { item_id, user_id, amount, item_type });
          }
          
          // Si no hay metadata, extraer de external_reference
          if (!item_id && paymentData.external_reference) {
            console.log('🔍 Extracting from external_reference:', paymentData.external_reference);
            const parts = paymentData.external_reference.split('_');
            if (parts.length >= 3) {
              item_type = parts[0]; // 'product', 'service' o 'employment'
              item_id = parts[1];
              user_id = parts[2];
              amount = paymentData.transaction_amount;
              console.log('📋 Data from external_reference:', { item_id, user_id, amount, item_type });
            }
          }
          
          if (!item_id) {
            console.error('❌ Missing item_id - test notification');
            return NextResponse.json({ received: true, note: 'Test notification processed' });
          }
          
          if (!user_id) {
            console.warn('⚠️ Missing user_id, using default');
            user_id = 'test_user';
          }

          // ✅ CORREGIDO: Determinar colección según el tipo (incluyendo employment)
          let collectionName, itemLabel;
          
          if (item_type === 'employment') {
            collectionName = 'empleos';
            itemLabel = 'empleo';
          } else if (item_type === 'service') {
            collectionName = 'servicios';
            itemLabel = 'servicio';
          } else {
            collectionName = 'productos';
            itemLabel = 'producto';
          }
          
          const featuredUntil = new Date();
          featuredUntil.setDate(featuredUntil.getDate() + 7);

          try {
            console.log(`🔄 Updating ${itemLabel} in Firebase...`);
            console.log(`🆔 ${itemLabel} ID:`, item_id);
            console.log('📅 Featured until:', featuredUntil.toISOString());
            console.log('📚 Collection:', collectionName);
            console.log('🔍 Item type detected:', item_type);
            
            const itemRef = doc(db, collectionName, item_id);
            
            await updateDoc(itemRef, {
              featured: true,
              featuredUntil: featuredUntil,
              featuredPaymentId: paymentData.id,
              featuredAmount: parseFloat(amount || paymentData.transaction_amount || 0),
              fechaDestacado: serverTimestamp()
            });

            console.log(`✅ ${itemLabel} updated successfully in ${collectionName}`);

            // Crear registro de pago
            await addDoc(collection(db, 'featured_payments'), {
              itemId: item_id,
              itemType: item_type,
              userId: user_id,
              paymentId: paymentData.id,
              amount: parseFloat(amount || paymentData.transaction_amount || 0),
              status: paymentData.status,
              featuredUntil: featuredUntil,
              externalReference: paymentData.external_reference,
              fechaCreacion: serverTimestamp(),
              paymentMethod: paymentData.payment_method_id || 'unknown',
              payerEmail: paymentData.payer?.email || 'test@example.com',
              statusDetail: paymentData.status_detail
            });

            console.log(`🎉 ${itemLabel} ${item_id} featured until ${featuredUntil.toISOString()}`);
            
          } catch (firebaseError) {
            console.error('❌ Error updating Firebase:', firebaseError);
            console.error('❌ Firebase error details:', firebaseError.code, firebaseError.message);
            console.error('❌ Attempted collection:', collectionName);
            console.error('❌ Attempted item_id:', item_id);
            
            return NextResponse.json({ 
              received: true,
              error: 'Database error but notification acknowledged',
              details: firebaseError.message 
            });
          }

        } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
          console.log(`❌ Payment ${paymentData.id} was ${paymentData.status}: ${paymentData.status_detail}`);
          
          const { item_id, user_id, amount, item_type } = paymentData.metadata || {};
          if (item_id && user_id) {
            try {
              await addDoc(collection(db, 'featured_payments'), {
                itemId: item_id,
                itemType: item_type || 'product',
                userId: user_id,
                paymentId: paymentData.id,
                amount: parseFloat(amount || paymentData.transaction_amount || 0),
                status: paymentData.status,
                externalReference: paymentData.external_reference,
                fechaCreacion: serverTimestamp(),
                rejectionReason: paymentData.status_detail
              });
            } catch (error) {
              console.error('Error logging rejected payment:', error);
            }
          }
        } else {
          console.log(`⚠️ Payment ${paymentData.id} status: ${paymentData.status} - ${paymentData.status_detail}`);
        }

      } catch (paymentError) {
        console.error('❌ Error getting payment data:', paymentError);
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