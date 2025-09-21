// src/components/layout/DashboardSidebar.js - Sección de navegación actualizada

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Vista general de tu actividad'
  },
  {
    name: 'Mi Tienda',
    href: '#',
    icon: Store,
    description: 'Gestiona tu tienda',
    children: [
      {
        name: 'Productos',
        href: '/dashboard/tienda/productos',
        icon: Package,
        description: 'Gestiona tu catálogo de productos'
      },
      {
        name: 'Servicios',
        href: '/dashboard/tienda/servicios',
        icon: Wrench,
        description: 'Administra tus servicios' // Próximamente
      },
      {
        name: 'Empleos',
        href: '/dashboard/tienda/empleos',
        icon: Briefcase,
        description: 'Publica ofertas de trabajo' // Próximamente
      },
      {
        name: 'Estadísticas',
        href: '/dashboard/tienda/estadisticas',
        icon: BarChart3,
        description: 'Analiza el rendimiento de tu tienda'
      }
    ]
  },
  {
    name: 'Explorar',
    href: '#',
    icon: Search,
    description: 'Descubre el mercado',
    children: [
      {
        name: 'Productos',
        href: '/explorar/productos',
        icon: Package,
        description: 'Busca productos de otras familias'
      },
      {
        name: 'Servicios',
        href: '/explorar/servicios',
        icon: Wrench,
        description: 'Encuentra servicios locales'
      },
      {
        name: 'Empleos',
        href: '/explorar/empleos',
        icon: Briefcase,
        description: 'Busca oportunidades laborales'
      },
      {
        name: 'Tiendas',
        href: '/explorar/tiendas',
        icon: Store,
        description: 'Explora tiendas familiares'
      }
    ]
  },
  {
    name: 'Red TTL',
    href: '#',
    icon: Users,
    description: 'Tu red familiar',
    children: [
      {
        name: 'Mi Red',
        href: '/red',
        icon: Heart,
        description: 'Familias conectadas'
      },
      {
        name: 'Invitaciones',
        href: '/red/invitaciones',
        icon: UserPlus,
        description: 'Invita nuevas familias'
      },
      {
        name: 'Eventos',
        href: '/red/eventos',
        icon: Calendar,
        description: 'Eventos de la comunidad'
      }
    ]
  },
  {
    name: 'Mensajes',
    href: '/dashboard/mensajes',
    icon: MessageCircle,
    description: 'Centro de comunicación'
  },
  {
    name: 'Configuración',
    href: '/dashboard/configuracion',
    icon: Settings,
    description: 'Ajustes de perfil y tienda'
  }
];

// Ejemplo de uso en el sidebar
export default function DashboardSidebar({ currentPath }) {
  const [expandedItems, setExpandedItems] = useState(['Mi Tienda']); // Expandir Mi Tienda por defecto
  
  const toggleExpanded = (itemName) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <nav className="space-y-1">
      {navigationItems.map((item) => (
        <div key={item.name}>
          {item.children ? (
            // Item con submenú
            <div>
              <button
                onClick={() => toggleExpanded(item.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  expandedItems.includes(item.name)
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${
                  expandedItems.includes(item.name) ? 'rotate-180' : ''
                }`} />
              </button>
              
              {expandedItems.includes(item.name) && (
                <div className="mt-1 ml-8 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                        currentPath === child.href
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <child.icon className="w-4 h-4 mr-3" />
                      <span>{child.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Item simple
            <Link
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath === item.href
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}