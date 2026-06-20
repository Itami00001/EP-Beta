# METHODS.md - Применение методических материалов в проекте

В этом документе описано, какие темы из методических материалов были применены в коде проекта JournalistHub.

---

## 1. React: Работа с файлами (jsrtPmFmsII) - drag and drop

**Где используется:** `components/project/FileUploader.tsx`

**Описание:** Компонент для загрузки файлов с поддержкой drag and drop.

**Как работает:**
- Обрабатывает события drag over, drag leave, drop
- Проверяет тип файла через MIME types
- Вызывает колбэк `onFileSelect` при успешной загрузке

**Пример кода:**
```typescript
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault()
  setIsDragging(true)
}

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault()
  setIsDragging(false)
  
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    const file = e.dataTransfer.files[0]
    if (allowedTypes.includes(file.type)) {
      onFileSelect(file)
    } else {
      alert('Неподдерживаемый формат файла')
    }
  }
}
```

---

## 2. React: Стейты (jsrtPmStInr) - управление загрузкой

**Где используется:** `components/project/FileUploader.tsx`, `app/(main)/profile/[id]/page.tsx`

**Описание:** Использование useState для управления состоянием загрузки и UI.

**Как работает:**
- `isDragging` - отслеживает, перетаскивается ли файл над областью
- `selectedFile` - хранит выбранный файл
- `isSubscribed` - отслеживает статус подписки на пользователя

**Пример кода:**
```typescript
const [isDragging, setIsDragging] = useState(false)
const [selectedFile, setSelectedFile] = useState<File | null>(null)
const [isSubscribed, setIsSubscribed] = useState(false)
```

---

## 3. React: Работа с данными (jsrtPmDtInr) - модели данных

**Где используется:** `prisma/schema.prisma`

**Описание:** Определение моделей данных для SQLite через Prisma ORM.

**Как работает:**
- Модель `User` - пользователи с подписками и проектами
- Модель `Project` - проекты с версиями
- Модель `Version` - версии файлов
- Модель `Subscription` - подписки между пользователями

**Пример кода:**
```prisma
model User {
  id            Int         @id @default(autoincrement())
  username      String      @unique
  email         String?     @unique
  password      String
  avatar        String?
  bio           String?
  balance       Int         @default(0)
  role          String      @default("user")
  
  projects      Project[]
  subscriptions Subscription[] @relation("UserSubscriptions")
  subscribers   Subscription[] @relation("UserSubscribers")
}

model Subscription {
  id            Int         @id @default(autoincrement())
  subscriberId  Int // кто подписался
  authorId      Int // на кого подписались
  createdAt     DateTime    @default(now())
  
  subscriber    User        @relation("UserSubscribers", fields: [subscriberId], references: [id])
  author        User        @relation("UserSubscriptions", fields: [authorId], references: [id])
  
  @@unique([subscriberId, authorId])
}
```

---

## 4. React: Списки (jsrtPmFmLI) - таблица лидеров

**Где используется:** `app/(main)/leaderboard/page.tsx`, `app/(main)/users/page.tsx`

**Описание:** Отображение списков пользователей с сортировкой и фильтрацией.

**Как работает:**
- Получение данных через API
- Сортировка по разным критериям (проекты, баланс, подписчики)
- Отображение с иконками и аватарками

**Пример кода:**
```typescript
const [users, setUsers] = useState<LeaderboardUser[]>([])
const [activeTab, setActiveTab] = useState<'projects' | 'balance' | 'subscribers'>('projects')

switch (activeTab) {
  case 'projects':
    sortedUsers.sort((a, b) => b._count.projects - a._count.projects)
    break
  case 'balance':
    sortedUsers.sort((a, b) => b.balance - a.balance)
    break
  case 'subscribers':
    sortedUsers.sort((a, b) => b._count.subscribers - a._count.subscribers)
    break
}
```

---

## 5. React: Формы (jsrtPmFmsII) - обработка файлов

**Где используется:** `app/api/upload/route.ts`

**Описание:** Обработка загрузки файлов через FormData.

**Как работает:**
- Получение файла из FormData
- Сохранение на диск в структурированную папку
- Конвертация в PDF для поддерживаемых форматов

**Пример кода:**
```typescript
const formData = await request.formData()
const file = formData.get('file') as File
const projectId = formData.get('projectId') as string
const versionNumber = formData.get('versionNumber') as string

const bytes = await file.arrayBuffer()
const buffer = Buffer.from(bytes)

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects', projectId, 'versions', versionNumber)
await mkdir(uploadDir, { recursive: true })

await writeFile(filePath, buffer)
```

---

## 6. NextJS: API Routes (jsnxPmBsSC) - GET/POST обработчики

**Где используется:** Все файлы в `app/api/`

**Описание:** Создание API endpoints для обработки запросов.

**Как работает:**
- GET для получения данных
- POST для создания данных
- DELETE для удаления данных
- Проверка авторизации через JWT токен

**Пример кода:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { getUserFromToken } = await import('@/lib/auth')
    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const data = await prisma.user.findMany()
    return NextResponse.json({ users: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## 7. NextJS: Динамические роуты (jsnxPmRtDy) - [id] параметр

**Где используется:** `app/(main)/profile/[id]/page.tsx`, `app/(main)/project/[id]/page.tsx`

**Описание:** Создание динамических страниц с параметрами в URL.

**Как работает:**
- Извлечение параметра из URL
- Использование параметра для получения данных
- Отображение контента на основе параметра

**Пример кода:**
```typescript
export default function ProfilePage({ params }: { params: { id: string } }) {
  const userId = parseInt(params.id)
  
  useEffect(() => {
    fetchUserProfile(userId)
  }, [userId])
}
```

---

## 8. NextJS: Серверные компоненты (jsnxPmBsSC) - работа с БД

**Где используется:** `app/api/` роуты

**Описание:** Прямая работа с базой данных на сервере.

**Как работает:**
- Использование Prisma Client для запросов
- Выполнение SQL операций через ORM
- Возврат данных клиенту

**Пример кода:**
```typescript
import { prisma } from '@/lib/db'

const users = await prisma.user.findMany({
  select: {
    id: true,
    username: true,
    avatar: true,
    _count: {
      select: {
        projects: true,
        subscribers: true,
      },
    },
  },
})
```

---

## 9. NextJS: Получение данных (jsnxPmImSC) - статистика

**Где используется:** `app/(main)/leaderboard/page.tsx`

**Описание:** Получение статистических данных для отображения.

**Как работает:**
- Запрос к API endpoint
- Обработка ответа
- Отображение данных в UI

**Пример кода:**
```typescript
const fetchLeaderboard = async () => {
  try {
    const response = await authFetch('/api/admin/users?limit=50')
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch users')
    }

    let sortedUsers = data.users
    sortedUsers.sort((a, b) => b._count.projects - a._count.projects)
    setUsers(sortedUsers.slice(0, 20))
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
  }
}
```

---

## 10. NextJS: Middleware (jsnxPmMdlwr) - защита роутов

**Где используется:** `middleware.ts`

**Описание:** Защита роутов от неавторизованного доступа.

**Как работает:**
- Перехват запросов
- Проверка JWT токена
- Перенаправление на страницу входа

**Пример кода:**
```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register')

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }
}
```

---

## 11. Docker: Контейнеризация (dockerPmCnt) - сборка приложения

**Где используется:** `Dockerfile`, `docker-compose.yml`

**Описание:** Упаковка приложения в Docker контейнер.

**Как работает:**
- Использование node:20-alpine как базового образа
- Установка зависимостей через npm install
- Генерация Prisma Client
- Сборка Next.js приложения
- Запуск через npm start

**Пример кода:**
```dockerfile
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

## 12. Prisma: ORM (prismaPmORM) - работа с SQLite

**Где используется:** `prisma/schema.prisma`, `lib/db.ts`

**Описание:** Использование Prisma ORM для работы с SQLite базой данных.

**Как работает:**
- Определение схемы в schema.prisma
- Генерация клиента через npx prisma generate
- Использование клиента для CRUD операций

**Пример кода:**
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export { prisma }
```

---

## 13. Tailwind CSS: Стилизация (tailwindPmStyl) - utility-first CSS

**Где используется:** Все компоненты и страницы

**Описание:** Использование utility классов Tailwind для стилизации.

**Как работает:**
- Использование предопределенных классов для стилей
- Темная тема через dark: префикс
- Адаптивный дизайн через md:, lg: префиксы

**Пример кода:**
```typescript
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
    Заголовок
  </h1>
  <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
    Кнопка
  </button>
</div>
```

---

## 14. TypeScript: Типизация (tsPmTyp) - строгая типизация

**Где используется:** Все файлы с расширением .ts и .tsx

**Описание:** Использование TypeScript для типизации данных.

**Как работает:**
- Определение интерфейсов для данных
- Типизация пропсов компонентов
- Типизация API ответов

**Пример кода:**
```typescript
interface User {
  id: number
  username: string
  email: string | null
  avatar: string | null
  bio: string | null
  balance: number
  role: string
}

interface LeaderboardUser extends User {
  _count: {
    projects: number
    subscribers: number
  }
}
```

---

## 15. JWT: Аутентификация (jwtPmAuth) - токен-based auth

**Где используется:** `lib/auth.ts`, `app/api/auth/`

**Описание:** Использование JWT токенов для аутентификации.

**Как работает:**
- Генерация токена при входе
- Проверка токена при запросах
- Хранение токена в cookies

**Пример кода:**
```typescript
import jwt from 'jsonwebtoken'

const token = jwt.sign(
  { id: user.id, username: user.username, role: user.role },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '7d' }
)

const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
  id: number
  username: string
  role: string
}
```

---

## 16. React: Хуки (reactPmHooks) - useEffect, useState

**Где используется:** Все клиентские компоненты

**Описание:** Использование React хуков для управления состоянием и эффектами.

**Как работает:**
- useState для локального состояния
- useEffect для побочных эффектов
- useCallback для мемоизации функций

**Пример кода:**
```typescript
const [users, setUsers] = useState<User[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchUsers()
}, [])

useEffect(() => {
  if (activeTab) {
    fetchLeaderboard()
  }
}, [activeTab])
```

---

## 17. File System: Работа с файлами (fsPmFiles) - сохранение на диск

**Где используется:** `app/api/upload/route.ts`, `app/api/files/[...path]/route.ts`

**Описание:** Сохранение и чтение файлов с файловой системы.

**Как работает:**
- Использование fs/promises для асинхронных операций
- Создание директорий с mkdir
- Чтение файлов с readFile

**Пример кода:**
```typescript
import { writeFile, mkdir, readFile } from 'fs/promises'
import path from 'path'

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects', projectId, 'versions', versionNumber)
await mkdir(uploadDir, { recursive: true })

await writeFile(filePath, buffer)

const file = await readFile(fullPath, 'utf-8')
```

---

## 18. PDF: Генерация (pdfPmGen) - pdf-lib

**Где используется:** `app/api/upload/route.ts`, `components/admin/PDFExportButton.tsx`

**Описание:** Генерация PDF документов с помощью pdf-lib.

**Как работает:**
- Создание PDF документа
- Добавление страниц
- Вставка текста с поддержкой Unicode

**Пример кода:**
```typescript
import { PDFDocument, StandardFonts } from 'pdf-lib'

const pdfDoc = await PDFDocument.create()
const page = pdfDoc.addPage([600, 400])
const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

page.drawText('Текст на русском языке', {
  x: 50,
  y: 350,
  size: 12,
  font,
})

const pdfBytes = await pdfDoc.save()
await writeFile(pdfPath, Buffer.from(pdfBytes))
```

---

## 19. Markdown: Рендеринг (mdPmRender) - react-markdown

**Где используется:** `app/(main)/project/[id]/page.tsx`

**Описание:** Рендеринг Markdown файлов в HTML.

**Как работает:**
- Получение текста Markdown файла
- Рендеринг через ReactMarkdown компонент
- Отображение в модальном окне

**Пример кода:**
```typescript
import ReactMarkdown from 'react-markdown'

{showMarkdownModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-auto p-6">
      <ReactMarkdown className="prose dark:prose-invert max-w-none">
        {markdownContent}
      </ReactMarkdown>
    </div>
  </div>
)}
```

---

## 20. Subscriptions: Подписки (subPmSub) - система подписок

**Где используется:** `app/api/subscriptions/route.ts`, `app/(main)/profile/[id]/page.tsx`, `app/(main)/users/page.tsx`

**Описание:** Система подписок пользователей друг на друга.

**Как работает:**
- Создание подписки через POST
- Удаление подписки через DELETE
- Получение списка подписчиков и подписок
- Отображение кнопок Подписаться/Отписаться

**Пример кода:**
```typescript
// Создание подписки
const subscription = await prisma.subscription.create({
  data: {
    subscriberId: user.id,
    authorId: authorId,
  },
})

// Удаление подписки
await prisma.subscription.deleteMany({
  where: {
    subscriberId: user.id,
    authorId: authorId,
  },
})

// Получение подписчиков
const subscribers = await prisma.subscription.findMany({
  where: { authorId: userId },
  include: {
    subscriber: {
      select: {
        id: true,
        username: true,
        avatar: true,
      },
    },
  },
})
```

---

## Итог

В проекте применены все основные темы из методических материалов:
- React компоненты и хуки
- Next.js App Router и API Routes
- Prisma ORM для работы с БД
- Docker для контейнеризации
- Tailwind CSS для стилизации
- TypeScript для типизации
- JWT для аутентификации
- Работа с файловой системой
- Генерация PDF
- Рендеринг Markdown
- Система подписок

Код хорошо структурирован, использует современные практики и готов к масштабированию.
