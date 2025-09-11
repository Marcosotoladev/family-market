// src/components/store/StoreFooter.js - Actualizado con estilos dinámicos
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Globe,
  Heart,
  ExternalLink
} from 'lucide-react';

const StoreFooter = ({ storeData }) => {
  const { 
    businessName, 
    phone, 
    email, 
    city, 
    address, 
    storeConfig,
    storeLogo,
    profileImage 
  } = storeData;

  const socialPlatforms = [
    { key: 'facebook', icon: Facebook, name: 'Facebook', color: '#1877f2' },
    { key: 'instagram', icon: Instagram, name: 'Instagram', color: '#e4405f' },
    { key: 'twitter', icon: Twitter, name: 'X (Twitter)', color: '#1da1f2' },
    { key: 'linkedin', icon: Linkedin, name: 'LinkedIn', color: '#0077b5' },
    { key: 'website', icon: Globe, name: 'Sitio Web', color: 'var(--store-primary, #2563eb)' }
  ];

  // Filtrar solo las redes sociales configuradas
  const activeSocialLinks = socialPlatforms.filter(platform => 
    storeConfig?.socialLinks?.[platform.key] && 
    storeConfig.socialLinks[platform.key].trim() !== ''
  );

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Sección principal del footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Información de la empresa */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              {storeLogo || profileImage ? (
                <div 
                  className="w-12 h-12 rounded-lg overflow-hidden"
                  style={{ borderRadius: 'var(--store-border-radius, 0.5rem)' }}
                >
                  <img
                    src={storeLogo || profileImage}
                    alt={businessName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ 
                    backgroundColor: 'var(--store-primary, #2563eb)',
                    borderRadius: 'var(--store-border-radius, 0.5rem)'
                  }}
                >
                  {businessName?.charAt(0) || 'T'}
                </div>
              )}
              <h3 className="text-xl font-bold">{businessName}</h3>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Tu tienda de confianza en {city}. Ofrecemos productos y servicios de calidad 
              con la mejor atención al cliente.
            </p>
            
            {/* Redes sociales */}
            {activeSocialLinks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Síguenos</h4>
                <div className="flex space-x-3">
                  {activeSocialLinks.map(({ key, icon: Icon, name, color }) => (
                    <a
                      key={key}
                      href={storeConfig.socialLinks[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg group"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 'var(--store-border-radius, 0.5rem)'
                      }}
                      title={`Visitar ${name}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="font-semibold mb-6">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              {storeConfig?.showProducts && (
                <li>
                  <a 
                    href="#productos" 
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span 
                      className="w-1 h-1 rounded-full mr-3 transition-all duration-200 group-hover:w-2"
                      style={{ backgroundColor: 'var(--store-primary, #2563eb)' }}
                    ></span>
                    Productos
                  </a>
                </li>
              )}
              {storeConfig?.showServices && (
                <li>
                  <a 
                    href="#servicios" 
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span 
                      className="w-1 h-1 rounded-full mr-3 transition-all duration-200 group-hover:w-2"
                      style={{ backgroundColor: 'var(--store-primary, #2563eb)' }}
                    ></span>
                    Servicios
                  </a>
                </li>
              )}
              {storeConfig?.showJobs && (
                <li>
                  <a 
                    href="#empleos" 
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span 
                      className="w-1 h-1 rounded-full mr-3 transition-all duration-200 group-hover:w-2"
                      style={{ backgroundColor: 'var(--store-primary, #2563eb)' }}
                    ></span>
                    Empleos
                  </a>
                </li>
              )}
              {storeConfig?.showGallery && (
                <li>
                  <a 
                    href="#galeria" 
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span 
                      className="w-1 h-1 rounded-full mr-3 transition-all duration-200 group-hover:w-2"
                      style={{ backgroundColor: 'var(--store-primary, #2563eb)' }}
                    ></span>
                    Galería
                  </a>
                </li>
              )}
              <li>
                <a 
                  href="#contacto" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                >
                  <span 
                    className="w-1 h-1 rounded-full mr-3 transition-all duration-200 group-hover:w-2"
                    style={{ backgroundColor: 'var(--store-primary, #2563eb)' }}
                  ></span>
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h4 className="font-semibold mb-6">Contacto</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin 
                  className="w-5 h-5 mt-0.5 flex-shrink-0" 
                  style={{ color: 'var(--store-primary, #2563eb)' }}
                />
                <div>
                  <p className="text-gray-300">{address}</p>
                  <p className="text-gray-300">{city}</p>
                </div>
              </div>
              
              {storeConfig?.showPhone && phone && (
                <div className="flex items-center space-x-3">
                  <Phone 
                    className="w-5 h-5 flex-shrink-0" 
                    style={{ color: 'var(--store-primary, #2563eb)' }}
                  />
                  <a 
                    href={`tel:${phone}`}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {phone}
                  </a>
                </div>
              )}
              
              {email && (
                <div className="flex items-center space-x-3">
                  <Mail 
                    className="w-5 h-5 flex-shrink-0" 
                    style={{ color: 'var(--store-primary, #2563eb)' }}
                  />
                  <a 
                    href={`mailto:${email}`}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {email}
                  </a>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Clock 
                  className="w-5 h-5 flex-shrink-0" 
                  style={{ color: 'var(--store-primary, #2563eb)' }}
                />
                <div className="text-gray-300">
                  <p>Lun - Vie: 9:00 - 18:00</p>
                  <p>Sáb: 9:00 - 13:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Horarios y información adicional */}
          <div>
            <h4 className="font-semibold mb-6">Información</h4>
            <div className="space-y-4">
              <div 
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--store-border-radius, 0.5rem)'
                }}
              >
                <h5 
                  className="font-medium mb-2"
                  style={{ color: 'var(--store-primary, #2563eb)' }}
                >
                  ¿Por qué elegirnos?
                </h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>✓ Atención personalizada</li>
                  <li>✓ Productos de calidad</li>
                  <li>✓ Precios competitivos</li>
                  <li>✓ Entrega rápida</li>
                </ul>
              </div>
              
              <div>
                <h5 
                  className="font-medium mb-2"
                  style={{ color: 'var(--store-primary, #2563eb)' }}
                >
                  Métodos de Pago
                </h5>
                <p className="text-sm text-gray-300">
                  Efectivo, Transferencia, Mercado Pago, Tarjetas de crédito y débito
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div 
        className="border-t"
        style={{ 
          borderColor: 'var(--store-primary, #2563eb)',
          borderOpacity: 0.3
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>© {currentYear} {businessName}. Todos los derechos reservados.</span>
            </div>
            
            {/* Family Market branding */}
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Creado con</span>
              <Heart 
                className="w-4 h-4" 
                style={{ color: 'var(--store-primary, #2563eb)' }}
              />
              <span>en</span>
              <a 
                href="/"
                className="font-medium transition-colors duration-200 flex items-center space-x-1 group"
                style={{ color: 'var(--store-primary, #2563eb)' }}
              >
                <span>Family Market</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter