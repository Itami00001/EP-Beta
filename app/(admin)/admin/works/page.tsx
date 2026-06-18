'use client'

// Admin works page
// React: Списки (jsrtPmFmLI) - таблица работ
// React: Обработка событий (jsrtPmFcHd) - управление проектами

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminWorksTable from '@/components/admin/AdminWorksTable'
import PDFExportButton from '@/components/admin/PDFExportButton'
import { authFetch } from '@/lib/utils'

interface Project {
  id: number
  title: string
  status: string
  author: {
    id: number
    username: string
  }
  _count: {
    versions: number
  }
  createdAt: Date
}

export default function AdminWorksPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role !== 'admin') {
      router.push('/')
      return
    }

    fetchProjects()
  }, [router, page])

  const fetchProjects = async () => {
    try {
      const response = await authFetch(`/api/admin/works?page=${page}&limit=20`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch projects')
      }

      setProjects(data.projects)
      setTotalPages(data.pagination.totalPages)
    } catch (error: any) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (projectId: number, status: string) => {
    try {
      const response = await fetch('/api/admin/works', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ projectId, status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      fetchProjects()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Не удалось обновить статус')
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Работы</h2>
        <PDFExportButton
          data={projects.map((p, i) => ({
            '№': i + 1,
            'ID': p.id,
            'Автор': p.author.username,
            'Название': p.title,
            'Версий': p._count.versions,
            'Статус': p.status === 'published' ? 'Опубликовано' : p.status === 'blocked' ? 'Заблокировано' : 'Модерация',
          }))}
          columns={[
            { header: '№', key: '№' },
            { header: 'ID', key: 'ID' },
            { header: 'Автор', key: 'Автор' },
            { header: 'Название', key: 'Название' },
            { header: 'Версий', key: 'Версий' },
            { header: 'Статус', key: 'Статус' },
          ]}
          filename="works"
          title="Работы — JournalistHub"
        />
      </div>

      <AdminWorksTable projects={projects} onUpdateStatus={handleUpdateStatus} />

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
          >
            Назад
          </button>
          <span className="text-white">
            Страница {page} из {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  )
}
