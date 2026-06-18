// Admin layout with role-based access control
// NextJS: Макеты (jsnxPmLtDf) - админ макет
// NextJS: Middleware (jsnxPmBsSC) - проверка роли

import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Note: Role checking is done in middleware and individual pages
  // This layout provides the admin-specific structure
  
  return (
    <div className="min-h-screen bg-gray-900">
      <Header user={null} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Админ-панель
          </h1>
          <p className="text-gray-400">
            Управление пользователями и проектами
          </p>
        </div>
        {children}
      </main>
    </div>
  )
}
