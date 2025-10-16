'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SearchResults({ results, error, searchQuery, onClose }) {
  const router = useRouter();

  if (error) {
    return (
      <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          <svg
            className="w-12 h-12 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const totalResults =
    results.productos.length + results.servicios.length + results.empleos.length;

  if (totalResults === 0) {
    return (
      <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-medium mb-2">
            No encontramos resultados para "{searchQuery}"
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Intenta con otras palabras o términos más generales
          </p>
        </div>
      </div>
    );
  }

  const handleItemClick = (type, item) => {
    onClose();
    
    // Navegar según el tipo - usando tiendaInfo.slug
    const slug = item.tiendaInfo?.slug || item.storeSlug || 'tienda';
    
    if (type === 'producto') {
      router.push(`/tienda/${slug}/producto/${item.id}`);
    } else if (type === 'servicio') {
      router.push(`/tienda/${slug}/servicios/${item.id}`);
    } else if (type === 'empleo') {
      router.push(`/tienda/${slug}/empleos/${item.id}`);
    }
  };

  return (
    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto">
      {/* Header con análisis de IA */}
      {results.analysis && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Entendí que buscas:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {results.analysis.intencion}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Productos */}
      {results.productos.length > 0 && (
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Productos ({results.productos.length})
          </h3>
          <div className="space-y-2">
            {results.productos.map((producto) => (
              <button
                key={producto.id}
                onClick={() => handleItemClick('producto', producto)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0 overflow-hidden">
                  {producto.imagenes?.[0] || producto.imagenPrincipal ? (
                    <Image
                      src={producto.imagenes?.[0] || producto.imagenPrincipal}
                      alt={producto.nombre || producto.titulo}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {producto.nombre || producto.titulo}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {producto.tiendaInfo?.nombre || 'Tienda'}
                  </p>
                  {producto.precio && (
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      ${producto.precio.toLocaleString()}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Servicios */}
      {results.servicios.length > 0 && (
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Servicios ({results.servicios.length})
          </h3>
          <div className="space-y-2">
            {results.servicios.map((servicio) => (
              <button
                key={servicio.id}
                onClick={() => handleItemClick('servicio', servicio)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0 overflow-hidden">
                  {servicio.imagenes?.[0] || servicio.imagenPrincipal ? (
                    <Image
                      src={servicio.imagenes?.[0] || servicio.imagenPrincipal}
                      alt={servicio.titulo}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {servicio.titulo}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {servicio.tiendaInfo?.nombre || 'Tienda'}
                  </p>
                  {servicio.precio && (
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      Desde ${servicio.precio.toLocaleString()}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empleos */}
      {results.empleos.length > 0 && (
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Empleos ({results.empleos.length})
          </h3>
          <div className="space-y-2">
            {results.empleos.map((empleo) => (
              <button
                key={empleo.id}
                onClick={() => handleItemClick('empleo', empleo)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0 overflow-hidden">
                  {empleo.foto ? (
                    <Image
                      src={empleo.foto}
                      alt={empleo.titulo}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-600 dark:text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {empleo.titulo}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {empleo.tiendaInfo?.nombre || empleo.nombre || 'Tienda'}
                  </p>
                  {empleo.tipoPublicacion && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                      {empleo.tipoPublicacion === 'oferta_empleo' ? 'Oferta' : 'Búsqueda'}
                    </span>
                  )}
                  {empleo.salario?.minimo && (
                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-1">
                      ${empleo.salario.minimo.toLocaleString()}
                      {empleo.salario.maximo && ` - $${empleo.salario.maximo.toLocaleString()}`}
                    </p>
                  )}
                  {empleo.pretensionSalarial?.minimo && (
                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-1">
                      ${empleo.pretensionSalarial.minimo.toLocaleString()}
                      {empleo.pretensionSalarial.maximo && ` - $${empleo.pretensionSalarial.maximo.toLocaleString()}`}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}