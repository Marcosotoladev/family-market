// src/components/tienda/empleos/BusquedaEmpleoCard.js
'use client';

import { useState } from 'react';
import {
  Share2,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  Award,
  Crown,
  Download,
  FileText,
  User
} from 'lucide-react';
import {
  obtenerNombreCategoria,
  obtenerNombreSubcategoria,
  formatearDias,
  formatearHorarios
} from '@/lib/helpers/employmentHelpers';
import {
  TIPOS_EMPLEO,
  MODALIDADES_TRABAJO,
  NIVELES_EXPERIENCIA,
  formatearSalario,
  TIPOS_PUBLICACION
} from '@/types/employment';
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
    if (!phone) return;
    const message = `Hola! Vi tu perfil: ${busqueda.nombre} - ${busqueda.titulo}`;
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePhoneContact = (e) => {
    e.stopPropagation();
    const phone = busqueda.contacto?.telefono || '';
    if (!phone) return;
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailContact = (e) => {
    e.stopPropagation();
    const email = busqueda.contacto?.email || '';
    if (!email) return;
    const subject = `Consulta sobre tu perfil: ${busqueda.nombre}`;
    const body = `Hola ${busqueda.nombre}! Me interesa contactarte sobre tu perfil profesional.`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  // ✅ FUNCIÓN ACTUALIZADA PARA FIREBASE STORAGE - Descargar CV
  const handleViewCV = (e) => {
    e.stopPropagation();
    if (busqueda.cv?.url) {
      // Abrir directamente la URL de Firebase Storage
      // El navegador decidirá si descarga o muestra el PDF según su configuración
      window.open(busqueda.cv.url, '_blank');
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const busquedaUrl = window.location.href.replace('/empleos', `/empleo/${busqueda.id}`);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${busqueda.nombre} - ${busqueda.titulo}`,
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

  const formatearUbicacion = (ubicacion) => {
    if (!ubicacion) return '';
    if (typeof ubicacion === 'string' && ubicacion.trim()) return ubicacion;
    if (typeof ubicacion === 'object') {
      const partes = [
        ubicacion.ciudad,
        ubicacion.provincia,
        ubicacion.pais
      ].filter(parte => parte && parte.trim() !== '');
      return partes.length > 0 ? partes.join(', ') : '';
    }
    return '';
  };

  const getTipoEmpleoNombre = (tipoEmpleo) => {
    if (!tipoEmpleo) return '';
    const tipo = TIPOS_EMPLEO[tipoEmpleo.toUpperCase()];
    if (tipo && typeof tipo === 'object') return tipo.nombre;
    return tipoEmpleo;
  };

  const getModalidadNombre = (modalidad) => {
    if (!modalidad) return '';
    const mod = MODALIDADES_TRABAJO[modalidad.toUpperCase()];
    if (mod && typeof mod === 'object') return mod.nombre;
    return modalidad;
  };

  const getNivelExperienciaNombre = (nivel) => {
    if (!nivel) return '';
    const niv = NIVELES_EXPERIENCIA[nivel.toUpperCase()];
    if (niv && typeof niv === 'object') return niv.nombre;
    return nivel;
  };

  // VARIANTE FEATURED COMPACT
  if (variant === 'featured-compact') {
    return (
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-emerald-200 dark:border-emerald-700"
      >
        {/* Badge DESTACADO arriba */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-2 py-1 text-center">
            <div className="flex items-center justify-center space-x-1">
              <Crown className="w-3 h-3" />
              <span className="text-xs font-bold">DESTACADO</span>
            </div>
          </div>
        </div>

        {/* Header con foto o icono - h-40 */}
        <div
          className={`relative h-40 overflow-hidden mt-6 bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center ${onClick ? 'cursor-pointer' : ''}`}
          onClick={onClick}
        >
          {busqueda.foto ? (
            <img
              src={busqueda.foto}
              alt={busqueda.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white text-center">
              <User className="w-12 h-12 mx-auto mb-2 opacity-90" />
              <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">
                BUSCO EMPLEO
              </span>
            </div>
          )}

          {/* Overlay gradient para foto */}
          {busqueda.foto && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          )}

          {/* Botones de acción */}
          <div className="absolute top-2 right-2 flex flex-col space-y-1 z-10">
            <FavoriteButton
              itemId={busqueda.id}
              itemType="empleo"
              size="sm"
            />
            <button
              onClick={handleShare}
              className="p-1.5 bg-white bg-opacity-90 text-gray-700 rounded-full hover:bg-opacity-100 transition-all backdrop-blur-sm"
            >
              <Share2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Contenido - p-3 */}
        <div className="p-3">
          {/* Nombre */}
          <h3
            className={`font-semibold text-sm text-gray-900 dark:text-white mb-1 line-clamp-1 leading-tight ${onClick ? 'cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400' : ''}`}
            onClick={onClick}
          >
            {busqueda.nombre}
          </h3>

          {/* Título/Rubro */}
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
            {busqueda.titulo}
          </p>

          {/* Pretensión salarial con fondo */}
          <div className="mb-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2.5 border border-emerald-100 dark:border-emerald-800">
            {busqueda.pretensionSalarial && busqueda.pretensionSalarial.tipo !== 'a_convenir' && (busqueda.pretensionSalarial.minimo || busqueda.pretensionSalarial.maximo) ? (
              <div>
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium block mb-1">
                  Pretensión salarial
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 break-words leading-tight block line-clamp-2">
                  {formatearSalario(busqueda.pretensionSalarial)}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium block mb-1">
                  Pretensión salarial
                </span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  A convenir
                </span>
              </div>
            )}
          </div>
          
          {/* Botón desplegable */}
          <button
            onClick={toggleDetails}
            className="w-full flex items-center justify-between px-2 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors mb-2"
          >
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {showDetails ? 'Ocultar detalles' : 'Ver más detalles'}
            </span>
            {showDetails ? (
              <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Detalles desplegables */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="space-y-2 pt-1">
              {/* Descripción */}
              {busqueda.descripcion && (
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                  {busqueda.descripcion}
                </p>
              )}

              {/* Experiencia */}
              {busqueda.experiencia && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Experiencia: </span>
                  {busqueda.experiencia}
                </div>
              )}

              {/* Tags de modalidad y disponibilidad */}
              <div className="flex flex-wrap gap-1">
                {busqueda.disponibilidad?.modalidades?.length > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200">
                    <MapPin className="w-2.5 h-2.5 mr-0.5" />
                    {busqueda.disponibilidad.modalidades[0]}
                  </span>
                )}
                {busqueda.disponibilidad?.tipoEmpleo?.length > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200">
                    <Clock className="w-2.5 h-2.5 mr-0.5" />
                    {getTipoEmpleoNombre(busqueda.disponibilidad.tipoEmpleo[0])}
                  </span>
                )}
              </div>

              {/* BOTÓN DESCARGAR CV - Versión compacta */}
              {busqueda.cv?.url && (
                <button
                  onClick={handleViewCV}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Descargar CV</span>
                </button>
              )}

              {/* Botones de contacto */}
              {showContactInfo && (
                <div className="space-y-1.5 mt-2">
                  {busqueda.contacto?.whatsapp && (
                    <button
                      onClick={handleWhatsAppContact}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-1">
                    {busqueda.contacto?.telefono && (
                      <button
                        onClick={handlePhoneContact}
                        className="px-2 py-1.5 border border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 rounded text-xs hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Llamar</span>
                      </button>
                    )}

                    {busqueda.contacto?.email && (
                      <button
                        onClick={handleEmailContact}
                        className="px-2 py-1.5 border border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 rounded text-xs hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VARIANTE GRID (principal)
  if (variant === 'grid') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header con foto/ícono y acciones */}
        <div
          className={`relative bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-800/30 p-6 ${onClick ? 'cursor-pointer' : ''}`}
          onClick={onClick}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {/* Foto de perfil o icono */}
              <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden shadow-lg">
                {busqueda.foto ? (
                  <img
                    src={busqueda.foto}
                    alt={busqueda.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                    <User className="w-7 h-7 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight">
                  {busqueda.nombre}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {busqueda.titulo}
                </p>
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
          {/* Badge "Busco empleo" */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 rounded-lg text-sm font-medium">
              <Briefcase className="w-4 h-4" />
              Busco empleo
            </span>
          </div>

          {/* Info rápida con badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {busqueda.disponibilidad?.tipoEmpleo?.length > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg text-sm font-medium">
                <Clock className="w-4 h-4" />
                {getTipoEmpleoNombre(busqueda.disponibilidad.tipoEmpleo[0])}
                {busqueda.disponibilidad.tipoEmpleo.length > 1 && ` +${busqueda.disponibilidad.tipoEmpleo.length - 1}`}
              </span>
            )}
            {busqueda.disponibilidad?.modalidades?.length > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-200 rounded-lg text-sm font-medium">
                <MapPin className="w-4 h-4" />
                {getModalidadNombre(busqueda.disponibilidad.modalidades[0])}
                {busqueda.disponibilidad.modalidades.length > 1 && ` +${busqueda.disponibilidad.modalidades.length - 1}`}
              </span>
            )}
            {busqueda.nivelExperiencia && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 rounded-lg text-sm font-medium">
                <Award className="w-4 h-4" />
                {getNivelExperienciaNombre(busqueda.nivelExperiencia)}
              </span>
            )}
          </div>

          {/* Pretensión salarial */}
          {busqueda.pretensionSalarial &&
            typeof busqueda.pretensionSalarial === 'object' &&
            (busqueda.pretensionSalarial.minimo || busqueda.pretensionSalarial.maximo || busqueda.pretensionSalarial.tipo !== 'a_convenir') && (
              <div className="mb-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Pretensión salarial:</span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 break-words leading-tight">
                    {formatearSalario(busqueda.pretensionSalarial)}
                  </span>
                </div>
              </div>
            )}

          {/* BOTÓN DESCARGAR CV - Versión grid */}
          {busqueda.cv?.url && (
            <button
              onClick={handleViewCV}
              className="w-full mb-3 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              <Download className="w-5 h-5" />
              <span>Descargar CV</span>
            </button>
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
            className={`overflow-hidden transition-all duration-300 ease-in-out ${showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="space-y-4 pt-2">
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

              {busqueda.experiencia && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Experiencia
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {busqueda.experiencia}
                  </p>
                </div>
              )}

              {busqueda.ubicacion && formatearUbicacion(busqueda.ubicacion) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Ubicación
                  </h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{formatearUbicacion(busqueda.ubicacion)}</span>
                  </div>
                </div>
              )}

              {busqueda.habilidades?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Habilidades
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {busqueda.habilidades.map((hab, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                      >
                        {hab}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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

          {busqueda.fechaCreacion && busqueda.fechaCreacion.seconds && (
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