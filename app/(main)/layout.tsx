// Main layout with header
// NextJS: Макеты (jsnxPmLtDf) - основной макет
// NextJS: Вложенные макеты (jsnxPmLtNL) - группировка роутов

import Header from '@/components/layout/Header'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={null} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
