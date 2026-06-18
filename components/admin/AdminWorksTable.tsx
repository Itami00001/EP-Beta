'use client'

// Admin works table component
// React: Списки (jsrtPmFmLI) - таблица работ
// React: Обработка событий (jsrtPmFcHd) - блокировка

import { formatDate } from '@/lib/utils'
import { ExternalLink, Lock, Unlock } from 'lucide-react'

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

interface AdminWorksTableProps {
  projects: Project[]
  onUpdateStatus: (projectId: number, status: string) => Promise<void>
}

export default function AdminWorksTable({ projects, onUpdateStatus }: AdminWorksTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-900 text-green-300'
      case 'moderation':
        return 'bg-yellow-900 text-yellow-300'
      case 'blocked':
        return 'bg-red-900 text-red-300'
      default:
        return 'bg-gray-900 text-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Опубликовано'
      case 'moderation':
        return 'На модерации'
      case 'blocked':
        return 'Заблокировано'
      default:
        return status
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              №
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Автор
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Название
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Версий
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Статус
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Дата
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {projects.map((project, index) => (
            <tr key={project.id} className="hover:bg-gray-750">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {project.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                {project.author.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {project.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {project._count.versions}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {formatDate(project.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <a
                    href={`/project/${project.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-gray-600 rounded"
                    title="Открыть"
                  >
                    <ExternalLink size={16} className="text-blue-400" />
                  </a>
                  {project.status === 'blocked' ? (
                    <button
                      onClick={() => onUpdateStatus(project.id, 'published')}
                      className="p-1 hover:bg-green-600 rounded"
                      title="Разблокировать"
                    >
                      <Unlock size={16} className="text-green-400" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateStatus(project.id, 'blocked')}
                      className="p-1 hover:bg-red-600 rounded"
                      title="Заблокировать"
                    >
                      <Lock size={16} className="text-red-400" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
