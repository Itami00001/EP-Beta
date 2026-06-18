'use client'

// Admin users table component
// React: Списки (jsrtPmFmLI) - таблица пользователей
// React: Обработка событий (jsrtPmFcHd) - редактирование баланса

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Edit, Save, X, Coins } from 'lucide-react'

interface User {
  id: number
  username: string
  email: string | null
  balance: number
  role: string
  createdAt: Date
  _count: {
    projects: number
  }
}

interface AdminUsersTableProps {
  users: User[]
  onUpdateBalance: (userId: number, balance: number) => Promise<void>
}

export default function AdminUsersTable({ users, onUpdateBalance }: AdminUsersTableProps) {
  const [editingBalance, setEditingBalance] = useState<number | null>(null)
  const [tempBalance, setTempBalance] = useState<number>(0)

  const handleEditBalance = (userId: number, currentBalance: number) => {
    setEditingBalance(userId)
    setTempBalance(currentBalance)
  }

  const handleSaveBalance = async (userId: number) => {
    await onUpdateBalance(userId, tempBalance)
    setEditingBalance(null)
  }

  const handleCancelEdit = () => {
    setEditingBalance(null)
    setTempBalance(0)
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
              Имя
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Баланс Coin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Проекты
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Роль
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Дата регистрации
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {users.map((user, index) => (
            <tr key={user.id} className="hover:bg-gray-750">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {user.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                {user.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {user.email || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {editingBalance === user.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={tempBalance}
                      onChange={(e) => setTempBalance(parseInt(e.target.value))}
                      className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    />
                    <button
                      onClick={() => handleSaveBalance(user.id)}
                      className="p-1 hover:bg-green-600 rounded"
                    >
                      <Save size={16} className="text-green-400" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 hover:bg-red-600 rounded"
                    >
                      <X size={16} className="text-red-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Coins size={16} className="text-yellow-400" />
                    <span>{user.balance}</span>
                    <button
                      onClick={() => handleEditBalance(user.id, user.balance)}
                      className="p-1 hover:bg-gray-600 rounded"
                    >
                      <Edit size={14} className="text-gray-400" />
                    </button>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {user._count.projects}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.role === 'admin' 
                    ? 'bg-red-900 text-red-300' 
                    : 'bg-blue-900 text-blue-300'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {formatDate(user.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
