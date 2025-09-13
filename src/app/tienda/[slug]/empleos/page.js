// src/app/tienda/[slug]/empleos/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getPublicStoreConfig } from '@/lib/storeConfigUtils';
import StoreLayout from '@/components/tienda/StoreLayout';
import { ArrowLeft, Loader2, Briefcase, MapPin, Clock, DollarSign, Calendar, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function EmpleosPage() {
  const params = useParams();
  const { slug } = params;
  
  const [storeData, setStoreData] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('storeSlug', '==', slug));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Tienda no encontrada');
          return;
        }
        
        const userDoc = querySnapshot.docs[0];
        const userData = { id: userDoc.id, ...userDoc.data() };
        
        if (userData.accountStatus !== 'approved' && userData.accountStatus !== 'true') {
          setError('Esta tienda no está disponible');
          return;
        }
        
        const config = await getPublicStoreConfig(userData.id);
        
        setStoreData(userData);
        setStoreConfig(config);
        
        // TODO: Cargar empleos reales de Firestore
        const mockJobs = [
          {
            id: 1,
            title: 'Cocinero/a Medio Oficial',
            description: 'Buscamos una persona con experiencia en cocina tradicional para unirse a nuestro equipo',
            location: 'Córdoba Capital',
            type: 'Tiempo completo',
            salary: '$180,000 - $220,000',
            requirements: [
              'Experiencia mínima de 2 años en cocina',
              'Conocimiento de cocina criolla',
              'Disponibilidad horaria completa',
              'Responsabilidad y compromiso'
            ],
            posted: '2024-01-15',
            category: 'Cocina'
          },
          {
            id: 2,
            title: 'Vendedor/a - Atención al Cliente',
            description: 'Persona para atención directa al cliente, ventas y manejo de caja',
            location: 'Córdoba Capital',
            type: 'Medio tiempo',
            salary: '$120,000 - $150,000',
            requirements: [
              'Experiencia en ventas',
              'Excelente trato al cliente',
              'Manejo básico de sistemas',
              'Disponibilidad de mañana o tarde'
            ],
            posted: '2024-01-10',
            category: 'Ventas'
          }
        ];
        setJobs(mockJobs);
        
      } catch (error) {
        console.error('Error al cargar la tienda:', error);
        setError('Error al cargar la tienda');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchStoreData();
    }
  }, [slug]);

  useEffect(() => {
    if (storeConfig) {
      const root = document.documentElement;
      
      if (storeConfig.primaryColor) {
        root.style.setProperty('--store-primary-color', storeConfig.primaryColor);
      }
      if (storeConfig.secondaryColor) {
        root.style.setProperty('--store-secondary-color', storeConfig.secondaryColor);
      }
    }
    
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--store-primary-color');
      root.style.removeProperty('--store-secondary-color');
    };
  }, [storeConfig]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cargando empleos...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !storeData || !storeConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {error || 'Página no encontrada'}
          </h2>
          <Link
            href={`/tienda/${slug}`}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const JobCard = ({ job }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {job.title}
          </h3>
          <p className="text-gray-600 mb-3">
            {job.description}
          </p>
        </div>
        
        <span className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full ml-4">
          {job.category}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-2" />
          <span>{job.type}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <DollarSign className="w-4 h-4 mr-2" />
          <span>{job.salary}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Publicado: {formatDate(job.posted)}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Requisitos:</h4>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          {job.requirements.map((req, index) => (
            <li key={index}>{req}</li>
          ))}
        </ul>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          {job.type} • {job.location}
        </span>
        
        <button
          className="px-6 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
        >
          Postularme
        </button>
      </div>
    </div>
  );

  return (
    <StoreLayout
      storeData={storeData}
      storeConfig={storeConfig}
      onSearch={handleSearch}
    >
      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link 
              href={`/tienda/${slug}`}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {storeData.businessName || storeData.familyName}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Empleos</span>
          </nav>
        </div>
      </div>

      {/* Header de página */}
      <div className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Oportunidades de Empleo
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Únete a nuestro equipo y forma parte de algo especial
              </p>
            </div>
            
            <Link
              href={`/tienda/${slug}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {jobs.length > 0 ? (
            <div className="space-y-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay vacantes disponibles
              </h3>
              <p className="text-gray-600 mb-6">
                En este momento no tenemos posiciones abiertas, pero puedes enviar tu CV para futuras oportunidades
              </p>
              <button
                className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
              >
                Enviar CV
              </button>
            </div>
          )}

          {/* Información sobre trabajar con nosotros */}
          <div className="mt-12 bg-gray-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ¿Por qué trabajar con nosotros?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Nuestros valores</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ambiente familiar y de respeto</li>
                  <li>• Crecimiento profesional y personal</li>
                  <li>• Trabajo en equipo</li>
                  <li>• Compromiso con la calidad</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Beneficios</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Horarios flexibles</li>
                  <li>• Capacitación constante</li>
                  <li>• Buen ambiente laboral</li>
                  <li>• Oportunidades de crecimiento</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Proceso de selección */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Proceso de selección
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-semibold text-orange-600">1</span>
                </div>
                <p className="font-medium text-gray-900 text-sm">Postulación</p>
                <p className="text-xs text-gray-600">Envía tu CV</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-semibold text-orange-600">2</span>
                </div>
                <p className="font-medium text-gray-900 text-sm">Revisión</p>
                <p className="text-xs text-gray-600">Evaluamos tu perfil</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-semibold text-orange-600">3</span>
                </div>
                <p className="font-medium text-gray-900 text-sm">Entrevista</p>
                <p className="text-xs text-gray-600">Nos conocemos mejor</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-semibold text-orange-600">4</span>
                </div>
                <p className="font-medium text-gray-900 text-sm">Incorporación</p>
                <p className="text-xs text-gray-600">¡Bienvenido/a!</p>
              </div>
            </div>
          </div>

          {/* Contacto para CV */}
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Interesado en trabajar con nosotros?
            </h3>
            <p className="text-gray-600 mb-6">
              Aunque no tengas experiencia previa, nos interesa conocerte si compartes nuestros valores
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {storeData.phone && (
                <a
                  href={`tel:${storeData.phone}`}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Llamar: {storeData.phone}
                </a>
              )}
              
              {storeData.email && (
                <a
                  href={`mailto:${storeData.email}?subject=Consulta sobre empleo`}
                  className="inline-flex items-center px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar email
                </a>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg inline-block">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Incluye en tu mensaje por qué te interesa trabajar con nosotros 
                y qué puedes aportar al equipo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}