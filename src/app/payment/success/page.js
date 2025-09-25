// src/app/payment/success/page.js
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('product_id');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Pago Exitoso!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Tu producto ahora está destacado por 7 días
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-yellow-700 dark:text-yellow-300 mb-2">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-medium">Producto Destacado</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Aparecerá en la sección principal del home
            </p>
          </div>

          <Link
            href="/dashboard/tienda/productos"
            className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a mis productos</span>
          </Link>
        </div>
      </div>
    </div>
  );
}