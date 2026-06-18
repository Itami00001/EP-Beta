'use client'

// Admin dashboard page
// React: Компоненты (jsrtPmCpInr) - дашборд
// NextJS: Получение данных (jsnxPmImSC) - статистика

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, FileText, Coins, Activity } from 'lucide-react'
import { authFetch } from '@/lib/utils'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalCoins: 0,
    totalVersions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role !== 'admin') {
      router.push('/')
      return
    }

    fetchStats()
  }, [router])

  const fetchStats = async () => {
    try {
      // Fetch users count
      const usersResponse = await authFetch('/api/admin/users?limit=1')
      const usersData = await usersResponse.json()
      
      // Fetch projects count
      const projectsResponse = await authFetch('/api/admin/works?limit=1')
      const projectsData = await projectsResponse.json()

      setStats({
        totalUsers: usersData.pagination?.total || 0,
        totalProjects: projectsData.pagination?.total || 0,
        totalCoins: 0, // Would need a separate endpoint
        totalVersions: 0, // Would need a separate endpoint
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: 'Пользователи',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-600',
      link: '/admin/users',
    },
    {
      label: 'Проекты',
      value: stats.totalProjects,
      icon: FileText,
      color: 'bg-green-600',
      link: '/admin/works',
    },
    {
      label: 'Coin в обороте',
      value: stats.totalCoins,
      icon: Coins,
      color: 'bg-yellow-600',
      link: '#',
    },
    {
      label: 'Всего версий',
      value: stats.totalVersions,
      icon: Activity,
      color: 'bg-purple-600',
      link: '#',
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Обзор</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.link}
            className="bg-gray-800 rounded-xl shadow-md p-6 hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon size={24} className="text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Быстрые действия</h3>
          <div className="space-y-3">
            <Link
              href="/admin/users"
              className="block w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-center"
            >
              Управление пользователями
            </Link>
            <Link
              href="/admin/works"
              className="block w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-center"
            >
              Управление работами
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Система</h3>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>Версия: 1.0.0</p>
            <p>Статус: Активна</p>
            <p>База данных: SQLite</p>
          </div>
        </div>
      </div>
    </div>
  )
}
