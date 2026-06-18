# JournalistHub - GitHub для журналистов

Веб-платформа для журналистов и студентов, которая позволяет загружать, просматривать и отслеживать версии текстовых работ.

## Технологический стек

- **Фреймворк**: NextJS 14+ (App Router)
- **Фронтенд**: React 18+
- **Стилизация**: Tailwind CSS
- **База данных**: SQLite (Prisma ORM)
- **Контейнеризация**: Docker + Docker Compose
- **Конвертация файлов**: pdf-lib

## Ключевые функции

- Регистрация/авторизация (JWT токены)
- Загрузка файлов (.pdf, .docx, .md) с конвертацией в PDF
- Версионность (отслеживание изменений как коммиты)
- Лента всех публикаций с фильтрацией
- Профиль пользователя с его работами
- Админ-панель с управлением пользователями и балансом Coin
- Таблица лидеров

## Тестовые пользователи

- admin / adminadmin (администратор)
- test / testtest (обычный пользователь)

## Установка и запуск

### С помощью Docker (рекомендуется)

1. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Запустите с помощью Docker Compose:
```bash
docker-compose up --build
```

Приложение будет доступно по адресу: http://localhost:3000

### Локальная разработка

1. Установите зависимости:
```bash
npm install
```

2. Настройте переменные окружения в `.env`:
```
DATABASE_URL="file:./data/database.sqlite"
JWT_SECRET="your-secret-key-change-in-production"
```

3. Инициализируйте базу данных:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Заполните базу тестовыми данными:
```bash
npx tsx prisma/seed.ts
```

5. Запустите сервер разработки:
```bash
npm run dev
```

## Структура проекта

```
journalisthub/
├── app/                    # NextJS App Router
│   ├── (auth)/            # Группа роутов авторизации
│   ├── (main)/            # Основные страницы
│   ├── (admin)/           # Админ-панель
│   └── api/               # API endpoints
├── components/            # React компоненты
│   ├── layout/           # Компоненты макета
│   ├── feed/             # Компоненты ленты
│   ├── project/          # Компоненты проектов
│   ├── profile/          # Компоненты профиля
│   └── admin/            # Админ компоненты
├── lib/                  # Вспомогательные функции
│   ├── db.ts            # Подключение к БД
│   ├── auth.ts          # Авторизация
│   └── utils.ts         # Утилиты
├── prisma/              # Prisma ORM
│   ├── schema.prisma    # Схема БД
│   └── seed.ts          # Тестовые данные
├── public/              # Статические файлы
│   └── uploads/         # Загруженные файлы
└── data/                # База данных SQLite
```

## API Endpoints

### Авторизация
- `POST /api/auth/login` - Вход
- `POST /api/auth/register` - Регистрация
- `GET /api/auth/me` - Текущий пользователь

### Проекты
- `GET /api/projects` - Список проектов (с фильтрами)
- `POST /api/projects` - Создать проект
- `GET /api/projects/[id]` - Получить проект
- `PUT /api/projects/[id]` - Обновить проект
- `DELETE /api/projects/[id]` - Удалить проект
- `GET /api/projects/[id]/versions` - Версии проекта
- `POST /api/projects/[id]/versions` - Создать версию

### Пользователи
- `GET /api/users/[id]` - Получить пользователя
- `PUT /api/users/[id]` - Обновить профиль

### Загрузка файлов
- `POST /api/upload` - Загрузить файл

### Админ
- `GET /api/admin/users` - Все пользователи
- `PUT /api/admin/users` - Обновить баланс
- `POST /api/admin/users/add-coins` - Начислить Coin всем
- `GET /api/admin/works` - Все работы
- `PUT /api/admin/works` - Обновить статус работы

## Лицензия

MIT
