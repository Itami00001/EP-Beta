'use client'

// Main feed page
// React: Списки и ключи (jsrtPmFmLP) - отображение проектов
// React: Условный рендеринг (jsrtPmCdSh) - загрузка
// NextJS: Получение данных (jsnxPmImSC) - API запросы

import { useState, useEffect, Suspense, useCallback } from 'react'
import FeedItem from '@/components/feed/FeedItem'
import FeedFilters from '@/components/feed/FeedFilters'
import { Plus, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function FeedContent() {
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchProjects = useCallback(async (pageNum = 1, append = false) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/projects?page=${pageNum}&${searchParams.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await response.json()
      if (append) {
        setProjects((prev) => [...prev, ...data.projects])
      } else {
        setProjects(data.projects)
      }
      setHasMore(data.pagination.page < data.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  const handleRefresh = () => {
    setLoading(true)
    setPage(1)
    fetchProjects(1, false)
  }

  useEffect(() => {
    setLoading(true)
    setPage(1)
    fetchProjects(1, false)
  }, [searchParams.toString()])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchProjects(nextPage, true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Лента работ
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

      <FeedFilters />

      {loading && projects.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Работы не найдены
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <FeedItem key={project.id} project={project} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Загрузить еще
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

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

export default function FeedPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <FeedContent />
    </Suspense>
  )
}
