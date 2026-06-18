// Root layout
// NextJS: Макеты (jsnxPmLtDf) - корневой макет
// NextJS: Метаданные (jsnxPmLtMd) - SEO метаданные

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'JournalistHub - GitHub для журналистов',
  description: 'Платформа для журналистов и студентов для загрузки, просмотра и отслеживания версий текстовых работ',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
