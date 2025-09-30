// src/components/tienda/StoreJobsSection.js
'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  DollarSign, 
  Calendar,
  Loader2,
  ChevronRight,
  Building2
} from 'lucide-react';

export default function StoreJobsSection({ 
  storeId,
  storeData,
  maxJobs = null
}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) {
      loadJobs();
    }
  }, [storeId]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      
      const jobsRef = collection(db, 'empleos');
      let q = query(
        jobsRef,
        where('usuarioId', '==', storeId),
        where('estado', '==', 'activo'),
        orderBy('fechaCreacion', 'desc')
      );

      if (maxJobs) {
        q = query(q, limit(maxJobs));
      }

      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setJobs(jobsData);
    } catch (error) {
      console.error('Error cargando empleos:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const getTipoEmpleoLabel = (tipo) => {
    const tipos = {
      'tiempo_completo': 'Tiempo Completo',
      'medio_tiempo': 'Medio Tiempo',
      'freelance': 'Freelance',
      'temporal': 'Temporal',
      'pasantia': 'Pasantía',
      'otro': 'Otro'
    };
    return tipos[tipo] || tipo;
  };

  const getModalidadLabel = (modalidad) => {
    const modalidades = {
      'presencial': 'Presencial',
      'remoto': 'Remoto',
      'hibrido': 'Híbrido'
    };
    return modalidades[modalidad] || modalidad;
  };

  if (loading) {
    return (
      <section className="py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cargando ofertas de empleo...
            </h2>
          </div>
        </div>
      </section>
    );
  }

  if (jobs.length === 0) {
    return (
      <section className="py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Oportunidades de Empleo
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Únete a nuestro equipo
            </p>
          </div>
          
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay vacantes disponibles
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              En este momento no hay oportunidades de empleo abiertas
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="empleos" className="py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Oportunidades de Empleo
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Únete a nuestro equipo y crece profesionalmente
          </p>
        </div>

        {/* Grid de empleos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {/* Header del card */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {job.titulo}
                    </h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <Building2 className="w-4 h-4 mr-2" />
                      <span>{storeData?.businessName || storeData?.familyName}</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {getTipoEmpleoLabel(job.tipoEmpleo)}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {getModalidadLabel(job.modalidad)}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                {/* Descripción */}
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                  {job.descripcion}
                </p>

                {/* Información adicional */}
                <div className="space-y-2 mb-4">
                  {job.ubicacion && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{job.ubicacion}</span>
                    </div>
                  )}

                  {job.salario && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{job.salario}</span>
                    </div>
                  )}

                  {job.horario && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{job.horario}</span>
                    </div>
                  )}

                  {job.fechaCreacion && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>
                        Publicado: {job.fechaCreacion?.toDate?.()?.toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Requisitos principales */}
                {job.requisitos && job.requisitos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Requisitos principales:
                    </h4>
                    <ul className="space-y-1">
                      {job.requisitos.slice(0, 3).map((req, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                          <span className="mr-2">•</span>
                          <span className="line-clamp-1">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Botón de acción */}
                <button
                  onClick={() => {
                    window.location.href = `/tienda/${storeData.storeSlug}/empleos/${job.id}`;
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                >
                  <span>Ver detalles y aplicar</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Botón Ver más */}
        {maxJobs && jobs.length >= maxJobs && (
          <div className="text-center mt-8">
            <a
              href={`/tienda/${storeData.storeSlug}/empleos`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Ver todas las oportunidades
            </a>
          </div>
        )}
      </div>
    </section>
  );
}