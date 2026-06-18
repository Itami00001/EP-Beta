// Prisma seed file for JournalistHub
// React: Работа с данными (jsrtPmDtInr) - наполнение БД
// NextJS: Серверные компоненты (jsnxPmBsSC) - инициализация данных

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create test users (always update passwords so credentials are always correct)
  const adminPassword = await bcrypt.hash('adminadmin', 10)
  const testPassword = await bcrypt.hash('testtest', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: adminPassword, role: 'admin' },
    create: {
      username: 'admin',
      email: 'admin@journalisthub.com',
      password: adminPassword,
      role: 'admin',
      balance: 1000,
      bio: 'Administrator of JournalistHub',
    },
  })

  const test = await prisma.user.upsert({
    where: { username: 'test' },
    update: { password: testPassword },
    create: {
      username: 'test',
      email: 'test@journalisthub.com',
      password: testPassword,
      role: 'user',
      balance: 100,
      bio: 'Test user for JournalistHub',
    },
  })

  console.log('✅ Upserted test users:', { admin: admin.username, test: test.username })

  // Create fake users (skip if already exist)
  const fakeUsers = []
  for (let i = 1; i <= 20; i++) {
    const password = await bcrypt.hash('password123', 10)
    const user = await prisma.user.upsert({
      where: { username: `user${i}` },
      update: {},
      create: {
        username: `user${i}`,
        email: `user${i}@example.com`,
        password,
        bio: `Bio for user ${i}`,
        balance: Math.floor(Math.random() * 500),
      },
    })
    fakeUsers.push(user)
  }
  console.log(`✅ Upserted ${fakeUsers.length} fake users`)

  // Create fake projects only if none exist yet (idempotent)
  const existingProjects = await prisma.project.count()
  if (existingProjects === 0) {
    const allUsers = [admin, test, ...fakeUsers]
    const projectTypes = ['Статья', 'Репортаж', 'Интервью', 'Обзор', 'Лабораторная', 'Другое']

    for (let i = 1; i <= 50; i++) {
      const author = allUsers[Math.floor(Math.random() * allUsers.length)]
      const project = await prisma.project.create({
        data: {
          title: `Project ${i}: ${projectTypes[Math.floor(Math.random() * projectTypes.length)]}`,
          description: `Description for project ${i}`,
          type: projectTypes[Math.floor(Math.random() * projectTypes.length)],
          tags: JSON.stringify(['tag1', 'tag2', 'tag3']),
          authorId: author.id,
          isPublic: true,
          likes: Math.floor(Math.random() * 100),
          views: Math.floor(Math.random() * 500),
        },
      })

      // Create versions for each project
      for (let v = 1; v <= Math.floor(Math.random() * 3) + 1; v++) {
        await prisma.version.create({
          data: {
            projectId: project.id,
            filePath: `/uploads/projects/${project.id}/v${v}/file.pdf`,
            pdfPath: `/uploads/projects/${project.id}/v${v}/file.pdf`,
            versionNumber: v,
            message: `Version ${v} commit message`,
          },
        })
      }
    }
    console.log('✅ Created 50 fake projects with versions')

    // Create random likes and subscriptions
    const projects = await prisma.project.findMany()
    for (const project of projects) {
      // Random likes
      const likers = allUsers.filter(() => Math.random() > 0.7)
      for (const liker of likers) {
        try {
          await prisma.like.create({
            data: {
              userId: liker.id,
              projectId: project.id,
            },
          })
        } catch (e) {
          // Ignore duplicate likes
        }
      }

      // Random subscriptions to author
      const subscribers = allUsers.filter(u => u.id !== project.authorId && Math.random() > 0.8)
      for (const subscriber of subscribers) {
        try {
          await prisma.subscription.create({
            data: {
              subscriberId: subscriber.id,
              authorId: project.authorId,
            },
          })
        } catch (e) {
          // Ignore duplicate subscriptions
        }
      }
    }
    console.log('✅ Created random likes and subscriptions')
  } else {
    console.log(`ℹ️  Skipping projects/likes seed (${existingProjects} projects already exist)`)
  }

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
