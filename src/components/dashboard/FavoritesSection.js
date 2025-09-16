// src/components/dashboard/FavoritesSection.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Heart, 
  Package, 
  Wrench, 
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Trash2,
  Grid3X3,
  List,
  Filter
} from 'lucide-react';

export default function FavoritesSection() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'product' | 'service' | 'job'
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Mock data - reemplazar con llamadas a Firebase
  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setFavorites([
        {
          id: '1',
          itemId: 'prod_1',
          itemType: 'product',
          createdAt: new Date('2025-09-12'),
          itemData: {
            title: 'Tomates orgánicos',
            description: 'Tomates frescos cultivados sin pesticidas',
            price: 850,
            image: 'https://images.unsplash.com/photo-1546470427-e2544e1b6e8e?w=400&h=300&fit=crop',
            ownerName: 'María González',
            ownerFamily: 'Familia González',
            location: 'Nueva Córdoba'
          }
        },
        {
          id: '2',
          itemId: 'serv_1',
          itemType: 'service',
          createdAt: new Date('2025-09-10'),
          itemData: {
            title: 'Plomería a domicilio',
            description: 'Reparación de caños y grifería',
            price: 2500,
            image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
            ownerName: 'Carlos Méndez',
            ownerFamily: 'Familia Méndez',
            location: 'Centro'
          }
        },
        {
          id: '3',
          itemId: 'job_1',
          itemType: 'job',
          createdAt: new Date('2025-09-08'),
          itemData: {
            title: 'Desarrollador Frontend',
            description: 'React.js y Next.js para e-commerce',
            price: null,
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
            ownerName: 'Ana López',
            ownerFamily: 'Familia López',
            location: 'Remoto/Córdoba'
          }
        },
        {
          id: '4',
          itemId: 'prod_2',
          itemType: 'product',
          createdAt: new Date('2025-09-05'),
          itemData: {
            title: 'Pan casero integral',
            description: 'Pan artesanal con semillas',
            price: 450,
            image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
            ownerName: 'Luis Fernández',
            ownerFamily: 'Familia Fernández',
            location: 'Güemes'
          }
        },
        {
          id: '5',
          itemId: 'serv_2',
          itemType: 'service',
          createdAt: new Date('2025-09-03'),
          itemData: {
            title: 'Clases de guitarra',
            description: 'Clases particulares de guitarra',
            price: 1200,
            image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop',
            ownerName: 'Roberto Silva',
            ownerFamily: 'Familia Silva',
            location: 'Alberdi'
          }
        },
        {
          id: '6',
          itemId: 'prod_3',
          itemType: 'product',
          createdAt: new Date('2025-09-01'),
          itemData: {
            title: 'Miel artesanal',
            description: 'Miel pura de colmenas propias',
            price: 1800,
            image: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=400&h=300&fit=crop',
            ownerName: 'Elena Morales',
            ownerFamily: 'Familia Morales',
            location: 'Villa Allende'
          }
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getTabIcon = (type) => {
    switch (type) {
      case 'product': return Package;
      case 'service': return Wrench;
      case 'job': return Briefcase;
      default: return Heart;
    }
  };

  const getTabLabel = (type) => {
    switch (type) {
      case 'product': return 'Productos';
      case 'service': return 'Servicios';
      case 'job': return 'Empleos';
      default: return 'Todos';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'product': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'service': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'job': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  const filteredFavorites = favorites.filter(favorite => {
    const matchesTab = activeTab === 'all' || favorite.itemType === activeTab;
    const matchesSearch = favorite.itemData.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         favorite.itemData.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const favoritesByType = {
    all: favorites.length,
    product: favorites.filter(f => f.itemType === 'product').length,
    service: favorites.filter(f => f.itemType === 'service').length,
    job: favorites.filter(f => f.itemType === 'job').length
  };

  const handleRemoveFavorite = (favoriteId) => {
    setFavorites(prev => prev.filter(f => f.id !== favoriteId));
  };

  const formatPrice = (price) => {
    if (!price) return null;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Mis Favoritos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {favorites.length} elementos guardados
              </p>
            </div>
          </div>

          {/* Controles de vista */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs y búsqueda */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {['all', 'product', 'service', 'job'].map((tab) => {
              const TabIcon = getTabIcon(tab);
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <TabIcon className="w-4 h-4" />
                    <span className="hidden sm:block">{getTabLabel(tab)}</span>
                    <span className="bg-gray-200 dark:bg-gray-500 text-xs px-2 py-0.5 rounded-full">
                      {favoritesByType[tab]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar favoritos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Lista de favoritos */}
      <div className="p-6">
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'No tienes favoritos'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza a marcar productos, servicios o empleos como favoritos.'
              }
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
            : 'space-y-4'
          }>
            {filteredFavorites.map((favorite) => (
              <div
                key={favorite.id}
                className={`bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all hover:shadow-md overflow-hidden ${
                  viewMode === 'list' ? 'flex items-center p-4' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  // Vista Grid - Minimalista
                  <>
                    {/* Imagen */}
                    <div className="relative">
                      <img
                        src={favorite.itemData.image}
                        alt={favorite.itemData.title}
                        className="w-full h-32 sm:h-40 object-cover"
                      />
                      {/* Botón favorito superpuesto */}
                      <button
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1.5 text-red-500 hover:text-red-600 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        title="Quitar de favoritos"
                      >
                        <Heart className="w-3 h-3 fill-current" />
                      </button>
                      {/* Badge de tipo */}
                      <span className={`absolute top-2 left-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(favorite.itemType)}`}>
                        {getTabLabel(favorite.itemType).slice(0, -1)}
                      </span>
                    </div>
                    
                    {/* Información */}
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                        {favorite.itemData.title}
                      </h3>
                      
                      {favorite.itemData.price ? (
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatPrice(favorite.itemData.price)}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Consultar precio
                        </p>
                      )}
                      
                      {/* Botón ver más */}
                      <button className="w-full mt-2 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium py-1">
                        Ver detalles
                      </button>
                    </div>
                  </>
                ) : (
                  // Vista Lista - Original
                  <>
                    {/* Imagen en lista */}
                    <div className="w-16 h-16 mr-4 flex-shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={favorite.itemData.image}
                        alt={favorite.itemData.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      {/* Header del card */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {favorite.itemData.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-xs truncate">
                            {favorite.itemData.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(favorite.itemType)}`}>
                            {getTabLabel(favorite.itemType).slice(0, -1)}
                          </span>
                          <button
                            onClick={() => handleRemoveFavorite(favorite.id)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                            title="Quitar de favoritos"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Información adicional */}
                      <div className="flex items-center space-x-4 mb-2">
                        {favorite.itemData.price && (
                          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                            <DollarSign className="w-3 h-3 mr-1" />
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatPrice(favorite.itemData.price)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{favorite.itemData.location}</span>
                        </div>
                      </div>

                      {/* Footer del card */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">{favorite.itemData.ownerName}</span>
                        </div>
                        
                        <button
                          className="flex items-center text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                          title="Ver detalle"
                        >
                          <span className="hidden sm:inline mr-1">Ver</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}