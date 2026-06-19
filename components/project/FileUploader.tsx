'use client'

// File uploader component
// React: Работа с файлами (jsrtPmFmsII) - drag and drop
// React: Стейты (jsrtPmStInr) - управление загрузкой

import { useState, useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onRemove: () => void
  accept?: string
  allowedTypes?: string[]
}

export default function FileUploader({ onFileSelect, selectedFile, onRemove, accept = '.pdf,.docx,.md', allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/markdown'] }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx') || file.name.endsWith('.md'))) {
      onFileSelect(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <div className="w-full">
      {selectedFile ? (
        <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText size={20} className="text-primary-600 dark:text-primary-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {selectedFile.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({(selectedFile.size / 1024).toFixed(2)} KB)
            </span>
          </div>
          <button
            onClick={onRemove}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            <X size={18} className="text-red-500" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
          }`}
        >
          <Upload size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Перетащите файл сюда или нажмите для выбора
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Поддерживаемые форматы: PDF, DOCX, MD
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}
