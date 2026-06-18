// Database connection for JournalistHub
// React: Работа с данными (jsrtPmDtInr) - подключение к БД
// NextJS: Серверные компоненты (jsnxPmBsSC) - Prisma client

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
