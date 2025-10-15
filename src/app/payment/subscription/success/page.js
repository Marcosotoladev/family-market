// src/app/payment/subscription/success/page.js

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft, Store, Loader, Sparkles, Calendar, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  
  // Intentar obtener userId de varias fuentes
  const userIdFromQuery = searchParams.get('user_id');
  const externalReference = searchParams.get('external_reference');
  
  // Extraer userId del external_reference si existe (formato: subscription_userId)
  const userIdFromReference = externalReference?.replace('subscription_', '');
  
  // Prioridad: 1. Query param, 2. External reference, 3. Usuario logueado
  const userId = userIdFromQuery || userIdFromReference || user?.uid;

  // ⚠️ VALIDACIÓN: Si no hay userId o parámetros de pago, redirigir
  useEffect(() => {
    const hasPaymentParams = userIdFromQuery || externalReference || searchParams.get('collection_status');
    
    if (!hasPaymentParams && !loading) {
      console.log('⚠️ No payment parameters found, redirecting to home');
      router.push('/');
    }
  }, [userIdFromQuery, externalReference, searchParams, loading, router]);

  useEffect(() => {
    const checkSubscription = async () => {
      // Si no hay userId, no hacer nada
      if (!userId) {
        console.log('⚠️ No userId found, skipping subscription check');
        setLoading(false);
        return;
      }

      // Verificar que realmente haya parámetros de pago
      const hasPaymentParams = userIdFromQuery || externalReference || searchParams.get('collection_status');
      if (!hasPaymentParams) {
        console.log('⚠️ No payment parameters, skipping activation');
        setLoading(false);
        return;
      }

      try {
        // Esperar para que el webhook procese y verificar varias veces
        let attempts = 0;
        const maxAttempts = 5;
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const userRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.accountStatus === 'approved' && userData.subscription?.isActive) {
              console.log('✅ Subscription activated!');
              setSubscriptionActive(true);
              break;
            }
          }
          
          attempts++;
          console.log(`⏳ Attempt ${attempts}/${maxAttempts} - waiting for webhook...`);
        }
        
        if (attempts >= maxAttempts) {
          console.log('⚠️ Max attempts reached. Attempting manual activation...');
          await activateSubscriptionManually(userId);
          
          // Verificar nuevamente
          const userRef = doc(db, 'users', userId);
          const updatedUserSnap = await getDoc(userRef);
          if (updatedUserSnap.exists()) {
            const updatedUserData = updatedUserSnap.data();
            if (updatedUserData.accountStatus === 'approved') {
              setSubscriptionActive(true);
            }
          }
        }
        
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [userId, userIdFromQuery, externalReference, searchParams]);

  // Función para activar suscripción manualmente
  const activateSubscriptionManually = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const nextBillingDate = new Date();
      nextBillingDate.setDate(nextBillingDate.getDate() + 30);

      await updateDoc(userRef, {
        accountStatus: 'approved',
        subscription: {
          isActive: true,
          planType: 'tienda_online',
          startDate: new Date(),
          expiresAt: nextBillingDate,
          amount: 2500,
          currency: 'ARS',
          autoRenewal: true,
          activatedAt: new Date(),
          activationMethod: 'manual_success_page'
        },
        updatedAt: new Date()
      });

      console.log('✅ Subscription activated manually for user:', uid);
      return true;
    } catch (error) {
      console.error('❌ Error activating subscription manually:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <Loader className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">
            Activando tu tienda online...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Esto puede tomar unos segundos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-8 text-white text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">
            ¡Suscripción Activada!
          </h1>
          <p className="text-orange-100">
            Tu tienda online está lista para recibir clientes
          </p>
        </div>

        {/* Contenido */}
        <div className="p-8">
          {/* Estado de suscripción */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Store className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  Tienda Online Activa
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {subscriptionActive 
                    ? 'Tu cuenta ha sido aprobada automáticamente y tu tienda ya está disponible.'
                    : 'Tu suscripción está siendo procesada. En unos momentos tu tienda estará activa.'}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>Facturación</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">Mensual</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                      <CreditCard className="w-4 h-4" />
                      <span>Monto</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">$2.500 ARS</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Beneficios */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
              Beneficios de tu suscripción
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Tienda online personalizada</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Con tu propio dominio y diseño único</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Publicaciones ilimitadas</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Productos, servicios y ofertas de empleo sin límite</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Galería y testimonios</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Muestra tu trabajo y reseñas de clientes</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Sistema de mensajería</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Comunícate directamente con tus clientes</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Personalización total</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Colores, temas y secciones configurables</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Link
              href="/dashboard/store"
              className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Store className="w-5 h-5" />
              <span>Configurar mi tienda</span>
            </Link>
            
            <Link
              href="/dashboard"
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ir al panel de control</span>
            </Link>
          </div>

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Próximos pasos recomendados:
            </h4>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>1. Personaliza el diseño y colores de tu tienda</li>
              <li>2. Agrega tu logo y información de contacto</li>
              <li>3. Publica tus primeros productos o servicios</li>
              <li>4. Comparte tu tienda en redes sociales</li>
            </ol>
          </div>

          {/* Nota sobre facturación */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>💡 Nota:</strong> Tu suscripción se renovará automáticamente cada mes. 
              Puedes cancelarla en cualquier momento desde tu panel de MercadoPago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscriptionSuccessLoading() {
  return (
    <div className="max-w-md w-full">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <Loader className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    </div>
  );
}

export default function SubscriptionSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <Suspense fallback={<SubscriptionSuccessLoading />}>
        <SubscriptionSuccessContent />
      </Suspense>
    </div>
  );
}