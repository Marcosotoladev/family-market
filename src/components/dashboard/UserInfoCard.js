// src/components/dashboard/UserInfoCard.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  Home, 
  Shield, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Settings
} from 'lucide-react';

export default function UserInfoCard() {
  const { userData } = useAuth();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'rejected': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      default: return 'Desconocido';
    }
  };

  const StatusIcon = getStatusIcon(userData?.accountStatus);
  const fullName = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || userData?.businessName || 'Usuario';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header principal del usuario */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 sm:px-6 py-6">
        <div className="flex items-center space-x-4">
          {/* Avatar y info principal */}
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white/30">
              {userData?.profileImage ? (
                <img
                  src={userData.profileImage}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              )}
            </div>
            {/* Indicador de estado */}
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${getStatusColor(userData?.accountStatus).includes('green') ? 'bg-green-500' : 
              getStatusColor(userData?.accountStatus).includes('yellow') ? 'bg-yellow-500' : 
              getStatusColor(userData?.accountStatus).includes('red') ? 'bg-red-500' : 'bg-gray-500'} flex items-center justify-center`}>
              <StatusIcon className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
              {fullName}
            </h1>
            <p className="text-white/80 text-sm sm:text-base truncate">
              Hogar: {userData?.familyName || 'Sin asignar'}
            </p>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(userData?.accountStatus)}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {getStatusText(userData?.accountStatus)}
            </div>
          </div>
        </div>
      </div>

      {/* Información detallada */}
      <div className="p-4 sm:p-6">
        {/* Grid de información */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Email
              </p>
              <p className="text-sm text-gray-900 dark:text-white truncate font-medium">
                {userData?.email || 'No especificado'}
              </p>
            </div>
          </div>

          {/* Familia */}
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Home className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Familia
              </p>
              <p className="text-sm text-gray-900 dark:text-white truncate font-medium">
                {userData?.familyName || 'Sin asignar'}
              </p>
            </div>
          </div>

          {/* Rol */}
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Rol
              </p>
              <p className="text-sm text-gray-900 dark:text-white font-medium">
                {userData?.role || 'Usuario'}
              </p>
            </div>
          </div>

          {/* Fecha de registro */}
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Registro
              </p>
              <p className="text-sm text-gray-900 dark:text-white font-medium">
                {userData?.createdAt 
                  ? new Date(userData.createdAt.toDate()).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Configuración del usuario */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-right">
          <a 
            href="/dashboard/profile"
            className="inline-flex items-center text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            <Settings className="w-3 h-3 mr-1" />
            Configurar usuario
          </a>
        </div>
      </div>
    </div>
  );
}
