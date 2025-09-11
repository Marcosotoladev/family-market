// src/components/store/ServicesSection.js
import { 
  Settings, 
  Wrench, 
  Zap, 
  Shield, 
  Clock, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const ServicesSection = ({ services, storeData }) => {
  // Servicios de ejemplo si no hay servicios reales
  const exampleServices = [
    {
      id: 1,
      title: 'Consultoría Especializada',
      description: 'Asesoramiento profesional personalizado para tu negocio',
      price: 'Desde $150/hora',
      icon: Settings,
      features: ['Análisis completo', 'Estrategias personalizadas', 'Seguimiento continuo'],
      duration: '1-2 horas'
    },
    {
      id: 2,
      title: 'Mantenimiento Técnico',
      description: 'Servicios de mantenimiento y reparación especializados',
      price: 'Desde $80',
      icon: Wrench,
      features: ['Diagnóstico gratuito', 'Garantía incluida', 'Servicio a domicilio'],
      duration: '30 min - 2 horas'
    },
    {
      id: 3,
      title: 'Instalación Express',
      description: 'Instalación rápida y profesional de equipos',
      price: 'Desde $120',
      icon: Zap,
      features: ['Instalación certificada', 'Pruebas de funcionamiento', 'Capacitación incluida'],
      duration: '1-3 horas'
    }
  ];

  const displayServices = services.length > 0 ? services : exampleServices;

  const ServiceCard = ({ service }) => {
    const IconComponent = service.icon || Settings;
    
    return (
      <div 
        className="group bg-white p-8 transition-all duration-300 hover:scale-105"
        style={{ 
          borderRadius: 'var(--store-border-radius, 0.5rem)',
          boxShadow: 'var(--store-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1))'
        }}
      >
        {/* Ícono del servicio */}
        <div className="mb-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: 'var(--store-primary, #2563eb)' }}
          >
            <IconComponent className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Información del servicio */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
            {service.title}
          </h3>
          <p className="text-gray-600 mb-4">
            {service.description}
          </p>
          
          {/* Duración */}
          <div className="flex items-center space-x-2 mb-4">
            <Clock 
              className="w-4 h-4" 
              style={{ color: 'var(--store-secondary, #64748b)' }}
            />
            <span className="text-sm text-gray-500">
              Duración: {service.duration}
            </span>
          </div>

          {/* Características */}
          <div className="space-y-2 mb-6">
            {service.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle 
                  className="w-4 h-4" 
                  style={{ color: 'var(--store-primary, #2563eb)' }}
                />
                <span className="text-sm text-gray-600">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Precio y botón */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span 
                className="text-2xl font-bold"
                style={{ color: 'var(--store-primary, #2563eb)' }}
              >
                {service.price}
              </span>
            </div>
            <div 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: 'var(--store-primary, #2563eb)',
                color: 'white'
              }}
            >
              Disponible
            </div>
          </div>
          
          <button 
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium border-2 transition-all duration-200 hover:scale-105"
            style={{ 
              borderColor: 'var(--store-primary, #2563eb)',
              color: 'var(--store-primary, #2563eb)',
              borderRadius: 'var(--store-border-radius, 0.5rem)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--store-primary, #2563eb)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'var(--store-primary, #2563eb)';
            }}
          >
            <span>Solicitar Servicio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ofrecemos servicios profesionales de alta calidad adaptados a tus necesidades
          </p>
        </div>

        {/* Grid de servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Sección de garantía */}
        <div 
          className="mt-16 p-8 text-center"
          style={{ 
            backgroundColor: 'var(--store-primary, #2563eb)',
            borderRadius: 'var(--store-border-radius, 0.5rem)'
          }}
        >
          <div className="max-w-3xl mx-auto">
            <Shield className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">
              Garantía de Satisfacción
            </h3>
            <p className="text-white/90 mb-6">
              Todos nuestros servicios incluyen garantía de satisfacción. 
              Si no estás completamente satisfecho, trabajaremos hasta que lo estés.
            </p>
            <button 
              className="px-8 py-3 bg-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                color: 'var(--store-primary, #2563eb)',
                borderRadius: 'var(--store-border-radius, 0.5rem)'
              }}
            >
              Conocer Más
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;