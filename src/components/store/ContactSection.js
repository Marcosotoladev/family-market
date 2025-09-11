// src/components/store/ContactSection.js - Actualizado
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Globe
} from 'lucide-react';

const ContactSection = ({ storeData }) => {
  const { 
    businessName, 
    phone, 
    email, 
    city, 
    address, 
    storeConfig 
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

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Contáctanos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Ponte en contacto con nosotros a través de cualquiera de estos medios.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Información de contacto */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Información de Contacto
              </h3>
              
              <div className="space-y-4">
                {/* Teléfono - Solo si está habilitado */}
                {storeConfig?.showPhone && phone && (
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--store-primary, #2563eb)' }}
                    >
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Teléfono</p>
                      <a 
                        href={`tel:${phone}`}
                        className="hover:underline transition-colors"
                        style={{ color: 'var(--store-primary, #2563eb)' }}
                      >
                        {phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* WhatsApp - Solo si está habilitado */}
                {storeConfig?.showWhatsApp && phone && (
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#25d366' }}
                    >
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">WhatsApp</p>
                      <a 
                        href={`https://wa.me/549${phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline transition-colors"
                      >
                        Enviar mensaje
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {email && (
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--store-secondary, #64748b)' }}
                    >
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a 
                        href={`mailto:${email}`}
                        className="hover:underline transition-colors"
                        style={{ color: 'var(--store-primary, #2563eb)' }}
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Dirección */}
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'var(--store-secondary, #64748b)' }}
                  >
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Ubicación</p>
                    <p className="text-gray-600">{address}, {city}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Redes Sociales - Solo si hay enlaces configurados */}
            {activeSocialLinks.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Síguenos en Redes Sociales
                </h3>
                
                <div className="flex flex-wrap gap-4">
                  {activeSocialLinks.map(({ key, icon: Icon, name, color }) => (
                    <a
                      key={key}
                      href={storeConfig.socialLinks[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg border-2 hover:bg-gray-50 transition-all duration-200 group"
                      style={{ 
                        borderColor: color,
                        borderRadius: 'var(--store-border-radius, 0.5rem)'
                      }}
                      title={`Visitar ${name}`}
                    >
                      <Icon 
                        className="w-5 h-5 group-hover:scale-110 transition-transform" 
                        style={{ color }} 
                      />
                      <span 
                        className="font-medium"
                        style={{ color }}
                      >
                        {name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Formulario de contacto - Solo si está habilitado */}
          {storeConfig?.showContactForm && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Envíanos un Mensaje
              </h3>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{ 
                        focusRingColor: 'var(--store-primary, #2563eb)',
                        borderRadius: 'var(--store-border-radius, 0.5rem)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{ 
                        focusRingColor: 'var(--store-primary, #2563eb)',
                        borderRadius: 'var(--store-border-radius, 0.5rem)'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={{ 
                      focusRingColor: 'var(--store-primary, #2563eb)',
                      borderRadius: 'var(--store-border-radius, 0.5rem)'
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje *
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none"
                    style={{ 
                      focusRingColor: 'var(--store-primary, #2563eb)',
                      borderRadius: 'var(--store-border-radius, 0.5rem)'
                    }}
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90 hover:transform hover:scale-105"
                  style={{ 
                    backgroundColor: 'var(--store-primary, #2563eb)',
                    borderRadius: 'var(--store-border-radius, 0.5rem)',
                    boxShadow: 'var(--store-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1))'
                  }}
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;