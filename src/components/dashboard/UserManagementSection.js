// src/components/dashboard/UserManagementSection.js
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, Edit2, Trash2, UserCheck, UserX, Filter, 
  MoreVertical, Mail, Calendar, Building, ExternalLink,
  CheckCircle, XCircle, Clock, Shield, User
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

const UserManagementSection = () => {
  const { userData } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Verificar si el usuario actual es admin
  const isAdmin = userData?.role === 'admin';

  // Cargar usuarios desde Firebase
  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersQuery = query(collection(db, 'users'), orderBy('firstName', 'asc'));
      const querySnapshot = await getDocs(usersQuery);
      
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios
  useEffect(() => {
    let filtered = users;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.familyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.accountStatus === statusFilter);
    }

    // Filtro por rol
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, roleFilter]);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  // Actualizar estado de cuenta
  const updateAccountStatus = async (userId, newStatus) => {
    try {
      setActionLoading(true);
      await updateDoc(doc(db, 'users', userId), {
        accountStatus: newStatus,
        updatedAt: new Date()
      });
      
      // Actualizar estado local
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, accountStatus: newStatus, updatedAt: new Date() }
          : user
      ));
      
      alert(`Usuario ${newStatus === 'approved' ? 'aprobado' : 'suspendido'} exitosamente`);
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error actualizando el estado del usuario');
    } finally {
      setActionLoading(false);
    }
  };

  // Actualizar rol de usuario
  const updateUserRole = async (userId, newRole) => {
    try {
      setActionLoading(true);
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date()
      });
      
      // Actualizar estado local
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole, updatedAt: new Date() }
          : user
      ));
      
      alert(`Rol actualizado a ${newRole} exitosamente`);
    } catch (error) {
      console.error('Error actualizando rol:', error);
      alert('Error actualizando el rol del usuario');
    } finally {
      setActionLoading(false);
    }
  };

  // Eliminar usuario
  const deleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setActionLoading(true);
      await deleteDoc(doc(db, 'users', userToDelete.id));
      
      // Actualizar estado local
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      setShowDeleteModal(false);
      setUserToDelete(null);
      alert('Usuario eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error eliminando el usuario');
    } finally {
      setActionLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Obtener badge de estado
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      suspended: 'bg-red-100 text-red-800 border-red-200'
    };

    const icons = {
      pending: <Clock className="w-3 h-3" />,
      approved: <CheckCircle className="w-3 h-3" />,
      suspended: <XCircle className="w-3 h-3" />
    };

    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      suspended: 'Suspendido'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {icons[status]}
        {labels[status] || 'Desconocido'}
      </span>
    );
  };

  // Obtener badge de rol
  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      user: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    const icons = {
      admin: <Shield className="w-3 h-3" />,
      user: <User className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[role] || styles.user}`}>
        {icons[role]}
        {role === 'admin' ? 'Admin' : 'Usuario'}
      </span>
    );
  };

  // Modal de detalles del usuario
  const UserDetailsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Detalles del Usuario
            </h3>
            <button
              onClick={() => {
                setShowUserModal(false);
                setSelectedUser(null);
                setEditMode(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {selectedUser && (
            <div className="space-y-6">
              {/* Información personal */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Información Personal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido Familiar</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.familyName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Información del negocio */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Información del Negocio</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre del Negocio</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.businessName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug de la Tienda</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.storeSlug || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">URL de la Tienda</label>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm text-gray-900">{selectedUser.storeUrl || 'N/A'}</p>
                      {selectedUser.storeUrl && (
                        <a 
                          href={selectedUser.storeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado y configuración */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Estado y Configuración</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado de Cuenta</label>
                    <div className="mt-1">
                      {editMode ? (
                        <select
                          value={selectedUser.accountStatus}
                          onChange={(e) => setSelectedUser({
                            ...selectedUser,
                            accountStatus: e.target.value
                          })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="approved">Aprobado</option>
                          <option value="suspended">Suspendido</option>
                        </select>
                      ) : (
                        getStatusBadge(selectedUser.accountStatus)
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rol</label>
                    <div className="mt-1">
                      {editMode ? (
                        <select
                          value={selectedUser.role}
                          onChange={(e) => setSelectedUser({
                            ...selectedUser,
                            role: e.target.value
                          })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="user">Usuario</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        getRoleBadge(selectedUser.role)
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Verificado</label>
                    <p className="mt-1 text-sm">
                      {selectedUser.emailVerified ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Verificado
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> No verificado
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Perfil Completado</label>
                    <p className="mt-1 text-sm">
                      {selectedUser.profileCompleted ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Completado
                        </span>
                      ) : (
                        <span className="text-yellow-600 flex items-center gap-1">
                          <Clock className="w-4 h-4" /> Pendiente
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Fechas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Registro</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                {editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        await updateAccountStatus(selectedUser.id, selectedUser.accountStatus);
                        await updateUserRole(selectedUser.id, selectedUser.role);
                        setEditMode(false);
                        await loadUsers();
                      }}
                      disabled={actionLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {actionLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Modal de confirmación de eliminación
  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Confirmar Eliminación
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>? 
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setUserToDelete(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={deleteUser}
            disabled={actionLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );

  // Verificar permisos de admin
  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-400">
            <XCircle className="h-12 w-12" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Acceso Denegado</h3>
          <p className="mt-2 text-sm text-gray-600">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="mt-2 text-sm text-gray-600">
          Administra todos los usuarios registrados en la plataforma
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, email o negocio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="suspended">Suspendidos</option>
            </select>
          </div>

          {/* Filtro por rol */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Todos los roles</option>
              <option value="user">Usuarios</option>
              <option value="admin">Administradores</option>
            </select>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600">Total Usuarios</div>
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm font-medium text-yellow-600">Pendientes</div>
            <div className="text-2xl font-bold text-yellow-900">
              {users.filter(u => u.accountStatus === 'pending').length}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm font-medium text-green-600">Aprobados</div>
            <div className="text-2xl font-bold text-green-900">
              {users.filter(u => u.accountStatus === 'approved').length}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm font-medium text-red-600">Suspendidos</div>
            <div className="text-2xl font-bold text-red-900">
              {users.filter(u => u.accountStatus === 'suspended').length}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Negocio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.businessName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{user.storeSlug || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.accountStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {/* Ver detalles */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Acciones rápidas de estado */}
                        {user.accountStatus === 'pending' && (
                          <button
                            onClick={() => updateAccountStatus(user.id, 'approved')}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Aprobar usuario"
                            disabled={actionLoading}
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}

                        {user.accountStatus === 'approved' && (
                          <button
                            onClick={() => updateAccountStatus(user.id, 'suspended')}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                            title="Suspender usuario"
                            disabled={actionLoading}
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}

                        {user.accountStatus === 'suspended' && (
                          <button
                            onClick={() => updateAccountStatus(user.id, 'approved')}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Reactivar usuario"
                            disabled={actionLoading}
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}

                        {/* Eliminar usuario */}
                        <button
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && !loading && (
              <div className="p-8 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <User className="h-12 w-12" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No hay usuarios</h3>
                <p className="mt-2 text-sm text-gray-600">
                  No se encontraron usuarios que coincidan con los filtros aplicados.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      {showUserModal && <UserDetailsModal />}
      {showDeleteModal && <DeleteConfirmModal />}
    </div>
  );
};

export default UserManagementSection;