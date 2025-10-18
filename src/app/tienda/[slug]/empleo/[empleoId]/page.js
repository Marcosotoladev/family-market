// src/app/tienda/[slug]/empleos/[empleoId]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getPublicStoreConfig } from '@/lib/storeConfigUtils';
import StoreLayout from '@/components/tienda/StoreLayout';
import { TIPOS_PUBLICACION } from '@/types/employment';
import OfertaEmpleoCard from '@/components/tienda/empleos/OfertaEmpleoCard';
import BusquedaEmpleoCard from '@/components/tienda/empleos/BusquedaEmpleoCard';
import ServicioProfesionalCard from '@/components/tienda/empleos/ServicioProfesionalCard';
import { Loader2, AlertCircle, ArrowLeft, Share2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function EmpleoDetailPage() {
  const params = useParams();
  const { slug, empleoId } = params;

  const [storeData, setStoreData] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);
  const [empleoData, setEmpleoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug && empleoId) {
      loadData();
    }
  }, [slug, empleoId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar tienda por slug
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('storeSlug', '==', slug));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Tienda no encontrada');
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = {
        id: userDoc.id,
        ...userDoc.data()
      };

      if (userData.accountStatus !== 'approved' && userData.accountStatus !== 'true') {
        setError('Esta tienda no está disponible');
        return;
      }

      // Cargar configuración de la tienda
      const config = await getPublicStoreConfig(userData.id);

      // Cargar datos del empleo
      const empleoDoc = await getDoc(doc(db, 'empleos', empleoId));
      
      if (!empleoDoc.exists()) {
        setError('Empleo no encontrado');
        return;
      }

      const empleo = {
        id: empleoDoc.id,
        ...empleoDoc.data()
      };

      // Verificar que el empleo pertenece a esta tienda
      if (empleo.usuarioId !== userData.id) {
        setError('Este empleo no pertenece a esta tienda');
        return;
      }

      // Incrementar contador de vistas
      await updateDoc(doc(db, 'empleos', empleoId), {
        vistas: increment(1)
      });

      setStoreData(userData);
      setStoreConfig(config);
      setEmpleoData(empleo);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar el empleo');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar colores personalizados
  useEffect(() => {
    if (storeConfig) {
      const root = document.documentElement;
      
      if (storeConfig.primaryColor) {
        root.style.setProperty('--store-primary-color', storeConfig.primaryColor);
      }
      if (storeConfig.secondaryColor) {
        root.style.setProperty('--store-secondary-color', storeConfig.secondaryColor);
      }
    }
    
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--store-primary-color');
      root.style.removeProperty('--store-secondary-color');
    };
  }, [storeConfig]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: empleoData.titulo,
          text: empleoData.descripcion,
          url: url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando empleo...</p>
        </div>
      </div>
    );
  }

  if (error || !storeData || !empleoData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'No se pudo cargar el empleo'}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/tienda/${slug}/empleos`}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Ver todos los empleos
            </Link>
            <Link
              href={`/tienda/${slug}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StoreLayout
      storeData={storeData}
      storeConfig={storeConfig}
    >
      {/* Breadcrumbs */}
      <div className="bg-gray-50 dark:bg-gray-900 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link 
              href={`/tienda/${slug}`}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {storeData.businessName || storeData.familyName}
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <Link 
              href={`/tienda/${slug}/empleos`}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Empleos
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-gray-900 dark:text-white font-medium line-clamp-1">
              {empleoData.titulo}
            </span>
          </nav>
        </div>
      </div>

      {/* Header de página */}
      <div className="bg-white dark:bg-gray-800 py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href={`/tienda/${slug}/empleos`}
                className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {empleoData.titulo}
                </h1>
                {empleoData.vistas > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <Eye className="w-4 h-4" />
                    {empleoData.vistas} {empleoData.vistas === 1 ? 'vista' : 'vistas'}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Card del empleo */}
          <div className="mb-8">
            {empleoData.tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO && (
              <OfertaEmpleoCard
                oferta={empleoData}
                storeData={storeData}
                variant="grid"
                showContactInfo={true}
                showStoreInfo={false}
              />
            )}

            {empleoData.tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO && (
              <BusquedaEmpleoCard
                busqueda={empleoData}
                variant="grid"
                showContactInfo={true}
              />
            )}

            {empleoData.tipoPublicacion === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL && (
              <ServicioProfesionalCard
                servicio={empleoData}
                storeData={storeData}
                variant="grid"
                showContactInfo={true}
                showStoreInfo={false}
              />
            )}
          </div>

          {/* Información adicional de la tienda */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Acerca de la tienda
            </h3>
            <div className="flex items-center gap-4">
              {storeData.logoUrl && (
                <img
                  src={storeData.logoUrl}
                  alt={storeData.businessName || storeData.familyName}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  {storeData.businessName || storeData.familyName}
                </h4>
                {storeData.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {storeData.description}
                  </p>
                )}
              </div>
              <Link
                href={`/tienda/${slug}`}
                className="flex-shrink-0 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                Ver tienda
              </Link>
            </div>
          </div>

          {/* Botón de ver más empleos */}
          <div className="text-center">
            <Link
              href={`/tienda/${slug}/empleos`}
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ver más empleos de esta tienda
            </Link>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}