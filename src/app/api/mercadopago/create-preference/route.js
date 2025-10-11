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
      employmentId,
      userId, 
      userName, 
      productName, 
      serviceName, 
      employmentTitle,
      employmentName,
      amount, 
      type 
    } = body;

    // Determinar tipo de item
    let itemType, itemId, itemName;
    
    if (type === 'employment' || employmentId) {
      itemType = 'employment';
      itemId = employmentId;
      itemName = employmentTitle || employmentName || 'Empleo';
    } else if (type === 'service' || serviceId) {
      itemType = 'service';
      itemId = serviceId;
      itemName = serviceName;
    } else {
      itemType = 'product';
      itemId = productId;
      itemName = productName;
    }

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
        error: `Datos requeridos: ${itemType}Id, userId, ${itemType}Name/Title, amount` 
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
    let dashboardPath;
    if (itemType === 'employment') {
      dashboardPath = '/dashboard/tienda/empleos';
    } else if (itemType === 'service') {
      dashboardPath = '/dashboard/tienda/servicios';
    } else {
      dashboardPath = '/dashboard/tienda/productos';
    }

    // Descripción según el tipo
    let description;
    if (itemType === 'employment') {
      description = `Destacar publicación de empleo por 7 días en Family Market`;
    } else if (itemType === 'service') {
      description = `Destacar servicio por 7 días en Family Market`;
    } else {
      description = `Destacar producto por 7 días en Family Market`;
    }

    const preferenceData = {
      items: [
        {
          id: itemId,
          title: `Destacar: ${itemName}`,
          description: description,
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