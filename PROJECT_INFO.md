# PROJECT_INFO.md - Описание проекта JournalistHub

## Общее описание

**JournalistHub** - это веб-платформа для публикации и совместной работы над текстовыми проектами. Пользователи могут создавать проекты, загружать документы в разных форматах (PDF, DOCX, ODT, Markdown), управлять версиями файлов, подписываться на авторов и просматривать таблицу лидеров.

---

## Цели проекта

1. **Публикация проектов** - Позволить пользователям публиковать свои текстовые работы с версионностью
2. **Совместная работа** - Обеспечить систему подписок для отслеживания авторов
3. **Поддержка форматов** - Работа с PDF, DOCX, ODT и Markdown файлами
4. **Геймификация** - Система балансов и таблица лидеров для мотивации пользователей
5. **Администрирование** - Панель администратора для управления пользователями и проектами

---

## Стек технологий

### Frontend
- **Next.js 14.2.5** - React фреймворк с App Router
- **React 18+** - Библиотека для построения UI
- **TypeScript** - Строгая типизация
- **Tailwind CSS** - Utility-first CSS фреймворк
- **Lucide React** - Иконки
- **React Markdown** - Рендеринг Markdown

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - ORM для работы с базой данных
- **SQLite** - Легковесная база данных
- **JWT** - JSON Web Tokens для аутентификации
- **pdf-lib** - Генерация PDF документов

### DevOps
- **Docker** - Контейнеризация приложения
- **Docker Compose** - Оркестрация контейнеров
- **Node.js 20 Alpine** - Базовый образ для контейнера

---

## Архитектура

### Клиент-серверная архитектура

Приложение использует классическую клиент-серверную архитектуру:

**Клиентская часть:**
- React компоненты для UI
- Клиентские хуки для управления состоянием
- Fetch API для коммуникации с сервером
- LocalStorage для хранения JWT токена

**Серверная часть:**
- Next.js API Routes для обработки запросов
- Prisma ORM для работы с базой данных
- Middleware для защиты роутов
- JWT валидация для аутентификации

### Хранение файлов

Файлы хранятся на диске в структурированной директории:

```
public/
└── uploads/
    ├── avatars/           # Аватары пользователей
    │   └── {userId}.jpg
    └── projects/          # Файлы проектов
        └── {projectId}/
            └── versions/
                └── {versionNumber}/
                    ├── original.ext    # Оригинальный файл
                    └── converted.pdf   # Конвертированный PDF
```

**Относительные пути в БД:**
- `avatars/{userId}.jpg`
- `projects/{projectId}/versions/{versionNumber}/original.ext`
- `projects/{projectId}/versions/{versionNumber}/converted.pdf`

**API для файлов:**
- `/api/files/[...path]` - единый endpoint для всех файлов
- Поддерживает PDF, PNG, JPG, JPEG, MD, DOCX, ODT
- Для MD файлов возвращает текст (utf-8)
- Для остальных файлов возвращает бинарные данные

### База данных

**SQLite через Prisma ORM:**

**Модели:**
- `User` - пользователи с аватарами, балансом, ролью
- `Project` - проекты с автором, тегами, статусом
- `Version` - версии файлов с путями к файлам
- `Like` - лайки проектов
- `Subscription` - подписки между пользователями
- `Session` - сессии для авторизации

**Связи:**
- User → Project (один ко многим)
- User → Subscription (подписчики и подписки)
- Project → Version (один ко многим)
- Project → Like (один ко многим)

---

## Нестандартные решения

### 1. Конвертация файлов

**Проблема:** Поддержка множества форматов файлов (PDF, DOCX, ODT, Markdown)

**Решение:**
- **PDF** - отображается напрямую через iframe
- **DOCX/ODT** - конвертируются в PDF (placeholder с pdf-lib, в продакшене LibreOffice)
- **Markdown** - НЕ конвертируется в PDF, рендерится через react-markdown в модальном окне

**Код:** `app/api/upload/route.ts`
```typescript
if (ext === '.md') {
  // Для .md файлов, do NOT convert to PDF
  relativePdfPath = relativePath
} else if (ext !== '.pdf') {
  // Для .docx, .odt, etc., convert to PDF
  pdfPath = path.join(uploadDir, 'converted.pdf')
  // ... конвертация через pdf-lib
}
```

### 2. Система подписок

**Проблема:** Пользователи должны иметь возможность следить за авторами

**Решение:**
- Модель `Subscription` с полями `subscriberId` и `authorId`
- API endpoints: POST `/api/subscriptions`, DELETE `/api/subscriptions?authorId=X`
- GET `/api/users/{id}/subscribers` - список подписчиков
- GET `/api/users/{id}/subscriptions` - список подписок
- UI: кнопки Подписаться/Отписаться в профиле и на странице пользователей

**Код:** `app/api/subscriptions/route.ts`
```typescript
const subscription = await prisma.subscription.create({
  data: {
    subscriberId: user.id,
    authorId: authorId,
  },
})
```

### 3. Версионность файлов

**Проблема:** Проекты должны иметь историю изменений

**Решение:**
- Модель `Version` с `versionNumber` и путями к файлам
- Автоматическое инкрементирование номера версии
- Отдельные папки для каждой версии
- Возможность переключаться между версиями

**Код:** `app/api/projects/[id]/versions/route.ts`
```typescript
const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1

const version = await prisma.version.create({
  data: {
    projectId: parseInt(params.id),
    filePath,
    pdfPath,
    versionNumber: nextVersionNumber,
    message: message || `Version ${nextVersionNumber}`,
  },
})
```

### 4. Таблица лидеров с несколькими критериями

**Проблема:** Мотивация пользователей через рейтинг

**Решение:**
- Три вкладки: по проектам, по балансу (Coin), по подписчикам
- Сортировка на клиенте после получения данных
- Использование Prisma `_count` для агрегации

**Код:** `app/(main)/leaderboard/page.tsx`
```typescript
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

### 5. Единый API для файлов

**Проблема:** Удобный доступ к файлам разных типов

**Решение:**
- Один endpoint `/api/files/[...path]` для всех файлов
- Автоматическое определение Content-Type по расширению
- Логирование для отладки
- Поддержка текстового ответа для Markdown

**Код:** `app/api/files/[...path]/route.ts`
```typescript
const ext = path.extname(filePath).toLowerCase()
const contentTypes: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.md': 'text/markdown',
  // ...
}

if (ext === '.md') {
  const file = await readFile(fullPath, 'utf-8')
  return new NextResponse(file, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
```

---

## Инструкция по запуску через Docker

### Требования
- Docker Desktop установлен и запущен
- Docker Compose установлен

### Шаги для запуска

1. **Клонирование репозитория**
```bash
git clone https://github.com/Itami00001/EP-Beta.git
cd journalisthub
```

2. **Настройка переменных окружения**
```bash
cp .env.example .env
```
Отредактируйте `.env` при необходимости:
```
DATABASE_URL="file:./data/dev.db"
JWT_SECRET="your-secret-key"
```

3. **Запуск через Docker Compose**
```bash
docker-compose up --build
```

Эта команда:
- Соберет Docker образ на основе Dockerfile
- Установит зависимости внутри контейнера
- Сгенерирует Prisma Client
- Соберет Next.js приложение
- Запустит сервер на порту 3000

4. **Доступ к приложению**
Откройте в браузере: http://localhost:3000

5. **Остановка**
```bash
docker-compose down
```

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Установка OpenSSL для Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Копирование файлов зависимостей
COPY package*.json ./
COPY prisma ./prisma/

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Генерация Prisma Client
RUN npx prisma generate

# Сборка приложения
RUN npm run build

# Открытие порта
EXPOSE 3000

# Запуск приложения
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:./data/dev.db
      - JWT_SECRET=your-secret-key
    volumes:
      - ./data:/app/data
      - ./public/uploads:/app/public/uploads
```

---

## Нужно ли устанавливать библиотеки локально?

### Для работы через Docker
**НЕТ**, не нужно. Все зависимости устанавливаются внутри контейнера при сборке:

- `npm install` выполняется в Dockerfile
- Prisma Client генерируется внутри контейнера
- Приложение собирается внутри контейнера
- Разработчику достаточно иметь установленный Docker

### Для локальной разработки (npm run dev)
**ДА**, нужно. Для режима разработки:

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Это необходимо для:
- Автозагрузки модулей в режиме разработки
- Горячей перезагрузки (Hot Reload)
- Отладки в IDE
- Быстрого цикла разработки

---

## Пояснение для новых разработчиков

### Структура проекта

```
journalisthub/
├── app/                      # Next.js App Router
│   ├── (admin)/             # Группа роутов для админки
│   │   └── admin/           # Админ панель
│   ├── (main)/              # Группа роутов для основного приложения
│   │   ├── feed/            # Лента проектов
│   │   ├── leaderboard/     # Таблица лидеров
│   │   ├── profile/         # Профили пользователей
│   │   ├── project/         # Страницы проектов
│   │   ├── projects/        # Список проектов
│   │   └── users/           # Список всех пользователей
│   ├── api/                 # API Routes
│   │   ├── admin/           # Admin API
│   │   ├── auth/            # Аутентификация
│   │   ├── files/           # Сервинг файлов
│   │   ├── projects/        # Projects API
│   │   ├── subscriptions/   # Subscriptions API
│   │   ├── upload/          # Загрузка файлов
│   │   └── users/           # Users API
│   └── layout.tsx           # Корневой layout
├── components/              # React компоненты
│   ├── admin/               # Admin компоненты
│   ├── feed/                # Feed компоненты
│   ├── layout/              # Layout компоненты
│   └── project/             # Project компоненты
├── lib/                     # Утилиты
│   ├── auth.ts              # JWT функции
│   ├── db.ts                # Prisma client
│   └── utils.ts             # Общие утилиты
├── prisma/                  # Prisma
│   ├── schema.prisma        # Схема БД
│   └── seed.ts              # Seed данные
├── public/                  # Статические файлы
│   └── uploads/             # Загруженные файлы
├── Dockerfile               # Docker конфигурация
├── docker-compose.yml       # Docker Compose конфигурация
└── package.json             # Зависимости
```

### Ключевые файлы

- `prisma/schema.prisma` - Схема базы данных, изменяйте её для добавления новых полей/таблиц
- `middleware.ts` - Защита роутов, добавьте новые пути для защиты
- `lib/auth.ts` - JWT функции, измените секретный ключ в .env
- `.env` - Переменные окружения, не коммитьте в репозиторий
- `app/api/` - API endpoints, добавляйте новые endpoints здесь
- `components/` - React компоненты, создавайте переиспользуемые компоненты

### Добавление новой функции

1. **Измените схему БД** (если нужно):
   - Отредактируйте `prisma/schema.prisma`
   - Запустите `npx prisma db push` или создайте миграцию

2. **Создайте API endpoint** (если нужно):
   - Создайте файл в `app/api/`
   - Реализуйте GET/POST/PUT/DELETE методы
   - Добавьте логирование

3. **Создайте React компонент**:
   - Создайте файл в `components/`
   - Используйте TypeScript интерфейсы
   - Добавьте Tailwind классы для стилизации

4. **Создайте страницу**:
   - Создайте файл в `app/(main)/` или `app/(admin)/`
   - Используйте клиентские или серверные компоненты
   - Добавьте middleware защиту (если нужно)

5. **Протестируйте**:
   - Запустите `npm run dev` для локальной разработки
   - Или `docker-compose up --build` для Docker
   - Проверьте функциональность в браузере

### Конвенции

- **Именование файлов:** PascalCase для компонентов, kebab-case для утилит
- **Комментарии:** Добавляйте ссылки на разделы методички (например, `// React: Стейты (jsrtPmStInr)`)
- **Типизация:** Всегда используйте TypeScript интерфейсы
- **Логирование:** Добавляйте console.log с префиксом `[API Name]` для отладки
- **Обработка ошибок:** Используйте try-catch с возвращением ошибок клиенту

### Полезные команды

```bash
# Локальная разработка
npm install
npx prisma generate
npx prisma db push
npm run dev

# Docker
docker-compose up --build
docker-compose down
docker-compose logs -f

# Prisma
npx prisma studio          # GUI для БД
npx prisma db seed         # Заполнение БД тестовыми данными
npx prisma migrate dev    # Создание миграции

# Сборка
npm run build              # Production сборка
npm start                 # Запуск production сборки
```

### Troubleshooting

**Проблема:** Файлы не загружаются
**Решение:** Проверьте права на запись в `public/uploads/`, убедитесь что папка существует

**Проблема:** База данных не работает
**Решение:** Удалите `data/dev.db` и запустите `npx prisma db push`

**Проблема:** Docker не запускается
**Решение:** Убедитесь что Docker Desktop запущен, проверьте порты (3000 не занят)

**Проблема:** TypeScript ошибки
**Решение:** Запустите `npx prisma generate` для обновления типов Prisma

---

## Контакты и поддержка

Для вопросов по проекту обращайтесь к разработчикам или создавайте issues в репозитории.
