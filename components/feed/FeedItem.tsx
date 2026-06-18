'use client'

// Feed item component
// React: Компоненты (jsrtPmCpInr) - карточка проекта
// React: Обработка событий (jsrtPmFcHd) - лайк

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Eye, FileText, Calendar, User } from 'lucide-react'
import { formatDate, parseTags, authFetch } from '@/lib/utils'

interface FeedItemProps {
  project: {
    id: number
    title: string
    description: string | null
    type: string
    tags: string | null
    author: { id: number; username: string; avatar: string | null }
    likes: number
    views: number
    createdAt: Date
    _count?: { versions: number }
  }
}

export default function FeedItem({ project }: FeedItemProps) {
  const tags = parseTags(project.tags)
  const versionCount = project._count?.versions || 0
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(project.likes)
  const [liking, setLiking] = useState(false)

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (liking) return
    setLiking(true)
    try {
      const res = await authFetch(`/api/projects/${project.id}/like`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setLiked(data.liked)
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1)
      }
    } catch (e) { console.error(e) } finally { setLiking(false) }
  }

  return (
    <Link href={`/project/${project.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer h-full">
        <div className="p-6">
          {/* Author + type */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              {project.author.avatar ? (
                <img src={project.author.avatar} alt={project.author.username} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <User size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{project.author.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(project.createdAt)}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm rounded-full whitespace-nowrap">
              {project.type}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{project.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{project.description || 'Нет описания'}</p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md">#{tag}</span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 transition-colors hover:text-red-500 ${liked ? 'text-red-500' : ''}`}
              >
                <Heart size={16} className={liked ? 'fill-current text-red-500' : ''} />
                <span>{likeCount}</span>
              </button>
              <div className="flex items-center space-x-1">
                <Eye size={16} />
                <span>{project.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText size={16} />
                <span>{versionCount} верс.</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar size={16} />
              <span>{formatDate(project.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
