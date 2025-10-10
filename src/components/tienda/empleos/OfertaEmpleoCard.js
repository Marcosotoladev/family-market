// src/components/tienda/empleos/OfertaEmpleoCard.js
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
  Crown
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
  formatearSalario
} from '@/types/employment';
import FavoriteButton from '@/components/ui/FavoriteButton';

export default function OfertaEmpleoCard({
  oferta,
  storeData,
  variant = 'grid',
  showContactInfo = true,
  showStoreInfo = true,
  onClick = null
}) {
  const [showDetails, setShowDetails] = useState(false);

  if (!oferta) return null;

  const handleWhatsAppContact = (e) => {
    e.stopPropagation();
    const phone = oferta.contacto?.whatsapp || storeData?.phone || '';
    const message = `Hola! Me interesa la oferta de empleo: ${oferta.titulo}`;
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePhoneContact = (e) => {
    e.stopPropagation();
    const phone = oferta.contacto?.telefono || storeData?.phone || '';
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailContact = (e) => {
    e.stopPropagation();
    const email = oferta.contacto?.email || storeData?.email || '';
    const subject = `Consulta sobre: ${oferta.titulo}`;
    const body = `Hola! Me interesa postularme para: ${oferta.titulo}`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  const tipoEmpleo = Object.values(TIPOS_EMPLEO).find(t => t.id === oferta.tipoEmpleo);
  const modalidad = Object.values(MODALIDADES_TRABAJO).find(m => m.id === oferta.modalidad);
  const experiencia = Object.values(NIVELES_EXPERIENCIA).find(e => e.id === oferta.experienciaRequerida);

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
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3
                className={`font-bold text-base text-gray-900 dark:text-white mb-1 line-clamp-2 ${onClick ? 'cursor-pointer hover:text-orange-600 dark:hover:text-orange-400' : ''}`}
                onClick={onClick}
              >
                {oferta.titulo}
              </h3>
              {showStoreInfo && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {oferta.tiendaInfo?.nombre || storeData?.businessName}
                </p>
              )}
            </div>

            <div className="ml-2">
              <FavoriteButton
                itemId={oferta.id}
                itemType="empleo"
                size="sm"
              />
            </div>
          </div>

          <div className="space-y-2 mb-3">
            {oferta.salario && (
              <div className="flex items-center text-sm">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400 mr-1.5 flex-shrink-0" />
                <span className="font-semibold text-green-700 dark:text-green-400">
                  {formatearSalario(oferta.salario)}
                </span>
              </div>
            )}

            {tipoEmpleo && (
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <Briefcase className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                <span>{tipoEmpleo.nombre}</span>
              </div>
            )}

            {modalidad && (
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <span className="mr-1.5">{modalidad.icono}</span>
                <span>{modalidad.nombre}</span>
              </div>
            )}

            {oferta.ubicacion?.ciudad && (
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                <span>{oferta.ubicacion.ciudad}</span>
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
              {oferta.descripcion && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                    {oferta.descripcion}
                  </p>
                </div>
              )}

              {experiencia && (
                <div>
                  <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 mb-1">
                    <Award className="w-3.5 h-3.5 mr-1.5" />
                    <span className="font-medium">Experiencia:</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 ml-5">
                    {experiencia.nombre}
                  </p>
                </div>
              )}

              {oferta.horario?.dias?.length > 0 && (
                <div>
                  <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    <span className="font-medium">Horario:</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 ml-5">
                    {formatearDias(oferta.horario.dias)}
                  </p>
                </div>
              )}

              {showContactInfo && (
                <div className="space-y-1.5 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {oferta.contacto?.whatsapp && (
                    <button
                      onClick={handleWhatsAppContact}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Postularme por WhatsApp</span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-1">
                    {oferta.contacto?.telefono && (
                      <button
                        onClick={handlePhoneContact}
                        className="px-2 py-1.5 border border-orange-300 text-orange-700 dark:text-orange-300 rounded text-xs hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Llamar</span>
                      </button>
                    )}

                    {oferta.contacto?.email && (
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
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3
                className={`font-bold text-xl text-gray-900 dark:text-white mb-2 line-clamp-2 ${onClick ? 'cursor-pointer hover:text-orange-600 dark:hover:text-orange-400' : ''}`}
                onClick={onClick}
              >
                {oferta.titulo}
              </h3>
              {showStoreInfo && (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm">{oferta.tiendaInfo?.nombre || storeData?.businessName}</span>
                </div>
              )}
            </div>

            <div className="ml-4">
              <FavoriteButton
                itemId={oferta.id}
                itemType="empleo"
                size="md"
              />
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {oferta.salario && (
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-lg font-bold text-green-700 dark:text-green-400">
                  {formatearSalario(oferta.salario)}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {tipoEmpleo && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                  {tipoEmpleo.nombre}
                </span>
              )}

              {modalidad && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200">
                  {modalidad.icono} {modalidad.nombre}
                </span>
              )}

              {oferta.ubicacion?.ciudad && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-3.5 h-3.5 mr-1.5" />
                  {oferta.ubicacion.ciudad}
                </span>
              )}
            </div>
          </div>

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
              {oferta.descripcion && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Descripción del puesto
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {oferta.descripcion}
                  </p>
                </div>
              )}

              {experiencia && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Award className="w-4 h-4 mr-1.5" />
                    Experiencia requerida
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {experiencia.nombre} - {experiencia.descripcion}
                  </p>
                </div>
              )}

              {oferta.requisitos && oferta.requisitos.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-1.5" />
                    Requisitos
                  </h4>
                  <ul className="space-y-1">
                    {oferta.requisitos.map((req, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                        <span className="text-orange-600 mr-2">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {oferta.habilidades && oferta.habilidades.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Habilidades deseadas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {oferta.habilidades.map((hab, index) => (
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

              {oferta.horario && (oferta.horario.dias?.length > 0 || oferta.horario.turnos?.length > 0) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    Horario
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {oferta.horario.dias?.length > 0 && (
                      <p>Días: {formatearDias(oferta.horario.dias)}</p>
                    )}
                    {oferta.horario.turnos?.length > 0 && (
                      <p>Turnos: {formatearHorarios(oferta.horario.turnos)}</p>
                    )}
                    {oferta.horario.flexible && (
                      <p className="text-green-600 dark:text-green-400">Horario flexible</p>
                    )}
                  </div>
                </div>
              )}

              {oferta.salario?.beneficios && oferta.salario.beneficios.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Beneficios adicionales
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {oferta.salario.beneficios.map((ben, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full text-xs"
                      >
                        {ben}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {showContactInfo && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    ¿Te interesa? Postúlate ahora
                  </h4>
                  <div className="space-y-2">
                    {oferta.contacto?.whatsapp && (
                      <button
                        onClick={handleWhatsAppContact}
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Postularme por WhatsApp</span>
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {oferta.contacto?.telefono && (
                        <button
                          onClick={handlePhoneContact}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Llamar</span>
                        </button>
                      )}

                      {oferta.contacto?.email && (
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