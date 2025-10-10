// src/components/tienda/StoreJobsSection.js
'use client';

import PublicStoreEmploymentSection from './PublicStoreEmploymentSection';
import { Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function StoreJobsSection({ storeId, storeData }) {
  return (
    <section className="py-12 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de sección */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-orange-600" />
              Empleos
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Conoce las oportunidades laborales y servicios profesionales disponibles
            </p>
          </div>
          
          {storeData?.storeSlug && (
            <Link
              href={`/tienda/${storeData.storeSlug}/empleos`}
              className="hidden sm:inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Ver todos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          )}
        </div>

        {/* Componente de empleos */}
        <PublicStoreEmploymentSection
          storeId={storeId}
          storeData={storeData}
          showAll={false}
          maxItems={6}
        />

        {/* Botón móvil para ver todos */}
        {storeData?.storeSlug && (
          <div className="mt-8 text-center sm:hidden">
            <Link
              href={`/tienda/${storeData.storeSlug}/empleos`}
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Ver todos los empleos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}