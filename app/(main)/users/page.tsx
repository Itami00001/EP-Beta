'use client'

// All users page
// React: Списки (jsrtPmFmLI) - список всех пользователей
// NextJS: Получение данных (jsnxPmImSC) - API запросы

import { useState, useEffect } from 'react'
import { User, UserPlus, UserMinus } from 'lucide-react'
import Link from 'next/link'
import { authFetch } from '@/lib/utils'

interface User {
  id: number
  username: string
  avatar: string | null
  bio: string | null
  _count: {
    projects: number
    subscribers: number
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchUsers()
    fetchSubscriptions()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await authFetch('/api/admin/users?limit=100')
      const data = await response.json()
      if (response.ok) setUsers(data.users || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const fetchSubscriptions = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (currentUser.id) {
        const response = await authFetch(`/api/users/${currentUser.id}/subscriptions`)
        const data = await response.json()
        if (response.ok) {
          const subIds = new Set<number>(data.subscriptions?.map((s: any) => s.id) || [])
          setSubscriptions(subIds)
        }
      }
    } catch (e) { console.error(e) }
  }

  const handleSubscribe = async (authorId: number) => {
    try {
      const response = await authFetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId }),
      })
      if (response.ok) {
        setSubscriptions(prev => new Set(Array.from(prev).concat(authorId)))
        fetchSubscriptions()
      }
    } catch (e) { console.error(e) }
  }

  const handleUnsubscribe = async (authorId: number) => {
    try {
      const response = await authFetch(`/api/subscriptions?authorId=${authorId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setSubscriptions(prev => {
          const newSet = new Set(prev)
          newSet.delete(authorId)
          return newSet
        })
        fetchSubscriptions()
      }
    } catch (e) { console.error(e) }
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Все пользователи</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4 mb-4">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <User size={32} className="text-primary-600 dark:text-primary-400" />
                </div>
              )}
              <div>
                <Link href={`/profile/${user.id}`} className="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                  {user.username}
                </Link>
                {user.bio && <p className="text-sm text-gray-600 dark:text-gray-400">{user.bio}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
              <span>Проекты: {user._count.projects}</span>
              <span>Подписчики: {user._count.subscribers}</span>
            </div>
            {subscriptions.has(user.id) ? (
              <button
                onClick={() => handleUnsubscribe(user.id)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                <UserMinus size={18} />
                <span>Отписаться</span>
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe(user.id)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <UserPlus size={18} />
                <span>Подписаться</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
