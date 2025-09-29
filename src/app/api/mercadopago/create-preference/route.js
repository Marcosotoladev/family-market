// src/app/api/mercadopago/create-preference/route.js
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      productId, 
      serviceId, 
      userId, 
      userName, 
      productName, 
      serviceName, 
      amount, 
      type 
    } = body;

    // Determinar si es producto o servicio
    const isService = type === 'service' || serviceId;
    const itemId = isService ? serviceId : productId;
    const itemName = isService ? serviceName : productName;
    const itemType = isService ? 'service' : 'product';

    console.log('📥 Received request:', { 
      itemId, 
      userId, 
      userName, 
      itemName, 
      amount, 
      type: itemType 
    });

    // Validaciones
    if (!itemId || !userId || !itemName || !amount) {
      return NextResponse.json({ 
        error: `Datos requeridos: ${itemType}Id, userId, ${itemType}Name, amount` 
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

    // Configurar URLs de retorno según el tipo
    const dashboardPath = isService ? 
      '/dashboard/tienda/servicios' : 
      '/dashboard/tienda/productos';

    const preferenceData = {
      items: [
        {
          id: itemId,
          title: `Destacar: ${itemName}`,
          description: `Destacar ${itemType === 'service' ? 'servicio' : 'producto'} por 7 días en Family Market`,
          quantity: 1,
          unit_price: parseFloat(amount),
          currency_id: 'ARS'
        }
      ],
      back_urls: {
        success: `${baseUrl}/payment/success?${itemType}_id=${itemId}`,
        failure: `${baseUrl}${dashboardPath}?payment=failed`,
        pending: `${baseUrl}${dashboardPath}?payment=pending`
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      // External reference con formato: tipo_id_userId
      external_reference: `${itemType}_${itemId}_${userId}`,
      payer: {
        name: userName || 'Usuario Family Market'
      },
      metadata: {
        item_id: itemId,
        user_id: userId,
        type: `featured_${itemType}`,
        amount: amount.toString(),
        item_type: itemType
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