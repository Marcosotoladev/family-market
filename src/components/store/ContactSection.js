// src/components/store/ContactSection.js
'use client';

import { Phone, Mail, MapPin, Clock, MessageCircle, User } from 'lucide-react';

export default function ContactSection({ storeData }) {
  const handleWhatsAppClick = () => {
    if (storeData.phone) {
      const phone = storeData.phone.replace(/\D/g, ''); // Remover caracteres no numéricos
      const message = encodeURIComponent(`Hola! Vi tu tienda en Family Market y me interesa conocer más sobre tus productos y servicios.`);
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  };

  const handleEmailClick = () => {
    if (storeData.email) {
      const subject = encodeURIComponent(`Consulta desde Family Market - ${storeData.businessName}`);
      const body = encodeURIComponent(`Hola ${storeData.firstName},

Vi tu tienda en Family Market y me interesa conocer más sobre tus productos y servicios.

¿Podrías proporcionarme más información?

Saludos!`);
      window.open(`mailto:${storeData.email}?subject=${subject}&body=${body}`, '_blank');
    }
  };

  return (
    <section id="contacto" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Información de contacto */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Contactanos
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Estamos aquí para ayudarte. No dudes en contactarnos para cualquier consulta 
              sobre nuestros productos o servicios.
            </p>

            <div className="space-y-6">
              {/* Información del propietario */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {storeData.profileImage ? (
                    <img
                      src={storeData.profileImage}
                      alt={`${storeData.firstName} ${storeData.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-primary-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {storeData.firstName} {storeData.lastName}
                  </h3>
                  <p className="text-gray-600">Propietario de {storeData.businessName}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Email</h4>
                  <p className="text-gray-600">{storeData.email}</p>
                </div>
              </div>

              {/* Teléfono */}
              {storeData.phone && (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Teléfono</h4>
                    <p className="text-gray-600">{storeData.phone}</p>
                  </div>
                </div>
              )}

              {/* Ubicación */}
              {(storeData.city || storeData.address) && (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Ubicación</h4>
                    <p className="text-gray-600">
                      {storeData.address && `${storeData.address}, `}
                      {storeData.city}
                    </p>
                  </div>
                </div>
              )}

              {/* Horarios */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Horarios</h4>
                  <p className="text-gray-600">Horarios flexibles - Consultar disponibilidad</p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones de contacto */}
          <div>
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                ¿Listo para contactarnos?
              </h3>
              
              <div className="space-y-4">
                {/* WhatsApp */}
                {storeData.phone && (
                  <button
                    onClick={handleWhatsAppClick}
                    className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chatear por WhatsApp
                  </button>
                )}

                {/* Email */}
                <button
                  onClick={handleEmailClick}
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Enviar email
                </button>

                {/* Llamada */}
                {storeData.phone && (
                  <a
                    href={`tel:${storeData.phone}`}
                    className="w-full flex items-center justify-center px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Llamar ahora
                  </a>
                )}
              </div>

              {/* Mensaje adicional */}
              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  <strong>Family Market</strong> conecta familias emprendedoras con su comunidad.
                  Al contactar esta tienda, apoyas el comercio local y familiar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer de la sección */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Miembro de Family Market desde {storeData.createdAt ? new Date(storeData.createdAt.toDate()).getFullYear() : new Date().getFullYear()}
            </p>
            <a
              href="/"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              Descubre más tiendas familiares en Family Market
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}