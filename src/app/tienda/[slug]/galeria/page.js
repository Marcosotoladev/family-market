// src/app/tienda/[slug]/galeria/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getPublicStoreConfig } from '@/lib/storeConfigUtils';
import StoreLayout from '@/components/tienda/StoreLayout';
import { ArrowLeft, Loader2, Camera, X, ZoomIn } from 'lucide-react';
import Link from 'next/link';

export default function GaleriaPage() {
  const params = useParams();
  const { slug } = params;
  
  const [storeData, setStoreData] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

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
        
        // TODO: Cargar fotos reales de Firestore
        const mockPhotos = [
          {
            id: 1,
            url: 'https://via.placeholder.com/400x300/f97316/white?text=PRODUCTOS',
            title: 'Nuestros Productos',
            description: 'Una selección de nuestros productos artesanales',
            category: 'productos',
            date: '2024-01-15'
          },
          {
            id: 2,
            url: 'https://via.placeholder.com/400x300/10b981/white?text=COCINA',
            title: 'En la Cocina',
            description: 'El proceso de elaboración de nuestras especialidades',
            category: 'proceso',
            date: '2024-01-12'
          },
          {
            id: 3,
            url: 'https://via.placeholder.com/400x300/3b82f6/white?text=EQUIPO',
            title: 'Nuestro Equipo',
            description: 'El equipo familiar detrás de cada producto',
            category: 'equipo',
            date: '2024-01-10'
          },
          {
            id: 4,
            url: 'https://via.placeholder.com/400x300/8b5cf6/white?text=LOCAL',
            title: 'Nuestro Local',
            description: 'El espacio donde creamos nuestros productos',
            category: 'local',
            date: '2024-01-08'
          },
          {
            id: 5,
            url: 'https://via.placeholder.com/400x300/f59e0b/white?text=EVENTOS',
            title: 'Eventos Especiales',
            description: 'Participando en ferias y eventos locales',
            category: 'eventos',
            date: '2024-01-05'
          },
          {
            id: 6,
            url: 'https://via.placeholder.com/400x300/ef4444/white?text=CLIENTES',
            title: 'Clientes Felices',
            description: 'Momentos especiales con nuestros clientes',
            category: 'clientes',
            date: '2024-01-03'
          }
        ];
        setPhotos(mockPhotos);
        
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

  const openModal = (photo) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  const categories = ['all', ...new Set(photos.map(p => p.category))];

  const filteredPhotos = photos.filter(photo => {
    if (selectedCategory !== 'all' && photo.category !== selectedCategory) {
      return false;
    }
    if (searchQuery && !photo.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !photo.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getCategoryName = (category) => {
    const names = {
      'all': 'Todas',
      'productos': 'Productos',
      'proceso': 'Proceso',
      'equipo': 'Equipo',
      'local': 'Local',
      'eventos': 'Eventos',
      'clientes': 'Clientes'
    };
    return names[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cargando galería...
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
            <span className="text-gray-900 font-medium">Galería</span>
          </nav>
        </div>
      </div>

      {/* Header de página */}
      <div className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nuestra Galería
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Conoce más sobre nosotros a través de imágenes
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

      {/* Filtros */}
      <div className="bg-white py-4 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Categorías:</span>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'text-white shadow-md'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedCategory === category 
                    ? storeConfig?.primaryColor || '#ea580c'
                    : undefined
                }}
              >
                {getCategoryName(category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {filteredPhotos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => openModal(photo)}
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {photo.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {photo.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {new Date(photo.date).toLocaleDateString('es-ES')}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {getCategoryName(photo.category)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron fotos
              </h3>
              <p className="text-gray-600">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Prueba con otros filtros de búsqueda'
                  : 'Pronto agregaremos fotos de nuestro trabajo'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de imagen */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="bg-white rounded-lg overflow-hidden">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedPhoto.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedPhoto.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{getCategoryName(selectedPhoto.category)}</span>
                  <span>{new Date(selectedPhoto.date).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </StoreLayout>
  );
}