'use client'

// Version history component
// React: Списки (jsrtPmFmLI) - история версий
// React: Условный рендеринг (jsrtPmCdSh) - отображение версий

import { formatDateTime } from '@/lib/utils'
import { Clock, FileText } from 'lucide-react'

interface Version {
  id: number
  versionNumber: number
  message: string | null
  createdAt: Date
  pdfPath: string | null
}

interface VersionHistoryProps {
  versions: Version[]
  onVersionSelect: (version: Version) => void
  selectedVersion: Version | null
}

export default function VersionHistory({ versions, onVersionSelect, selectedVersion }: VersionHistoryProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <Clock size={20} />
        <span>История версий</span>
      </h3>

      {versions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Версий пока нет
        </p>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <button
              key={version.id}
              onClick={() => onVersionSelect(version)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                selectedVersion?.id === version.id
                  ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                  : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <FileText size={18} className="text-primary-600 dark:text-primary-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Версия {version.versionNumber}
                    </p>
                    {version.message && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {version.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatDateTime(version.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
