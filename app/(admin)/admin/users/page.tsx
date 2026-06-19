'use client'

// Admin users page
// React: Списки (jsrtPmFmLI) - таблица пользователей
// React: Обработка событий (jsrtPmFcHd) - управление пользователями

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminUsersTable from '@/components/admin/AdminUsersTable'
import PDFExportButton from '@/components/admin/PDFExportButton'
import { Coins, RefreshCw } from 'lucide-react'
import { authFetch } from '@/lib/utils'

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

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [addAmount, setAddAmount] = useState(10)
  const [addingCoins, setAddingCoins] = useState(false)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role !== 'admin') {
      router.push('/')
      return
    }

    fetchUsers()
  }, [router, page])

  const fetchUsers = async () => {
    try {
      const response = await authFetch(`/api/admin/users?page=${page}&limit=20`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users')
      }

      setUsers(data.users)
      setTotalPages(data.pagination.totalPages)
    } catch (error: any) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBalance = async (userId: number, balance: number) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId, balance }),
      })

      if (!response.ok) {
        throw new Error('Failed to update balance')
      }

      fetchUsers()
    } catch (error) {
      console.error('Failed to update balance:', error)
      alert('Не удалось обновить баланс')
    }
  }

  const handleAddCoinsToAll = async () => {
    if (!confirm(`Начислить ${addAmount} Coin всем пользователям?`)) return

    setAddingCoins(true)
    try {
      const response = await fetch('/api/admin/users/add-coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ amount: addAmount }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add coins')
      }

      alert(data.message)
      fetchUsers()
    } catch (error: any) {
      console.error('Failed to add coins:', error)
      alert(error.message || 'Не удалось начислить Coin')
    } finally {
      setAddingCoins(false)
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
        <h2 className="text-2xl font-bold text-white">Пользователи</h2>
        <div className="flex items-center space-x-3">
          <PDFExportButton
            data={users.map((u, i) => ({
              'Номер': i + 1, 'ID': u.id, 'Имя': u.username,
              'Email': u.email || '-', 'Баланс': u.balance,
              'Проекты': u._count.projects, 'Роль': u.role,
            }))}
            columns={[
              { header: 'Номер', key: 'Номер' }, { header: 'ID', key: 'ID' },
              { header: 'Имя', key: 'Имя' }, { header: 'Email', key: 'Email' },
              { header: 'Баланс', key: 'Баланс' }, { header: 'Проекты', key: 'Проекты' },
              { header: 'Роль', key: 'Роль' },
            ]}
            filename="users"
            title="Пользователи — JournalistHub"
          />
          <input
            type="number"
            value={addAmount}
            onChange={(e) => setAddAmount(parseInt(e.target.value))}
            className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            min="1"
          />
          <button
            onClick={handleAddCoinsToAll}
            disabled={addingCoins}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Coins size={18} />
            <span>{addingCoins ? 'Начисление...' : 'Начислить всем'}</span>
          </button>
        </div>
      </div>

      <AdminUsersTable users={users} onUpdateBalance={handleUpdateBalance} />

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
