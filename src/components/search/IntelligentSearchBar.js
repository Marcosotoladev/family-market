'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchResults from './SearchResults';

export default function IntelligentSearchBar({ className = '' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const searchRef = useRef(null);
  const timeoutRef = useRef(null);
  const router = useRouter();

  console.log('🎬 IntelligentSearchBar montado');

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        console.log('👆 Click fuera, cerrando resultados');
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función de búsqueda con debounce
  const handleSearch = async (query) => {
    console.log('🔍 ============ INICIO BÚSQUEDA ============');
    console.log('🔍 handleSearch llamado con query:', query);
    console.log('🔍 Longitud del query:', query?.length);
    
    if (!query || query.trim().length < 3) {
      console.log('❌ Query muy corto o vacío, abortando búsqueda');
      setResults(null);
      setShowResults(false);
      return;
    }

    console.log('✅ Query válido, iniciando búsqueda...');
    setIsSearching(true);
    setError(null);

    try {
      console.log('📡 Preparando llamada a API...');
      console.log('📡 URL:', '/api/smart-search');
      console.log('📡 Body:', JSON.stringify({ searchQuery: query }));
      
      const response = await fetch('/api/smart-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchQuery: query }),
      });

      console.log('📬 Respuesta recibida!');
      console.log('📬 Status:', response.status);
      console.log('📬 Status Text:', response.statusText);
      console.log('📬 OK?:', response.ok);

      if (!response.ok) {
        console.error('❌ Response not OK');
        const errorText = await response.text();
        console.error('❌ Error text:', errorText);
        throw new Error(`Error en la búsqueda: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 ============ DATOS RECIBIDOS ============');
      console.log('📦 Data completa:', data);
      console.log('📦 Análisis IA:', data.analysis);
      console.log('📦 Productos encontrados:', data.productos?.length || 0);
      console.log('📦 Servicios encontrados:', data.servicios?.length || 0);
      console.log('📦 Empleos encontrados:', data.empleos?.length || 0);
      
      setResults(data);
      setShowResults(true);
      console.log('✅ Resultados seteados, mostrando panel');

    } catch (err) {
      console.error('💥 ============ ERROR ============');
      console.error('💥 Error completo:', err);
      console.error('💥 Error message:', err.message);
      console.error('💥 Error stack:', err.stack);
      setError('Hubo un error al buscar. Intenta de nuevo.');
    } finally {
      setIsSearching(false);
      console.log('🏁 ============ FIN BÚSQUEDA ============');
    }
  };

  // Manejar cambio en el input con debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    console.log('⌨️ Input cambió a:', value);
    setSearchQuery(value);

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      console.log('⏰ Limpiando timeout anterior');
      clearTimeout(timeoutRef.current);
    }

    // Esperar 500ms después de que el usuario deje de escribir
    console.log('⏰ Iniciando nuevo timeout de 500ms');
    timeoutRef.current = setTimeout(() => {
      console.log('⏰ Timeout completado, ejecutando búsqueda');
      handleSearch(value);
    }, 500);
  };

  // Manejar submit del form
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📝 Form submitted');
    if (timeoutRef.current) {
      console.log('⏰ Limpiando timeout por submit manual');
      clearTimeout(timeoutRef.current);
    }
    handleSearch(searchQuery);
  };

  // Limpiar búsqueda
  const handleClear = () => {
    console.log('🧹 Limpiando búsqueda');
    setSearchQuery('');
    setResults(null);
    setShowResults(false);
    setError(null);
  };

  console.log('🎨 Renderizando con estado:', {
    searchQuery,
    isSearching,
    showResults,
    hasResults: !!results,
    hasError: !!error
  });

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Barra de búsqueda */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Icono de búsqueda */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Busca productos, servicios o empleos... Ej: 'que puedo regalar a mi mama'"
            className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />

          {/* Botones de acción */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
            {/* Loader */}
            {isSearching && (
              <div className="mr-2">
                <svg
                  className="animate-spin h-5 w-5 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}

            {/* Botón limpiar */}
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            {/* Botón buscar */}
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Buscar
            </button>
          </div>
        </div>
      </form>

      {/* Resultados */}
      {showResults && (
        <SearchResults
          results={results}
          error={error}
          searchQuery={searchQuery}
          onClose={() => {
            console.log('❌ Cerrando panel de resultados');
            setShowResults(false);
          }}
        />
      )}
    </div>
  );
}