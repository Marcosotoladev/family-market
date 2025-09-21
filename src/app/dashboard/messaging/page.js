'use client'
import MessagingManagementSection from '@/components/dashboard/MessagingManagementSection'
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation'

export default function MessagingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />
      <MessagingManagementSection />
    </div>
  )
}