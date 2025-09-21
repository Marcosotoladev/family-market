// src/app/dashboard/user/page.js

'use client'
import UserManagementSection from '@/components/dashboard/UserManagementSection'
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation'

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />
      <UserManagementSection />
    </div>
  )
}