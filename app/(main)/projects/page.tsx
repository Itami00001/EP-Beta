'use client'

// Projects list page
// React: Списки (jsrtPmFmLI) - список проектов пользователя
// NextJS: Получение данных (jsnxPmImSC) - API запросы

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FeedItem from '@/components/feed/FeedItem'
import { Plus, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { authFetch } from '@/lib/utils'

interface Project {
  id: number
  title: string
  description: string | null
  type: string
  tags: string | null
  author: {
    id: number
    username: string
    avatar: string | null
  }
  likes: number
  views: number
  createdAt: Date
  _count: {
    versions: number
  }
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [subscriptionProjects, setSubscriptionProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('my')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!token) {
      router.push('/login')
      return
    }

    fetchUserProjects(user.id)
    fetchSubscriptionProjects(user.id)
  }, [router])

  const fetchUserProjects = async (userId: number) => {
    try {
      const response = await authFetch(`/api/projects?author=${userId}`)
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptionProjects = async (userId: number) => {
    try {
      const response = await authFetch(`/api/users/${userId}/subscriptions`)
      const data = await response.json()
      const subscriptions = data.subscriptions || []
      
      // Fetch projects from subscribed authors
      const authorIds = subscriptions.map((s: any) => s.id)
      if (authorIds.length > 0) {
        const projectsResponse = await authFetch(`/api/projects?author=${authorIds.join(',')}`)
        const projectsData = await projectsResponse.json()
        setSubscriptionProjects(projectsData.projects || [])
      }
    } catch (error) {
      console.error('Failed to fetch subscription projects:', error)
    }
  }

  const handleRefresh = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setLoading(true)
    fetchUserProjects(user.id)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Мои проекты
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Обновить</span>
          </button>
          <Link
            href="/projects/new"
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Новый проект</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b dark:border-gray-700 mb-6">
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'my'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('my')}
        >
          Мои проекты ({projects.length})
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'subscriptions'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('subscriptions')}
        >
          Мои подписки ({subscriptionProjects.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'my' && (
            <>
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                    У вас пока нет проектов
                  </p>
                  <Link
                    href="/projects/new"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                    <span>Создать первый проект</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <FeedItem key={project.id} project={project} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'subscriptions' && (
            <>
              {subscriptionProjects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Нет проектов от подписанных авторов
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subscriptionProjects.map((project) => (
                    <FeedItem key={project.id} project={project} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
