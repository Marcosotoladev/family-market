// src/components/store/ServicesSection.js
'use client';

import { Wrench, Clock, ArrowRight } from 'lucide-react';

export default function ServicesSection({ services, storeData }) {
  return (
    <section id="servicios" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de la sección */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Servicios profesionales y personalizados para cubrir todas tus necesidades
          </p>
        </div>

        {/* Contenido */}
        {services.length > 0 ? (
          <>
            {/* Grid de servicios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
                >
                  {/* Icono del servicio */}
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Wrench className="w-6 h-6 text-primary-600" />
                  </div>
                  
                  {/* Información del servicio */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {service.description}
                  </p>
                  
                  {/* Detalles del servicio */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Duración: {service.duration || 'A convenir'}</span>
                    </div>
                    <div className="text-lg font-bold text-primary-600">
                      Desde ${service.price}
                    </div>
                  </div>
                  
                  {/* Botón de acción */}
                  <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Consultar servicio
                  </button>
                </div>
              ))}
            </div>

            {/* Ver más servicios */}
            <div className="text-center">
              <button className="inline-flex items-center px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                Ver todos los servicios
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </>
        ) : (
          // Estado vacío - cuando no hay servicios
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wrench className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Servicios especializados en desarrollo
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {storeData.businessName} está desarrollando una gama de servicios profesionales para ofrecerte.
            </p>
            <div className="inline-flex items-center text-sm text-gray-500">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
              Próximamente disponibles
            </div>
          </div>
        )}
      </div>
    </section>
  );
}