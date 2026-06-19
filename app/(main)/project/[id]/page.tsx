'use client'

// Project page with PDF viewer and version history
// React: Компоненты (jsrtPmCpInr) - страница проекта
// React: Стейты (jsrtPmStInr) - управление состоянием
// NextJS: Динамические роуты (jsnxPmRtDy) - [id] параметр

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, Eye, User, Calendar, Upload, FileText, Clock, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import VersionHistory from '@/components/project/VersionHistory'
import FileUploader from '@/components/project/FileUploader'
import { formatDate, parseTags } from '@/lib/utils'

interface Version {
  id: number
  versionNumber: number
  message: string | null
  createdAt: Date
  pdfPath: string | null
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
    bio: string | null
  }
  likes: number
  views: number
  createdAt: Date
  versions: Version[]
  _count: {
    versions: number
  }
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [versionMessage, setVersionMessage] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [liking, setLiking] = useState(false)
  const [showMarkdownModal, setShowMarkdownModal] = useState(false)
  const [markdownContent, setMarkdownContent] = useState('')

  useEffect(() => {
    fetchProject()
    checkLike()
  }, [params.id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch project')
      }

      setProject(data.project)
      if (data.project.versions.length > 0) {
        setSelectedVersion(data.project.versions[0])
      }
    } catch (error: any) {
      console.error('Failed to fetch project:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkLike = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/projects/${params.id}/like`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setIsLiked(data.liked)
    } catch (error) {
      console.error('Failed to check like:', error)
    }
  }

  const handleLike = async () => {
    setLiking(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Необходимо войти в аккаунт')
        return
      }

      const response = await fetch(`/api/projects/${params.id}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      
      if (response.ok) {
        setIsLiked(data.liked)
        fetchProject()
      }
    } catch (error) {
      console.error('Failed to like:', error)
    } finally {
      setLiking(false)
    }
  }

  const handleUploadVersion = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // Upload file
      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedFile)
      uploadFormData.append('projectId', params.id as string)
      uploadFormData.append('versionNumber', String((project?._count.versions || 0) + 1))

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: uploadFormData,
      })

      const uploadData = await uploadResponse.json()
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Upload failed')
      }

      // Create version
      const versionResponse = await fetch(`/api/projects/${params.id}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          filePath: uploadData.filePath,
          pdfPath: uploadData.pdfPath,
          message: versionMessage,
        }),
      })

      const versionData = await versionResponse.json()
      if (!versionResponse.ok) {
        throw new Error(versionData.error || 'Failed to create version')
      }

      setShowUpload(false)
      setSelectedFile(null)
      setVersionMessage('')
      fetchProject()
    } catch (error: any) {
      console.error('Failed to upload version:', error)
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Проект не найден
        </p>
      </div>
    )
  }

  const tags = parseTags(project.tags)

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <ArrowLeft size={20} />
          <span>Назад к ленте</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm rounded-full">
                  {project.type}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {project.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              {project.author.avatar ? (
                <img
                  src={project.author.avatar}
                  alt={project.author.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <User size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
              )}
              <div>
                <Link
                  href={`/profile/${project.author.id}`}
                  className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {project.author.username}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(project.createdAt)}
                </p>
              </div>
            </div>

            {project.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {project.description}
              </p>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t dark:border-gray-700">
              <button
                onClick={handleLike}
                disabled={liking}
                className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'hover:text-red-500'} transition-colors`}
              >
                <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                <span>{project.likes}</span>
              </button>
              <div className="flex items-center space-x-1">
                <Eye size={16} />
                <span>{project.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText size={16} />
                <span>{project._count.versions} верс.</span>
              </div>
            </div>
          </div>

          {/* Document viewer */}
          {selectedVersion?.pdfPath && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <FileText size={20} />
                <span>Просмотр документа</span>
              </h3>
              <div className="w-full h-[600px] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {selectedVersion.pdfPath.endsWith('.md') ? (
                  <div className="w-full h-full p-6 overflow-auto">
                    <button
                      onClick={() => {
                        setShowMarkdownModal(true)
                        // Fetch markdown content
                        fetch(`/api/files/${selectedVersion.pdfPath}`)
                          .then(res => res.text())
                          .then(text => setMarkdownContent(text))
                      }}
                      className="mb-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                    >
                      Открыть в модальном окне
                    </button>
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                      Markdown файл - нажмите кнопку для просмотра
                    </pre>
                  </div>
                ) : (
                  <iframe
                    src={`/api/files/${selectedVersion.pdfPath}`}
                    className="w-full h-full"
                    title="Document Viewer"
                  />
                )}
              </div>
            </div>
          )}

          {/* Markdown Modal */}
          {showMarkdownModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Просмотр Markdown</h3>
                  <button
                    onClick={() => setShowMarkdownModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="p-6 overflow-auto flex-1">
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{markdownContent}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload new version */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              <Upload size={20} />
              <span>Загрузить новую версию</span>
            </button>

            {showUpload && (
              <div className="mt-4 space-y-4">
                <FileUploader
                  onFileSelect={setSelectedFile}
                  selectedFile={selectedFile}
                  onRemove={() => setSelectedFile(null)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Комментарий к версии
                  </label>
                  <input
                    type="text"
                    value={versionMessage}
                    onChange={(e) => setVersionMessage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Опишите изменения..."
                  />
                </div>
                <button
                  onClick={handleUploadVersion}
                  disabled={!selectedFile || uploading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Загрузка...' : 'Создать версию'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <VersionHistory
            versions={project.versions}
            onVersionSelect={setSelectedVersion}
            selectedVersion={selectedVersion}
          />
        </div>
      </div>
    </div>
  )
}
