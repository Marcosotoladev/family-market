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
  XCircle
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
      case 'approved': return 'text-green-600 dark:text-green-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'rejected': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
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

  const storeUrl = userData?.storeSlug ? userData.storeSlug : null;
  const StatusIcon = getStatusIcon(userData?.accountStatus);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        
        {/* Info principal del usuario */}
        <div className="flex items-start sm:items-center space-x-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            {userData.profileImage ? (
              <img
                src={userData.profileImage}
                alt="Perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
              {userData.businessName}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
              {userData.familyName}
            </p>
            <div className="flex items-center mt-1">
              <StatusIcon className={`w-4 h-4 mr-1 ${getStatusColor(userData.accountStatus)}`} />
              <span className={`text-sm font-medium ${getStatusColor(userData.accountStatus)}`}>
                {getStatusText(userData.accountStatus)}
              </span>
            </div>
          </div>
        </div>
        
        {/* URL de la tienda */}
        {storeUrl && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 lg:text-right">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">URL de tu tienda:</p>
            <p className="text-xs sm:text-sm font-mono text-primary-600 dark:text-primary-400 break-all">
              familymarket.vercel.app/tienda/{storeUrl}
            </p>
          </div>
        )}
      </div>

      {/* Datos adicionales del usuario en grid responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-sm text-gray-900 dark:text-white truncate">{userData.email}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Home className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Familia</p>
            <p className="text-sm text-gray-900 dark:text-white truncate">{userData.familyName}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Shield className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Rol</p>
            <p className="text-sm text-gray-900 dark:text-white">{userData.role || 'Usuario'}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Registro</p>
            <p className="text-sm text-gray-900 dark:text-white">
              {userData.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString('es-ES') : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}