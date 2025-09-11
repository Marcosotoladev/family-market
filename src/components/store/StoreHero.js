// src/components/store/StoreHero.js
'use client';

import { MapPin, Phone, Mail, Star, CheckCircle } from 'lucide-react';

export default function StoreHero({ storeData }) {
  const handleContactClick = (type) => {
    switch (type) {
      case 'whatsapp':
        if (storeData.phone) {
          const phone = storeData.phone.replace(/\D/g, '');
          const message = encodeURIComponent(`Hola! Vi tu tienda ${storeData.businessName} y me interesa conocer más.`);
          window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        }
        break;
      case 'email':
        if (storeData.email) {
          const subject = encodeURIComponent(`Consulta desde tu tienda - ${storeData.businessName}`);
          window.open(`mailto:${storeData.email}?subject=${subject}`, '_blank');
        }
        break;
      case 'phone':
        if (storeData.phone) {
          window.open(`tel:${storeData.phone}`, '_blank');
        }
        break;
    }
  };

  return (
    <section id="inicio" className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Contenido principal - 2/3 del espacio */}
          <div className="lg:col-span-2">
            <div className="max-w-2xl">
              {/* Badge de verificación */}
              <div className="inline-flex items-center px-3 py-1 bg-green-50 border border-green-200 rounded-full text-sm text-green-700 mb-4">
                <CheckCircle className="w-4 h-4 mr-1" />
                Tienda verificada
              </div>

              {/* Título y descripción */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {storeData.businessName}
              </h1>
              
              <p className="text-lg text-gray-600 mb-6">
                Una empresa familiar comprometida con la calidad y el servicio personalizado. 
                Descubre productos y servicios diseñados especialmente para tu familia.
              </p>

              {/* Información de contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {storeData.city && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">{storeData.city}</span>
                  </div>
                )}
                
                {storeData.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">{storeData.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">{storeData.email}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Star className="w-4 h-4 mr-2 text-yellow-400" />
                  <span className="text-sm">Familia {storeData.familyName}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                {storeData.storeConfig?.showProducts && (
                  <button
                    onClick={() => {
                      const element = document.getElementById('productos');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-center"
                  >
                    Ver productos
                  </button>
                )}
                
                {storeData.storeConfig?.showServices && (
                  <button
                    onClick={() => {
                      const element = document.getElementById('servicios');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
                  >
                    Ver servicios
                  </button>
                )}

                <button
                  onClick={() => handleContactClick('whatsapp')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
                >
                  Contactar ahora
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar con info adicional - 1/3 del espacio */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6">
              {/* Imagen del propietario */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                  {storeData.profileImage ? (
                    <img
                      src={storeData.profileImage}
                      alt={`${storeData.firstName} ${storeData.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                      {storeData.firstName?.[0]}{storeData.lastName?.[0]}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {storeData.firstName} {storeData.lastName}
                </h3>
                <p className="text-sm text-gray-600">Propietario</p>
              </div>

              {/* Estadísticas */}
              <div className="space-y-4">
                <div className="text-center py-3 border-b border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {new Date().getFullYear() - (storeData.createdAt ? new Date(storeData.createdAt.toDate()).getFullYear() : new Date().getFullYear())}+
                  </div>
                  <div className="text-xs text-gray-500">Años de experiencia</div>
                </div>
                
                <div className="text-center py-3 border-b border-gray-200">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-xs text-gray-500">Empresa familiar</div>
                </div>
                
                <div className="text-center py-3">
                  <div className="text-2xl font-bold text-blue-600">Local</div>
                  <div className="text-xs text-gray-500">Compromiso comunitario</div>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="mt-6 space-y-2">
                {storeData.phone && (
                  <button
                    onClick={() => handleContactClick('whatsapp')}
                    className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    WhatsApp
                  </button>
                )}
                
                <button
                  onClick={() => handleContactClick('email')}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Enviar email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}