'use client'

// User stats component
// React: Компоненты (jsrtPmCpInr) - статистика пользователя
// React: Пропсы (jsrtPmCpPr) - данные статистики

import { FileText, Users, Heart, Coins } from 'lucide-react'

interface UserStatsProps {
  projectsCount: number
  subscribersCount: number
  subscriptionsCount: number
  balance: number
}

export default function UserStats({ projectsCount, subscribersCount, subscriptionsCount, balance }: UserStatsProps) {
  const stats = [
    { label: 'Проекты', value: projectsCount, icon: FileText, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Подписчики', value: subscribersCount, icon: Users, color: 'text-green-600 dark:text-green-400' },
    { label: 'Подписки', value: subscriptionsCount, icon: Heart, color: 'text-red-600 dark:text-red-400' },
    { label: 'Coin', value: balance, icon: Coins, color: 'text-yellow-600 dark:text-yellow-400' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stat.value}
              </p>
            </div>
            <stat.icon size={24} className={stat.color} />
          </div>
        </div>
      ))}
    </div>
  )
}
