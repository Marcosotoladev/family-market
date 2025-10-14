// src/app/admin/usuarios/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Search, 
  Filter, 
  Grid, 
  List,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Store,
  Mail,
  Calendar,
  X
} from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, limit, startAfter, getDocs, deleteDoc, doc, where } from 'firebase/firestore';
import EditUserModal from '@/components/admin/EditUserModal';

export default function AdminUsuarios() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'grid'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'user', 'admin'
  const [showFilters, setShowFilters] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const ITEMS_PER_PAGE = 12;

  // Cargar usuarios
  const loadUsers = async (loadMore = false) => {
    try {
      setLoading(true);
      
      let q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      // Filtrar por rol si no es 'all'
      if (filterRole !== 'all') {
        q = query(
          collection(db, 'users'),
          where('role', '==', filterRole),
          orderBy('createdAt', 'desc'),
          limit(ITEMS_PER_PAGE)
        );
      }

      // Paginación
      if (loadMore && lastDoc) {
        q = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (loadMore) {
        setUsers(prev => [...prev, ...usersData]);
      } else {
        setUsers(usersData);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filterRole]);

  // Filtrar usuarios por búsqueda
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.businessName?.toLowerCase().includes(searchLower) ||
      user.storeSlug?.toLowerCase().includes(searchLower)
    );
  });

  // Eliminar usuario
  const handleDeleteUser = async (userId) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert('Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error al eliminar usuario');
    }
  };

  // Abrir modal de edición
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  // Actualizar usuario en la lista después de editar
  const handleUserUpdated = (updatedUser) => {
    setUsers(prev => prev.map(u => 
      u.id === updatedUser.id ? { ...u, ...updatedUser } : u
    ));
  };

  // Formatear fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Usuarios
          </h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Administra todos los usuarios registrados en la plataforma
        </p>
      </div>

      {/* Barra de herramientas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o tienda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filtros y Vista */}
          <div className="flex gap-2">
            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400'
                  : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>

            {/* Toggle vista */}
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title="Vista de tabla"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title="Vista de tarjetas"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rol
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Todos</option>
                  <option value="user">Usuarios</option>
                  <option value="admin">Administradores</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Mostrando {filteredUsers.length} de {users.length} usuarios
      </div>

      {/* Loading */}
      {loading && users.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No se encontraron usuarios</p>
        </div>
      ) : (
        <>
          {/* Vista Grid */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map(user => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}

          {/* Vista Lista */}
          {viewMode === 'list' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Wrapper con scroll horizontal en móvil */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Tienda
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Registro
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map(user => (
                      <UserRow 
                        key={user.id} 
                        user={user} 
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                        formatDate={formatDate}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Botón cargar más */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => loadUsers(true)}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Cargando...' : 'Cargar más usuarios'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de edición */}
      <EditUserModal
        user={selectedUser}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}

// Componente de tarjeta de usuario
function UserCard({ user, onEdit, onDelete, formatDate }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              {(user.firstName?.[0] || user.businessName?.[0] || user.email?.[0] || '?').toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.businessName || 'Sin nombre'}
            </h3>
            {user.role === 'admin' && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(user);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar usuario
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(user.id);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar usuario
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Mail className="w-4 h-4" />
          <span className="truncate">{user.email}</span>
        </div>
        
        {user.storeSlug && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Store className="w-4 h-4" />
            <span className="truncate">{user.storeSlug}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(user.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

// Componente de fila de usuario (vista lista)
function UserRow({ user, onEdit, onDelete, formatDate }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              {(user.firstName?.[0] || user.businessName?.[0] || user.email?.[0] || '?').toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.businessName || 'Sin nombre'}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {user.email}
      </td>
      <td className="px-4 py-3">
        {user.role === 'admin' ? (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
            <Shield className="w-3 h-3" />
            Admin
          </span>
        ) : (
          <span className="inline-flex items-center text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
            Usuario
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {user.storeSlug ? (
          <span className="inline-flex items-center gap-1">
            <Store className="w-3 h-3" />
            {user.storeSlug}
          </span>
        ) : (
          <span className="text-gray-400">Sin tienda</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {formatDate(user.createdAt)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(user)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );
}