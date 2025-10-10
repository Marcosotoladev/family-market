// src/components/tienda/empleos/ServicioProfesionalCard.js
'use client';

import { useState } from 'react';
import {
  Share2,
  MessageCircle,
  Phone,
  Mail,
  User,
  Award,
  MapPin,
  Clock,
  DollarSign,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Crown,
  Globe,
  Instagram,
  Facebook,
  Wrench
} from 'lucide-react';
import {
  obtenerNombreCategoria,
  obtenerNombreSubcategoria,

  formatearDias,
  formatearHorarios
} from '@/lib/helpers/employmentHelpers';
import {
  MODALIDADES_TRABAJO,
    formatearSalario
} from '@/types/employment';
import FavoriteButton from '@/components/ui/FavoriteButton';

export default function ServicioProfesionalCard({
  servicio,
  storeData,
  variant = 'grid',
  showContactInfo = true,
  showStoreInfo = true,
  onClick = null
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!servicio) return null;

  const images = servicio.portfolio?.imagenes || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleWhatsAppContact = (e) => {
    e.stopPropagation();
    const phone = servicio.contacto?.whatsapp || storeData?.phone || '';
    const message = `Hola! Me interesa tu servicio: ${servicio.titulo}`;
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePhoneContact = (e) => {
    e.stopPropagation();
    const phone = servicio.contacto?.telefono || storeData?.phone || '';
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailContact = (e) => {
    e.stopPropagation();
    const email = servicio.contacto?.email || storeData?.email || '';
    const subject = `Consulta sobre: ${servicio.titulo}`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}`, '_self');
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const servicioUrl = `${window.location.origin}/empleos/servicio/${servicio.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: servicio.titulo,
          text: servicio.descripcion,
          url: servicioUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(servicioUrl);
      alert('Enlace copiado al portapapeles');
    }
  };

  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

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
            {servicio.foto ? (
              <img
                src={servicio.foto}
                alt={servicio.nombreProfesional}
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
                {servicio.nombreProfesional}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-1">
                {servicio.titulo}
              </p>
              {servicio.experiencia?.años > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {servicio.experiencia.años} años de experiencia
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-1">
              <FavoriteButton
                itemId={servicio.id}
                itemType="servicio"
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
            {servicio.tarifas && (
              <div className="flex items-center text-sm">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400 mr-1.5 flex-shrink-0" />
                <span className="font-semibold text-green-700 dark:text-green-400">
                  {formatearSalario(servicio.tarifas)}
                </span>
              </div>
            )}

            {servicio.valoraciones && servicio.valoraciones.total > 0 && (
              <div className="flex items-center text-xs">
                {[1, 2, 3, 4, 5].map((starNumber) => {
                  const rating = servicio.valoraciones?.promedio || 0;
                  const isFilled = starNumber <= Math.floor(rating);
                  
                  return (
                    <Star
                      key={starNumber}
                      className={`w-3 h-3 ${
                        isFilled 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  );
                })}
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  ({servicio.valoraciones.total})
                </span>
              </div>
            )}

            {servicio.ubicacion?.ciudad && (
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                <span>{servicio.ubicacion.ciudad}</span>
                {servicio.ubicacion.atendeADomicilio && (
                  <span className="ml-1 text-green-600 dark:text-green-400">• A domicilio</span>
                )}
              </div>
            )}

            {servicio.servicios && servicio.servicios.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {servicio.servicios.slice(0, 2).map((serv, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs"
                  >
                    {serv}
                  </span>
                ))}
                {servicio.servicios.length > 2 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    +{servicio.servicios.length - 2} más
                  </span>
                )}
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt={`Trabajo ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {currentImageIndex + 1}/{images.length}
                  </div>
                </>
              )}
            </div>
          )}

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
              {servicio.descripcion && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                    {servicio.descripcion}
                  </p>
                </div>
              )}

              {servicio.certificaciones && servicio.certificaciones.length > 0 && (
                <div>
                  <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 mb-1">
                    <Award className="w-3.5 h-3.5 mr-1.5" />
                    <span className="font-medium">Certificaciones:</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 ml-5 line-clamp-2">
                    {servicio.certificaciones.join(', ')}
                  </p>
                </div>
              )}

              {servicio.disponibilidad?.modalidades && servicio.disponibilidad.modalidades.length > 0 && (
                <div>
                  <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 mb-1">
                    <Wrench className="w-3.5 h-3.5 mr-1.5" />
                    <span className="font-medium">Atiende:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 ml-5">
                    {servicio.disponibilidad.modalidades.map((mod) => {
                      const modObj = Object.values(MODALIDADES_TRABAJO).find(m => m.id === mod);
                      return modObj ? (
                        <span
                          key={mod}
                          className="text-xs text-gray-600 dark:text-gray-400"
                        >
                          {modObj.icono} {modObj.nombre}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {showContactInfo && (
                <div className="space-y-1.5 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {servicio.contacto?.whatsapp && (
                    <button
                      onClick={handleWhatsAppContact}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Consultar por WhatsApp</span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-1">
                    {servicio.contacto?.telefono && (
                      <button
                        onClick={handlePhoneContact}
                        className="px-2 py-1.5 border border-orange-300 text-orange-700 dark:text-orange-300 rounded text-xs hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Llamar</span>
                      </button>
                    )}

                    {servicio.contacto?.email && (
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
        {images.length > 0 && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={images[currentImageIndex]}
              alt={`Trabajo ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {hasMultipleImages && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded">
                  {currentImageIndex + 1}/{images.length}
                </div>
              </>
            )}

            <div className="absolute top-3 right-3 flex flex-col space-y-2 z-10">
              <FavoriteButton
                itemId={servicio.id}
                itemType="servicio"
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
        )}

        <div className="p-6">
          <div className="flex items-start space-x-4 mb-4">
            {servicio.foto ? (
              <img
                src={servicio.foto}
                alt={servicio.nombreProfesional}
                className="w-16 h-16 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-200 dark:border-gray-600 flex-shrink-0">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3
                className={`font-bold text-xl text-gray-900 dark:text-white mb-1 ${onClick ? 'cursor-pointer hover:text-orange-600 dark:hover:text-orange-400' : ''}`}
                onClick={onClick}
              >
                {servicio.nombreProfesional}
              </h3>
              <p className="text-base text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                {servicio.titulo}
              </p>
              {servicio.experiencia?.años > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {servicio.experiencia.años} años de experiencia
                </p>
              )}
            </div>
          </div>

          {servicio.valoraciones && servicio.valoraciones.total > 0 && (
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((starNumber) => {
                  const rating = servicio.valoraciones?.promedio || 0;
                  const isFilled = starNumber <= Math.floor(rating);
                  
                  return (
                    <Star
                      key={starNumber}
                      className={`w-4 h-4 ${
                        isFilled 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                {servicio.valoraciones.promedio?.toFixed(1)} ({servicio.valoraciones.total} reseñas)
              </span>
            </div>
          )}

          {servicio.tarifas && (
            <div className="mb-4">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-lg font-bold text-green-700 dark:text-green-400">
                  {formatearSalario(servicio.tarifas)}
                </span>
              </div>
              {servicio.tarifas.detalles && (
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-7 mt-1">
                  {servicio.tarifas.detalles}
                </p>
              )}
            </div>
          )}

          {servicio.servicios && servicio.servicios.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Servicios ofrecidos
              </h4>
              <div className="flex flex-wrap gap-2">
                {servicio.servicios.map((serv, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm"
                  >
                    {serv}
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
              {servicio.descripcion && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Sobre el servicio
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {servicio.descripcion}
                  </p>
                </div>
              )}

              {servicio.especialidades && servicio.especialidades.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Especialidades
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {servicio.especialidades.map((esp, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-full text-sm"
                      >
                        {esp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {servicio.certificaciones && servicio.certificaciones.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Award className="w-4 h-4 mr-1.5" />
                    Certificaciones
                  </h4>
                  <ul className="space-y-1">
                    {servicio.certificaciones.map((cert, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                        <span className="text-orange-600 mr-2">•</span>
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {servicio.disponibilidad && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    Disponibilidad
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {servicio.disponibilidad.modalidades && servicio.disponibilidad.modalidades.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {servicio.disponibilidad.modalidades.map((mod) => {
                          const modObj = Object.values(MODALIDADES_TRABAJO).find(m => m.id === mod);
                          return modObj ? (
                            <span
                              key={mod}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs"
                            >
                              {modObj.icono} {modObj.nombre}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {servicio.disponibilidad.diasDisponibles && servicio.disponibilidad.diasDisponibles.length > 0 && (
                      <p>
                        <span className="font-medium">Días: </span>
                        {formatearDias(servicio.disponibilidad.diasDisponibles)}
                      </p>
                    )}

                    {servicio.disponibilidad.horarios && servicio.disponibilidad.horarios.length > 0 && (
                      <p>
                        <span className="font-medium">Horarios: </span>
                        {formatearHorarios(servicio.disponibilidad.horarios)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {servicio.ubicacion && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5" />
                    Ubicación y cobertura
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {servicio.ubicacion.ciudad && (
                      <p>{servicio.ubicacion.ciudad}, {servicio.ubicacion.provincia}</p>
                    )}
                    {servicio.ubicacion.atendeADomicilio && (
                      <p className="text-green-600 dark:text-green-400">✓ Atiende a domicilio</p>
                    )}
                    {servicio.ubicacion.zonaCobertura && servicio.ubicacion.zonaCobertura.length > 0 && (
                      <div>
                        <span className="font-medium">Zonas: </span>
                        {servicio.ubicacion.zonaCobertura.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {servicio.contacto?.redesSociales && (
                <div className="flex space-x-3 pt-2">
                  {servicio.contacto.sitioWeb && (
                    <a
                      href={servicio.contacto.sitioWeb}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </a>
                  )}
                  {servicio.contacto.redesSociales.instagram && (
                    <a
                      href={`https://instagram.com/${servicio.contacto.redesSociales.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Instagram className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </a>
                  )}
                  {servicio.contacto.redesSociales.facebook && (
                    <a
                      href={servicio.contacto.redesSociales.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Facebook className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </a>
                  )}
                </div>
              )}

              {showContactInfo && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    ¿Necesitas este servicio? Contáctalo
                  </h4>
                  <div className="space-y-2">
                    {servicio.contacto?.whatsapp && (
                      <button
                        onClick={handleWhatsAppContact}
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Consultar por WhatsApp</span>
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {servicio.contacto?.telefono && (
                        <button
                          onClick={handlePhoneContact}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Llamar</span>
                        </button>
                      )}

                      {servicio.contacto?.email && (
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