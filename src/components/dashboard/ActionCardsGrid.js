// src/components/dashboard/ActionCardsGrid.js
'use client';

import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Wrench, 
  Briefcase, 
  ChevronRight,
  Plus,
  Eye
} from 'lucide-react';

export default function ActionCardsGrid() {
  const router = useRouter();

  const actionCards = [
    {
      id: 'productos',
      title: 'Productos',
      description: 'Gestiona tu catálogo de productos, precios, imágenes y descripciones.',
      icon: ShoppingBag,
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      route: '/dashboard/productos'
    },
    {
      id: 'servicios',
      title: 'Servicios',
      description: 'Ofrece servicios profesionales, consultas y trabajos especializados.',
      icon: Wrench,
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      route: '/dashboard/servicios'
    },
    {
      id: 'empleos',
      title: 'Empleos',
      description: 'Publica ofertas de trabajo y encuentra candidatos para tu negocio.',
      icon: Briefcase,
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      route: '/dashboard/empleos'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {actionCards.map((card) => {
        const Icon = card.icon;
        
        return (
          <div 
            key={card.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center min-w-0 flex-1">
                  <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {card.title}
                  </h3>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {card.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => router.push(card.route)}
                  className={`flex items-center justify-center px-3 py-2 ${card.buttonColor} text-white rounded-lg transition-colors text-sm font-medium`}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Crear
                </button>
                <button 
                  onClick={() => router.push(card.route)}
                  className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver todos
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}