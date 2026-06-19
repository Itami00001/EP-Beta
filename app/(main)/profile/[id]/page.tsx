'use client'

// User profile page
// React: Компоненты (jsrtPmCpInr) - страница профиля
// React: Стейты (jsrtPmStInr) - управление состоянием
// NextJS: Динамические роуты (jsnxPmRtDy) - [id] параметр

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Calendar, Edit, LogOut, UserPlus, UserMinus } from 'lucide-react'
import UserStats from '@/components/profile/UserStats'
import FeedItem from '@/components/feed/FeedItem'
import { formatDate, authFetch } from '@/lib/utils'

interface UserProfile {
  id: number
  username: string
  email: string | null
  avatar: string | null
  bio: string | null
  balance: number
  role: string
  theme: string
  createdAt: Date
  _count: { projects: number; subscribers: number; subscriptions: number }
}

interface Project {
  id: number; title: string; description: string | null; type: string; tags: string | null
  author: { id: number; username: string; avatar: string | null }
  likes: number; views: number; createdAt: Date; _count: { versions: number }
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [activeTab, setActiveTab] = useState('projects')
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    setIsOwnProfile(currentUser.id === parseInt(params.id as string))
    fetchUserProfile()
    fetchUserProjects()
    checkSubscription()
    if (!isOwnProfile) {
      fetchSubscribers()
      fetchSubscriptions()
    }
  }, [params.id, isOwnProfile])

  const fetchUserProfile = async () => {
    try {
      const res = await authFetch(`/api/users/${params.id}`)
      const data = await res.json()
      if (res.ok) setUser(data.user)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const fetchUserProjects = async () => {
    try {
      const res = await authFetch(`/api/projects?author=${params.id}`)
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (e) { console.error(e) }
  }

  const checkSubscription = async () => {
    try {
      const res = await authFetch(`/api/users/${params.id}/subscribe`)
      const data = await res.json()
      setIsSubscribed(data.subscribed)
    } catch {}
  }

  const handleSubscribe = async () => {
    setSubscribing(true)
    try {
      const res = await authFetch(`/api/users/${params.id}/subscribe`, { method: 'POST' })
      const data = await res.json()
      setIsSubscribed(data.subscribed)
      // Refresh counts
      fetchUserProfile()
    } catch (e) { console.error(e) } finally { setSubscribing(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
    router.push('/login')
    router.refresh()
  }

  const fetchSubscribers = async () => {
    try {
      const res = await authFetch(`/api/users/${params.id}/subscribers`)
      const data = await res.json()
      if (res.ok) setSubscribers(data.subscribers || [])
    } catch (e) { console.error(e) }
  }

  const fetchSubscriptions = async () => {
    try {
      const res = await authFetch(`/api/users/${params.id}/subscriptions`)
      const data = await res.json()
      if (res.ok) setSubscriptions(data.subscriptions || [])
    } catch (e) { console.error(e) }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!user) {
    return <div className="text-center py-12"><p className="text-gray-500 dark:text-gray-400 text-lg">Пользователь не найден</p></div>
  }

  return (
    <div>
      {/* Profile header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <User size={48} className="text-primary-600 dark:text-primary-400" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user.username}</h1>
              {user.bio && <p className="text-gray-600 dark:text-gray-400 mb-2">{user.bio}</p>}
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>На платформе с {formatDate(user.createdAt)}</span>
                </div>
                {user.role === 'admin' && (
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs">Админ</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isOwnProfile ? (
              <>
                <Link href="/profile/edit"
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                  <Edit size={18} /><span>Редактировать</span>
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                  <LogOut size={18} /><span>Выйти</span>
                </button>
              </>
            ) : (
              <button onClick={handleSubscribe} disabled={subscribing}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  isSubscribed
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}>
                {isSubscribed ? <><UserMinus size={18} /><span>Отписаться</span></> : <><UserPlus size={18} /><span>Подписаться</span></>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <UserStats
        projectsCount={user._count.projects}
        subscribersCount={user._count.subscribers}
        subscriptionsCount={user._count.subscriptions}
        balance={user.balance}
      />

      {/* Projects */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Проекты ({projects.length})</h2>
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {isOwnProfile ? 'У вас пока нет проектов' : 'У пользователя пока нет проектов'}
            </p>
            {isOwnProfile && (
              <Link href="/projects/new"
                className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                <span>Создать первый проект</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => <FeedItem key={p.id} project={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
