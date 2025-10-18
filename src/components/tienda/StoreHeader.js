// src/components/tienda/StoreHeader.js
'use client';

import { useState, useEffect } from 'react';
import { Search, Menu, X, Store, XCircle } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const StoreHeader = ({ storeLogo, storeName, storeSlug, storeConfig, onSearch, onMenuToggle, isMobileMenuOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [logoType, setLogoType] = useState('square');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) setSearchQuery(query);
  }, [searchParams]);

  const handleLogoLoad = (e) => {
    const img = e.target;
    const { naturalWidth, naturalHeight } = img;
    const aspectRatio = naturalWidth / naturalHeight;
    if (aspectRatio > 1.3) setLogoType('horizontal');
    else if (aspectRatio < 0.8) setLogoType('vertical');
    else setLogoType('square');
  };

  const getLogoClasses = () => {
    switch (logoType) {
      case 'horizontal': return 'h-8 sm:h-10 lg:h-12 max-w-[120px] sm:max-w-[160px] lg:max-w-[200px]';
      case 'vertical': return 'h-10 sm:h-12 lg:h-14 w-auto max-w-[80px] sm:max-w-[100px]';
      case 'square': return 'h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12';
      default: return 'h-8 sm:h-10 lg:h-12 max-w-[120px] sm:max-w-[160px]';
    }
  };

  // Función para obtener resultados desde Firebase
  const fetchSearchResults = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&store=${storeSlug}`);
      const data = await response.json();
      setSearchResults(data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error al buscar:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    // Buscar resultados
    fetchSearchResults(trimmedQuery);

    if (onSearch) {
      onSearch(trimmedQuery);
      return;
    }

    const isInSpecificSection = pathname.includes('/productos') || pathname.includes('/servicios') || pathname.includes('/empleos');
    if (isInSpecificSection) {
      router.push(`${pathname}?q=${encodeURIComponent(trimmedQuery)}`);
    } else {
      router.push(`/tienda/${storeSlug}/buscar?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Búsqueda en tiempo real (opcional)
    if (value.trim().length > 2) {
      fetchSearchResults(value);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    if (searchParams.get('q')) router.push(pathname);
  };

  const handleResultClick = (result) => {
    // Navega según el tipo - slug es el ID del documento Firebase
    if (result.type === 'servicio') {
      router.push(`/tienda/${storeSlug}/servicios/${result.slug}`);
    } else if (result.type === 'empleo') {
      router.push(`/tienda/${storeSlug}/empleos/${result.slug}`);
    } else {
      router.push(`/tienda/${storeSlug}/producto/${result.slug}`);
    }
    handleClearSearch();
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50" style={{ borderBottomColor: storeConfig?.primaryColor ? `${storeConfig.primaryColor}20` : undefined }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="hidden lg:flex items-center justify-between py-4">
          <div className="flex items-center flex-shrink-0">
            <button onClick={() => router.push(`/tienda/${storeSlug}`)} className="focus:outline-none hover:opacity-80 transition-opacity">
              {storeLogo ? (
                <img src={storeLogo} alt={`Logo de ${storeName}`} className={`object-contain ${getLogoClasses()}`} onLoad={handleLogoLoad} />
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}>
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{storeName}</span>
                </div>
              )}
            </button>
          </div>

          <div className="flex-1 max-w-2xl mx-8 relative">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={handleSearchChange}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  placeholder="Buscar productos, servicios..." 
                  className="w-full pl-10 pr-32 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:border-transparent transition-colors" 
                  style={{ outlineColor: storeConfig?.primaryColor || '#ea580c' }} 
                />
                {searchQuery && (
                  <button type="button" onClick={handleClearSearch} className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
                <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 text-white rounded-md transition-colors hover:opacity-90" style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}>
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {/* Dropdown de resultados - AQUI APARECEN LOS RESULTADOS */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
                  {searchResults.length === 0 && !isSearching && (
                    <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                      <p>No se encontraron resultados</p>
                    </div>
                  )}
                  {isSearching && (
                    <div className="px-4 py-6 text-center">
                      <p className="text-gray-600 dark:text-gray-300">Buscando...</p>
                    </div>
                  )}
                  {searchResults.slice(0, 8).map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors flex items-center space-x-3"
                    >
                      {result.image && (
                        <img src={result.image} alt={result.name} className="w-10 h-10 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{result.name}</p>
                          <span className="text-xs px-2 py-1 rounded-full whitespace-nowrap" style={{ 
                            backgroundColor: result.type === 'servicio' ? '#e0f2fe' : result.type === 'empleo' ? '#dcfce7' : '#fef3c7',
                            color: result.type === 'servicio' ? '#0369a1' : result.type === 'empleo' ? '#166534' : '#92400e'
                          }}>
                            {result.type === 'servicio' ? 'Servicio' : result.type === 'empleo' ? 'Empleo' : 'Producto'}
                          </span>
                        </div>
                        {result.company && <p className="text-xs text-gray-500 dark:text-gray-400">{result.company}</p>}
                        {result.location && <p className="text-xs text-gray-500 dark:text-gray-400">{result.location}</p>}
                        {result.price && <p className="text-sm text-gray-500 dark:text-gray-400">${result.price}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          <div className="flex-shrink-0"></div>
        </div>

        <div className="lg:hidden">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <button onClick={() => router.push(`/tienda/${storeSlug}`)} className="focus:outline-none hover:opacity-80 transition-opacity">
                {storeLogo ? (
                  <img src={storeLogo} alt={`Logo de ${storeName}`} className={`object-contain flex-shrink-0 ${getLogoClasses()}`} onLoad={handleLogoLoad} />
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}>
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white truncate">{storeName}</span>
                  </div>
                )}
              </button>
            </div>

            <button onClick={onMenuToggle} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <div className="pb-3 relative">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={handleSearchChange}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  placeholder="Buscar..." 
                  className="w-full pl-9 pr-20 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:border-transparent transition-colors text-sm" 
                  style={{ outlineColor: storeConfig?.primaryColor || '#ea580c' }} 
                />
                {searchQuery && (
                  <button type="button" onClick={handleClearSearch} className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
                <button type="submit" className="absolute right-1 top-1/2 transform -translate-y-1/2 px-3 py-1.5 text-white rounded-md transition-colors text-sm hover:opacity-90" style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}>
                  {isSearching ? '...' : 'Buscar'}
                </button>
              </div>

              {/* Dropdown de resultados mobile */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  {searchResults.slice(0, 5).map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors flex items-center space-x-2"
                    >
                      {result.image && (
                        <img src={result.image} alt={result.name} className="w-8 h-8 object-cover rounded flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-medium text-gray-900 dark:text-white truncate text-sm">{result.name}</p>
                          <span className="text-xs px-1.5 py-0.5 rounded whitespace-nowrap" style={{ 
                            backgroundColor: result.type === 'servicio' ? '#e0f2fe' : result.type === 'empleo' ? '#dcfce7' : '#fef3c7',
                            color: result.type === 'servicio' ? '#0369a1' : result.type === 'empleo' ? '#166534' : '#92400e'
                          }}>
                            {result.type === 'servicio' ? 'Srv' : result.type === 'empleo' ? 'Emp' : 'Prod'}
                          </span>
                        </div>
                        {result.company && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.company}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;