// src/app/dashboard/page.js - Versión modular
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import UserInfoCard from '@/components/dashboard/UserInfoCard';
import ActionCardsGrid from '@/components/dashboard/ActionCardsGrid';
import QuickStatsSection from '@/components/dashboard/QuickStatsSection';

export default function Dashboard() {
  const { isAuthenticated, userData, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />
      
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <UserInfoCard />
        <ActionCardsGrid />
        <QuickStatsSection />
      </div>
    </div>
  );
}