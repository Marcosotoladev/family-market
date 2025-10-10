// src/components/tienda/empleos/BusquedaEmpleoCard.js
'use client';

import { useState } from 'react';
import {
  Share2,
  MessageCircle,
  Phone,
  Mail,
  User,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Award,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Crown,
  DollarSign
} from 'lucide-react';
import {
  obtenerNombreCategoria,
  formatearDias,
  formatearHorarios,

} from '@/lib/helpers/employmentHelpers';
import {
  TIPOS_EMPLEO,
  MODALIDADES_TRABAJO,
  NIVELES_EXPERIENCIA,
    formatearSalario
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
    const message = `Hola ${busqueda.nombre}! Vi tu perfil laboral y me gustaría contactarte`;
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
    const subject = `Oportunidad laboral para ${busqueda.nombre} ${busqueda.apellido}`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}`, '_self');
  };

  const handleViewCV = (e) => {
    e.stopPropagation();
    if (busqueda.curriculum?.url) {
      window.open(busqueda.curriculum.url, '_blank');
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const perfilUrl = `${window.location.origin}/empleos/perfil/${busqueda.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${busqueda.nombre} ${busqueda.apellido} - ${busqueda.titulo}`,
          text: busqueda.descripcion,
          url: perfilUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(perfilUrl);
      alert('Enlace copiado al portapapeles');
    }
  };

  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  const experiencia = Object.values(NIVELES_EXPERIENCIA).find(e => e.id === busqueda.experiencia?.nivel);
  const nombreCompleto = `${busqueda.nombre} ${busqueda.apellido}`;

  // Variante FEATURED COMPACT
  if (variant === 'featured-compact') {
    return (
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-orange-200 dark:border-orange-700">
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-1 text-center">
            <div className="flex items-center justify-center space-x-1">
              <Crown className="w-3 h-3" />
              <span className="text-xs font-bold">DESTACADO</span>
            </div>
          </div>
        </div>

        <div className="p-4 mt-6">
          <div className="flex items-start space-x-3 mb-3">
            {busqueda.foto ? (
              <img
                src={busqueda.foto}
                alt={nombreCompleto}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 flex-shrink-0">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3
                className={`font-bold text-base text-gray-900 dark:text-white mb-1 line-clamp-1 ${onClick ? 'cursor-pointer hover:text-orange-600 dark:hover:text-orange-400' : ''}`}
                onClick={onClick}
              >
                {nombreCompleto}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1 mb-1">
                {busqueda.titulo}
              </p>
              {busqueda.edad && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {busqueda.edad} años
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-1">
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

          <div className="space-y-2 mb-3">
            {busqueda.categorias && busqueda.categorias.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Áreas de interés:
                </p>
                <div className="flex flex-wrap gap-1">
                  {busqueda.categorias.slice(0, 2).map((cat, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs"
                    >
                      {obtenerNombreCategoria(cat)}
                    </span>
                  ))}
                  {busqueda.categorias.length > 2 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{busqueda.categorias.length - 2} más
                    </span>
                  )}
                </div>
              </div>
            )}

            {experiencia && (
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <Award className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                <span>{experiencia.nombre}</span>
              </div>
            )}

            {busqueda.ubicacion?.ciudad && (
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                <span>{busqueda.ubicacion.ciudad}</span>
              </div>
            )}
          </div>

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

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-3 pt-2">
              {busqueda.descripcion && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                    {busqueda.descripcion}
                  </p>
                </div>
              )}

              {busqueda.disponibilidad?.tiposEmpleo && busqueda.disponibilidad.tiposEmpleo.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Busca:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {busqueda.disponibilidad.tiposEmpleo.slice(0, 2).map((tipo) => {
                      const tipoObj = Object.values(TIPOS_EMPLEO).find(t => t.id === tipo);
                      return tipoObj ? (
                        <span
                          key={tipo}
                          className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded text-xs"
                        >
                          {tipoObj.nombre}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {busqueda.curriculum?.url && (
                <button
                  onClick={handleViewCV}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-medium">Ver CV completo</span>
                </button>
              )}

              {showContactInfo && (
                <div className="space-y-1.5 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {busqueda.contacto?.whatsapp && (
                    <button
                      onClick={handleWhatsAppContact}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Contactar por WhatsApp</span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-1">
                    {busqueda.contacto?.telefono && (
                      <button
                        onClick={handlePhoneContact}
                        className="px-2 py-1.5 border border-orange-300 text-orange-700 dark:text-orange-300 rounded text-xs hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Llamar</span>
                      </button>
                    )}

                    {busqueda.contacto?.email && (
                      <button
                        onClick={handleEmailContact}
                        className="px-2 py-1.5 border border-orange-300 text-orange-700 dark:text-orange-300 rounded text-xs hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center justify-center space-x-1"
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

  // Variante GRID
  if (variant === 'grid') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-start space-x-4 mb-4">
            {busqueda.foto ? (
              <img
                src={busqueda.foto}
                alt={nombreCompleto}
                className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600 flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-200 dark:border-gray-600 flex-shrink-0">
                <User className="w-10 h-10 text-gray-400" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3
                className={`font-bold text-xl text-gray-900 dark:text-white mb-1 ${onClick ? 'cursor-pointer hover:text-orange-600 dark:hover:text-orange-400' : ''}`}
                onClick={onClick}
              >
                {nombreCompleto}
              </h3>
              <p className="text-base text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                {busqueda.titulo}
              </p>
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                {busqueda.edad && (
                  <span>{busqueda.edad} años</span>
                )}
                {busqueda.ubicacion?.ciudad && (
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {busqueda.ubicacion.ciudad}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <FavoriteButton
                itemId={busqueda.id}
                itemType="empleo"
                size="md"
              />
              <button
                onClick={handleShare}
                className="p-2 bg-white bg-opacity-90 text-gray-700 rounded-full hover:bg-opacity-100 transition-all backdrop-blur-sm"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {busqueda.categorias && busqueda.categorias.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Áreas de interés
              </h4>
              <div className="flex flex-wrap gap-2">
                {busqueda.categorias.map((cat, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm"
                  >
                    {obtenerNombreCategoria(cat)}
                  </span>
                ))}
              </div>
            </div>
          )}

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

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-4 pt-2">
              {busqueda.descripcion && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Sobre mí
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {busqueda.descripcion}
                  </p>
                </div>
              )}

              {experiencia && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Award className="w-4 h-4 mr-1.5" />
                    Experiencia
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {experiencia.nombre} {busqueda.experiencia?.años > 0 && `- ${busqueda.experiencia.años} años`}
                  </p>
                  {busqueda.experiencia?.descripcionExperiencia && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {busqueda.experiencia.descripcionExperiencia}
                    </p>
                  )}
                </div>
              )}

              {busqueda.experiencia?.trabajosAnteriores && busqueda.experiencia.trabajosAnteriores.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Briefcase className="w-4 h-4 mr-1.5" />
                    Trabajos anteriores
                  </h4>
                  <ul className="space-y-1">
                    {busqueda.experiencia.trabajosAnteriores.map((trabajo, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                        <span className="text-orange-600 mr-2">•</span>
                        <span>{trabajo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {busqueda.habilidades && busqueda.habilidades.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Habilidades
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {busqueda.habilidades.map((hab, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-full text-xs"
                      >
                        {hab}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {busqueda.disponibilidad && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    Disponibilidad
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {busqueda.disponibilidad.tiposEmpleo && busqueda.disponibilidad.tiposEmpleo.length > 0 && (
                      <div>
                        <span className="font-medium">Busca: </span>
                        {busqueda.disponibilidad.tiposEmpleo.map((tipo, index) => {
                          const tipoObj = Object.values(TIPOS_EMPLEO).find(t => t.id === tipo);
                          return tipoObj ? (
                            <span key={tipo}>
                              {tipoObj.nombre}
                              {index < busqueda.disponibilidad.tiposEmpleo.length - 1 && ', '}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {busqueda.disponibilidad.modalidades && busqueda.disponibilidad.modalidades.length > 0 && (
                      <div>
                        <span className="font-medium">Modalidad: </span>
                        {busqueda.disponibilidad.modalidades.map((mod, index) => {
                          const modObj = Object.values(MODALIDADES_TRABAJO).find(m => m.id === mod);
                          return modObj ? (
                            <span key={mod}>
                              {modObj.nombre}
                              {index < busqueda.disponibilidad.modalidades.length - 1 && ', '}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {busqueda.disponibilidad.diasDisponibles && busqueda.disponibilidad.diasDisponibles.length > 0 && (
                      <p>
                        <span className="font-medium">Días: </span>
                        {formatearDias(busqueda.disponibilidad.diasDisponibles)}
                      </p>
                    )}

                    {busqueda.disponibilidad.inmediata && (
                      <p className="text-green-600 dark:text-green-400 font-medium">
                        Disponibilidad inmediata
                      </p>
                    )}
                  </div>
                </div>
              )}

              {busqueda.preferencias && (busqueda.preferencias.salarioMinimo || busqueda.preferencias.salarioMaximo) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1.5" />
                    Pretensión salarial
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatearSalario({
                      minimo: busqueda.preferencias.salarioMinimo,
                      maximo: busqueda.preferencias.salarioMaximo,
                      tipo: 'mensual',
                      moneda: 'ARS'
                    })}
                  </p>
                </div>
              )}

              {busqueda.curriculum?.url && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleViewCV}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">Ver CV completo</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              )}

              {showContactInfo && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    ¿Te interesa este perfil? Contáctalo
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
        </div>
      </div>
    );
  }

  return null;
}