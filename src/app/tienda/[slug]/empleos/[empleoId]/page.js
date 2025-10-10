// src/app/tienda/[slug]/empleo/[empleoId]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { TIPOS_PUBLICACION } from '@/types/employment';
import OfertaEmpleoCard from '@/components/tienda/empleos/OfertaEmpleoCard';
import BusquedaEmpleoCard from '@/components/tienda/empleos/BusquedaEmpleoCard';
import ServicioProfesionalCard from '@/components/tienda/empleos/ServicioProfesionalCard';
import { ArrowLeft, Share2, Briefcase, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EmpleoDetailPage() {
  const params = useParams();
  const { slug, empleoId } = params;
  
  const [empleo, setEmpleo] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Params recibidos:', params);
    console.log('EmpleoId:', empleoId);
    console.log('Slug:', slug);
    
    if (empleoId && slug) {
      loadEmpleoAndStore();
    } else {
      setError('Parámetros de URL inválidos');
      setLoading(false);
    }
  }, [empleoId, slug, params]);

  const loadEmpleoAndStore = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Intentando cargar empleo con ID:', empleoId);
      
      // Validar que empleoId existe y es string
      if (!empleoId || typeof empleoId !== 'string') {
        throw new Error('ID de empleo inválido');
      }
      
      // Cargar empleo
      const empleoDoc = await getDoc(doc(db, 'empleos', empleoId));
      if (!empleoDoc.exists()) {
        setError('Empleo no encontrado');
        return;
      }
      
      const empleoData = { id: empleoDoc.id, ...empleoDoc.data() };
      console.log('Empleo cargado:', empleoData);
      setEmpleo(empleoData);
      
      // Cargar datos de la tienda
      if (empleoData.usuarioId) {
        const storeDoc = await getDoc(doc(db, 'users', empleoData.usuarioId));
        if (storeDoc.exists()) {
          setStoreData(storeDoc.data());
          console.log('Datos de tienda cargados:', storeDoc.data());
        }
      }
      
    } catch (error) {
      console.error('Error cargando empleo:', error);
      setError(`Error al cargar el empleo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getTipoEmpleoLabel = () => {
    if (!empleo) return 'Empleo';
    
    switch (empleo.tipoPublicacion) {
      case TIPOS_PUBLICACION.OFERTA_EMPLEO:
        return 'Oferta de Empleo';
      case TIPOS_PUBLICACION.BUSQUEDA_EMPLEO:
        return 'Búsqueda de Empleo';
      case TIPOS_PUBLICACION.SERVICIO_PROFESIONAL:
        return 'Servicio Profesional';
      default:
        return 'Empleo';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando empleo...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            ID: {empleoId || 'No disponible'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !empleo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'Empleo no encontrado'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ID buscado: {empleoId || 'No disponible'}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Slug: {slug || 'No disponible'}
          </p>
          <Link 
            href={slug ? `/tienda/${slug}/empleos` : '/'}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {slug ? 'Volver a empleos' : 'Ir al inicio'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link 
            href="/"
            className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            Inicio
          </Link>
          <span>/</span>
          <Link 
            href={`/tienda/${slug}`}
            className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            {storeData?.businessName || storeData?.familyName || 'Tienda'}
          </Link>
          <span>/</span>
          <Link 
            href={`/tienda/${slug}/empleos`}
            className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            Empleos
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {empleo.titulo}
          </span>
        </nav>

        {/* Header con botón de volver */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href={`/tienda/${slug}/empleos`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a empleos
          </Link>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: empleo.titulo,
                    text: empleo.descripcion,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Enlace copiado al portapapeles');
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna izquierda - Detalles del empleo */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tipo de publicación badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm font-medium">
              <Briefcase className="w-4 h-4 mr-2" />
              {getTipoEmpleoLabel()}
            </div>

            {/* Tarjeta del empleo */}
            <div className="max-w-2xl">
              {empleo.tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO && (
                <OfertaEmpleoCard
                  oferta={empleo}
                  storeData={storeData}
                  variant="grid"
                  showContactInfo={true}
                  showStoreInfo={true}
                />
              )}

              {empleo.tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO && (
                <BusquedaEmpleoCard
                  busqueda={empleo}
                  variant="grid"
                  showContactInfo={true}
                />
              )}

              {empleo.tipoPublicacion === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL && (
                <ServicioProfesionalCard
                  servicio={empleo}
                  storeData={storeData}
                  variant="grid"
                  showContactInfo={true}
                  showStoreInfo={true}
                />
              )}
            </div>
            
            {/* Descripción completa */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Descripción Detallada
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {empleo.descripcion}
                </p>
              </div>
              
              {/* Información adicional */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {empleo.categoria && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Categoría</h4>
                      <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                        {empleo.categoria}
                      </span>
                    </div>
                  )}

                  {empleo.subcategoria && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Subcategoría</h4>
                      <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                        {empleo.subcategoria}
                      </span>
                    </div>
                  )}

                  {empleo.tipoEmpleo && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tipo de empleo</h4>
                      <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm">
                        {empleo.tipoEmpleo}
                      </span>
                    </div>
                  )}

                  {empleo.modalidad && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Modalidad</h4>
                      <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-full text-sm">
                        {empleo.modalidad}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Columna derecha - Información adicional */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* Información de la tienda */}
              {storeData && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Publicado por
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {storeData.businessName || storeData.familyName}
                      </p>
                    </div>

                    {storeData.phone && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Teléfono</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{storeData.phone}</p>
                      </div>
                    )}

                    {storeData.email && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{storeData.email}</p>
                      </div>
                    )}

                    <Link
                      href={`/tienda/${slug}`}
                      className="block w-full text-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium mt-4"
                    >
                      Ver tienda completa
                    </Link>
                  </div>
                </div>
              )}

              {/* Fecha de publicación */}
              {empleo.fechaCreacion && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Información de publicación
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Publicado el {new Date(empleo.fechaCreacion.seconds * 1000).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {/* CTA adicional */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-700 p-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  ¿Te interesa?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  No pierdas esta oportunidad. Contacta ahora mismo usando los botones de contacto en la tarjeta.
                </p>
                <div className="flex items-center justify-center">
                  <Briefcase className="w-12 h-12 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}