'use client'

// Leaderboard page
// React: Списки (jsrtPmFmLI) - таблица лидеров
// NextJS: Получение данных (jsnxPmImSC) - статистика

import { useState, useEffect } from 'react'
import { Trophy, Medal, Crown, FileText, Coins, User, Users, RefreshCw } from 'lucide-react'
import { authFetch } from '@/lib/utils'

interface LeaderboardUser {
  id: number
  username: string
  avatar: string | null
  balance: number
  _count: {
    projects: number
    subscribers: number
  }
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'projects' | 'balance' | 'subscribers'>('projects')

  useEffect(() => {
    fetchLeaderboard()
  }, [activeTab])

  const fetchLeaderboard = async () => {
    try {
      const response = await authFetch('/api/admin/users?limit=50')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users')
      }

      let sortedUsers = data.users
      
      switch (activeTab) {
        case 'projects':
          sortedUsers.sort((a: LeaderboardUser, b: LeaderboardUser) => b._count.projects - a._count.projects)
          break
        case 'balance':
          sortedUsers.sort((a: LeaderboardUser, b: LeaderboardUser) => b.balance - a.balance)
          break
        case 'subscribers':
          sortedUsers.sort((a: LeaderboardUser, b: LeaderboardUser) => b._count.subscribers - a._count.subscribers)
          break
      }

      setUsers(sortedUsers.slice(0, 20))
    } catch (error: any) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'projects' as const, label: 'По проектам', icon: FileText },
    { id: 'balance' as const, label: 'По Coin', icon: Coins },
    { id: 'subscribers' as const, label: 'По подписчикам', icon: Users },
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} className="text-yellow-400" />
      case 2:
        return <Medal size={24} className="text-gray-400" />
      case 3:
        return <Medal size={24} className="text-amber-600" />
      default:
        return <span className="text-gray-400 font-bold">{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500'
      case 2:
        return 'bg-gray-100 dark:bg-gray-700 border-gray-400'
      case 3:
        return 'bg-amber-100 dark:bg-amber-900/30 border-amber-600'
      default:
        return 'bg-white dark:bg-gray-800 border-transparent'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Trophy size={32} className="text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Таблица лидеров
          </h1>
        </div>
        <button
          onClick={() => { setLoading(true); fetchLeaderboard() }}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Обновить</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ранг
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Пользователь
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Проекты
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Подписчики
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Coin
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user, index) => (
              <tr
                key={user.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-750 ${getRankColor(index + 1)} border-2`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRankIcon(index + 1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <User size={20} className="text-primary-600 dark:text-primary-400" />
                      </div>
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user._count.projects}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user._count.subscribers}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Coins size={16} className="text-yellow-500" />
                    <span>{user.balance}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
