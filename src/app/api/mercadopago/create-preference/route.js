// src/app/api/mercadopago/create-preference/route.js
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, userId, userName, productName, amount } = body;

    console.log('📥 Received request:', { productId, userId, userName, productName, amount });

    // Validaciones
    if (!productId || !userId || !productName || !amount) {
      return NextResponse.json({ 
        error: 'Datos requeridos: productId, userId, productName, amount' 
      }, { status: 400 });
    }

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json({ 
        error: 'MercadoPago no configurado correctamente' 
      }, { status: 500 });
    }

    // URL base
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://familymarket.vercel.app';
    console.log('🌐 Using base URL:', baseUrl);

    const preference = new Preference(client);

    const preferenceData = {
      items: [
        {
          id: productId,
          title: `Destacar: ${productName}`,
          description: 'Destacar producto por 7 días en Family Market',
          quantity: 1,
          unit_price: parseFloat(amount),
          currency_id: 'ARS'
        }
      ],
      back_urls: {
        success: `${baseUrl}/payment/success?product_id=${productId}`,
        failure: `${baseUrl}/dashboard/tienda/productos?payment=failed`,
        pending: `${baseUrl}/dashboard/tienda/productos?payment=pending`
      },
      auto_return: 'approved',
      // ✅ ESTO ES CRUCIAL - notification_url
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      // ✅ USAR EL FORMATO CORRECTO para external_reference  
      external_reference: `product_${productId}_${userId}`,
      payer: {
        name: userName || 'Usuario Family Market'
      },
      // ✅ CORREGIR LOS NOMBRES DE LOS CAMPOS en metadata
      metadata: {
        product_id: productId,     // ⬅️ Cambiar productId → product_id
        user_id: userId,           // ⬅️ Cambiar userId → user_id
        type: 'featured_product',
        amount: amount.toString()
      }
    };

    console.log('🔄 Creating preference with data:', JSON.stringify(preferenceData, null, 2));

    const result = await preference.create({ body: preferenceData });

    console.log('✅ Preference created successfully:', result.id);

    return NextResponse.json({
      preferenceId: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    });

  } catch (error) {
    console.error('❌ Error creating MercadoPago preference:', error);
    return NextResponse.json({ 
      error: 'Error creating payment preference',
      details: error.message 
    }, { status: 500 });
  }
}