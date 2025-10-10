// src/components/tienda/empleos/BusquedaEmpleoCard.js
'use client';

import { useState } from 'react';
import {
  Share2,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  User,
  Briefcase,
  Award,
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-react';
import FavoriteButton from '@/components/ui/FavoriteButton';

export default function BusquedaEmpleoCard({
  busqueda,
  variant = 'grid',
  showContactInfo = true,
  onClick = null
}) {
  const [showDetails, setShowDetails] = useState(false);

  if (!busqueda) return null;

  const handleWhatsAppContact = (e) => {
    e.stopPropagation();
    const phone = busqueda.contacto?.whatsapp || '';
    const message = `Hola! Vi tu búsqueda de empleo: ${busqueda.titulo}`;
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePhoneContact = (e) => {
    e.stopPropagation();
    const phone = busqueda.contacto?.telefono || '';
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailContact = (e) => {
    e.stopPropagation();
    const email = busqueda.contacto?.email || '';
    const subject = `Sobre tu búsqueda: ${busqueda.titulo}`;
    const body = `Hola! Vi que estás buscando empleo como: ${busqueda.titulo}`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const busquedaUrl = `${window.location.origin}/empleos/${busqueda.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: busqueda.titulo,
          text: busqueda.descripcion,
          url: busquedaUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(busquedaUrl);
      alert('Enlace copiado al portapapeles');
    }
  };

  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  // Formatear ubicación
  const formatearUbicacion = (ubicacion) => {
    if (!ubicacion) return '';
    if (typeof ubicacion === 'string') return ubicacion;
    return [
      ubicacion.direccion,
      ubicacion.ciudad,
      ubicacion.provincia,
      ubicacion.pais
    ].filter(Boolean).join(', ');
  };

  // Variante Grid
  if (variant === 'grid') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header con ícono y acciones */}
        <div 
          className={`relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 ${onClick ? 'cursor-pointer' : ''}`}
          onClick={onClick}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-600 flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight">
                  {busqueda.titulo}
                </h3>
                {busqueda.nombre && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {busqueda.nombre}
                  </p>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col space-y-2 ml-3">
              <FavoriteButton
                itemId={busqueda.id}
                itemType="empleo"
                size="md"
              />
              <button
                onClick={handleShare}
                className="p-2 bg-white bg-opacity-90 text-gray-700 rounded-full hover:bg-opacity-100 transition-all backdrop-blur-sm shadow-md"
                title="Compartir"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-5">
          {/* Info rápida con badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {busqueda.disponibilidad && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg text-sm font-medium">
                <Briefcase className="w-4 h-4" />
                {busqueda.disponibilidad}
              </span>
            )}
            {busqueda.experienciaAnios !== undefined && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 rounded-lg text-sm font-medium">
                <Award className="w-4 h-4" />
                {busqueda.experienciaAnios} años exp.
              </span>
            )}
          </div>

          {/* Ubicación */}
          {busqueda.ubicacion && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{formatearUbicacion(busqueda.ubicacion)}</span>
              </div>
            </div>
          )}

          {/* Botón desplegable de detalles */}
          <button
            onClick={toggleDetails}
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors mb-3"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {showDetails ? 'Ocultar detalles' : 'Ver más detalles'}
            </span>
            {showDetails ? (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Detalles desplegables */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-4 pt-2">
              {/* Descripción */}
              {busqueda.descripcion && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Sobre mí
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {busqueda.descripcion}
                  </p>
                </div>
              )}

              {/* Habilidades */}
              {busqueda.habilidades?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Habilidades
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {busqueda.habilidades.map((hab, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        {hab}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Información de contacto */}
              {showContactInfo && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Contactar
                  </h4>
                  <div className="space-y-2">
                    {busqueda.contacto?.whatsapp && (
                      <button
                        onClick={handleWhatsAppContact}
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Contactar por WhatsApp</span>
                      </button>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      {busqueda.contacto?.telefono && (
                        <button
                          onClick={handlePhoneContact}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Llamar</span>
                        </button>
                      )}
                      
                      {busqueda.contacto?.email && (
                        <button
                          onClick={handleEmailContact}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Email</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fecha de publicación */}
          {busqueda.fechaCreacion && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Calendar className="w-3 h-3" />
              <span>
                Publicado: {new Date(busqueda.fechaCreacion.seconds * 1000).toLocaleDateString('es-AR')}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}