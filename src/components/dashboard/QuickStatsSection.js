// src/components/dashboard/QuickStatsSection.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export default function QuickStatsSection() {
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

  const StatusIcon = getStatusIcon(userData?.accountStatus);

  const stats = [
    {
      value: '0',
      label: 'Productos',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      value: '0',
      label: 'Servicios',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      value: '0',
      label: 'Empleos',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: StatusIcon,
      label: 'Estado',
      iconColor: getStatusColor(userData?.accountStatus)
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Resumen rápido
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {stat.icon ? (
              <div className="flex items-center justify-center mb-1">
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
              </div>
            ) : (
              <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            )}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}