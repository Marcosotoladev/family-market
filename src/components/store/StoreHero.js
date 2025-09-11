// src/components/store/StoreHero.js - Ejemplo de cómo actualizar para usar colores dinámicos
import { MapPin, Clock, Star, Phone, MessageCircle } from 'lucide-react';

const StoreHero = ({ storeData }) => {
  const { businessName, city, address, profileImage, storeLogo } = storeData;

  return (
    <section className="relative py-20 bg-gray-50">
      {/* Overlay con color dinámico */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, var(--store-primary, #2563eb), var(--store-secondary, #64748b))`
        }}
      ></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Información del negocio */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              {businessName}
            </h1>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center lg:justify-start space-x-2">
                <MapPin className="w-5 h-5" style={{ color: 'var(--store-primary, #2563eb)' }} />
                <span className="text-gray-600">{city}, {address}</span>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start space-x-2">
                <Clock className="w-5 h-5" style={{ color: 'var(--store-primary, #2563eb)' }} />
                <span className="text-gray-600">Abierto ahora</span>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start space-x-2">
                <Star className="w-5 h-5" style={{ color: 'var(--store-primary, #2563eb)' }} />
                <span className="text-gray-600">4.8 (125 reseñas)</span>
              </div>
            </div>
            
            {/* Botones de acción con colores dinámicos */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90 hover:transform hover:scale-105"
                style={{ 
                  backgroundColor: 'var(--store-primary, #2563eb)',
                  boxShadow: 'var(--store-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1))'
                }}
              >
                <Phone className="w-5 h-5 inline mr-2" />
                Llamar Ahora
              </button>
              
              <button 
                className="px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:opacity-90"
                style={{ 
                  backgroundColor: 'var(--store-secondary, #64748b)',
                  color: 'white',
                  boxShadow: 'var(--store-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1))'
                }}
              >
                <MessageCircle className="w-5 h-5 inline mr-2" />
                WhatsApp
              </button>
            </div>
          </div>
          
          {/* Imagen/Logo */}
          <div className="flex justify-center">
            <div 
              className="w-80 h-80 rounded-full overflow-hidden shadow-xl"
              style={{ 
                boxShadow: 'var(--store-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
                borderRadius: 'var(--store-border-radius, 0.5rem)'
              }}
            >
              {storeLogo || profileImage ? (
                <img
                  src={storeLogo || profileImage}
                  alt={businessName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-white text-6xl font-bold"
                  style={{ backgroundColor: 'var(--store-primary, #2563eb)' }}
                >
                  {businessName?.charAt(0) || 'T'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreHero;