'use client'

// Header component
// React: Компоненты (jsrtPmCpInr) - навигационный хедер
// React: Пропсы (jsrtPmCpPr) - передача данных
// NextJS: Навигация (jsnxPmNvInr) - ссылки

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, User, Coins, Home, FolderOpen, Trophy, LogOut } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

interface User {
  id: number
  username: string
  avatar: string | null
  balance: number
  role: string
}

interface HeaderProps {
  user: User | null
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(user)

  // Load user from localStorage on mount (client-side)
  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored))
      } catch {}
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Clear the auth cookie
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              JournalistHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Home size={20} />
              <span>Лента</span>
            </Link>
            <Link
              href="/projects"
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <FolderOpen size={20} />
              <span>Проекты</span>
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Trophy size={20} />
              <span>Рейтинг</span>
            </Link>
            
            <ThemeToggle />
            
            {currentUser && (
              <>
                <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                  <Coins size={20} />
                  <span className="font-semibold">{currentUser.balance}</span>
                </div>
                
                <Link
                  href={`/profile/${currentUser.id}`}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User size={20} />
                  )}
                  <span>{currentUser.username}</span>
                </Link>

                {currentUser.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Админ
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Выйти"
                >
                  <LogOut size={20} />
                  <span className="hidden lg:inline">Выйти</span>
                </button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700">
          <nav className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home size={20} />
              <span>Лента</span>
            </Link>
            <Link
              href="/projects"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <FolderOpen size={20} />
              <span>Проекты</span>
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Trophy size={20} />
              <span>Рейтинг</span>
            </Link>
            
            {currentUser && (
              <>
                <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400 py-2">
                  <Coins size={20} />
                  <span className="font-semibold">{currentUser.balance} Coin</span>
                </div>
                
                <Link
                  href={`/profile/${currentUser.id}`}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={20} />
                  <span>Профиль</span>
                </Link>

                {currentUser.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Админ-панель
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <span>Выйти</span>
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
