// src/components/dashboard/UserManagementSection.js
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, Edit2, Trash2, UserCheck, UserX, Filter, 
  MoreVertical, Mail, Calendar, Building, ExternalLink,
  CheckCircle, XCircle, Clock, Shield, User, Grid, List,
  Users, ChevronLeft
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
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
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
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
      approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      suspended: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
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
      admin: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
      user: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
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

  // User Card Component
  const UserCard = ({ user }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-white">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Business Info */}
      {user.businessName && (
        <div className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Building className="w-3.5 h-3.5" />
            <span className="font-medium">{user.businessName}</span>
          </div>
          {user.storeSlug && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 ml-5">
              /{user.storeSlug}
            </p>
          )}
        </div>
      )}

      {/* Status and Role */}
      <div className="flex items-center justify-between mb-3">
        {getStatusBadge(user.accountStatus)}
        {getRoleBadge(user.role)}
      </div>

      {/* Date */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        <Calendar className="w-3 h-3 inline mr-1" />
        Registro: {formatDate(user.createdAt)}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => {
            setSelectedUser(user);
            setShowUserModal(true);
          }}
          className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <Eye className="w-3.5 h-3.5 inline mr-1" />
          Ver
        </button>

        {user.accountStatus === 'pending' && (
          <button
            onClick={() => updateAccountStatus(user.id, 'approved')}
            className="flex-1 px-3 py-2 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            disabled={actionLoading}
          >
            <UserCheck className="w-3.5 h-3.5 inline mr-1" />
            Aprobar
          </button>
        )}

        {user.accountStatus === 'approved' && (
          <button
            onClick={() => updateAccountStatus(user.id, 'suspended')}
            className="flex-1 px-3 py-2 text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            disabled={actionLoading}
          >
            <UserX className="w-3.5 h-3.5 inline mr-1" />
            Suspender
          </button>
        )}

        {user.accountStatus === 'suspended' && (
          <button
            onClick={() => updateAccountStatus(user.id, 'approved')}
            className="flex-1 px-3 py-2 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            disabled={actionLoading}
          >
            <UserCheck className="w-3.5 h-3.5 inline mr-1" />
            Reactivar
          </button>
        )}

        <button
          onClick={() => {
            setUserToDelete(user);
            setShowDeleteModal(true);
          }}
          className="px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  // Modal de detalles del usuario
  const UserDetailsModal = () => (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Detalles del Usuario
            </h3>
            <button
              onClick={() => {
                setShowUserModal(false);
                setSelectedUser(null);
                setEditMode(false);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {selectedUser && (
            <div className="space-y-6">
              {/* Información personal */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Información Personal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido Familiar</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.familyName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Información del negocio */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Información del Negocio</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Negocio</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.businessName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug de la Tienda</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.storeSlug || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL de la Tienda</label>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm text-gray-900 dark:text-gray-100">{selectedUser.storeUrl || 'N/A'}</p>
                      {selectedUser.storeUrl && (
                        <a 
                          href={selectedUser.storeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Estado y Configuración</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado de Cuenta</label>
                    <div className="mt-1">
                      {editMode ? (
                        <select
                          value={selectedUser.accountStatus}
                          onChange={(e) => setSelectedUser({
                            ...selectedUser,
                            accountStatus: e.target.value
                          })}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
                    <div className="mt-1">
                      {editMode ? (
                        <select
                          value={selectedUser.role}
                          onChange={(e) => setSelectedUser({
                            ...selectedUser,
                            role: e.target.value
                          })}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Verificado</label>
                    <p className="mt-1 text-sm">
                      {selectedUser.emailVerified ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Verificado
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> No verificado
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Perfil Completado</label>
                    <p className="mt-1 text-sm">
                      {selectedUser.profileCompleted ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Completado
                        </span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" /> Pendiente
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Fechas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Registro</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Última Actualización</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(selectedUser.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                {editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Confirmar Eliminación
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>? 
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setUserToDelete(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
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
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Acceso Denegado</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header con gradient */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-white/80 hover:text-white mb-4 transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver
          </button>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
              <p className="text-white/90 mt-1">
                Administra todos los usuarios de la plataforma
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats compactos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Total</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-yellow-200 dark:border-yellow-800">
            <div className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Pendientes</div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-400">
              {users.filter(u => u.accountStatus === 'pending').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-green-200 dark:border-green-800">
            <div className="text-xs font-medium text-green-600 dark:text-green-400">Aprobados</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-400">
              {users.filter(u => u.accountStatus === 'approved').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-red-200 dark:border-red-800">
            <div className="text-xs font-medium text-red-600 dark:text-red-400">Suspendidos</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-400">
              {users.filter(u => u.accountStatus === 'suspended').length}
            </div>
          </div>
        </div>

        {/* Filtros compactos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtros en fila */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Estado</option>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobados</option>
                <option value="suspended">Suspendidos</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Rol</option>
                <option value="user">Usuarios</option>
                <option value="admin">Admins</option>
              </select>

              {/* Toggle vista */}
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                title={viewMode === 'table' ? 'Vista de tarjetas' : 'Vista de tabla'}
              >
                {viewMode === 'table' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
          </div>
        ) : (
          <>
            {/* Vista de tarjetas */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}

            {/* Vista de tabla */}
            {viewMode === 'table' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Indicador de scroll en móvil */}
                <div className="md:hidden bg-blue-50 dark:bg-blue-900/20 px-4 py-2 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2 border-b border-blue-100 dark:border-blue-800">
                  <span>← Desliza para ver más →</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Negocio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-white">
                                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{user.businessName || 'N/A'}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.storeSlug || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(user.accountStatus)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {user.accountStatus === 'pending' && (
                                <button
                                  onClick={() => updateAccountStatus(user.id, 'approved')}
                                  className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1 rounded"
                                  title="Aprobar usuario"
                                  disabled={actionLoading}
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}

                              {user.accountStatus === 'approved' && (
                                <button
                                  onClick={() => updateAccountStatus(user.id, 'suspended')}
                                  className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300 p-1 rounded"
                                  title="Suspender usuario"
                                  disabled={actionLoading}
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              )}

                              {user.accountStatus === 'suspended' && (
                                <button
                                  onClick={() => updateAccountStatus(user.id, 'approved')}
                                  className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1 rounded"
                                  title="Reactivar usuario"
                                  disabled={actionLoading}
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setUserToDelete(user);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded"
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

                  {filteredUsers.length === 0 && (
                    <div className="p-8 text-center">
                      <User className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No hay usuarios
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No se encontraron usuarios con los filtros aplicados
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      {showUserModal && <UserDetailsModal />}
      {showDeleteModal && <DeleteConfirmModal />}
    </div>
  );
};

export default UserManagementSection;