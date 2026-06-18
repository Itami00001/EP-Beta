// Project versions API endpoint
// NextJS: API Routes (jsnxPmBsSC) - GET/POST обработчики
// NextJS: Динамические роуты (jsnxPmRtDy) - [id] параметр

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all versions of a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const versions = await prisma.version.findMany({
      where: { projectId: parseInt(params.id) },
      orderBy: {
        versionNumber: 'desc',
      },
    })

    return NextResponse.json({ versions })
  } catch (error) {
    console.error('Get versions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new version
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const { filePath, pdfPath, message } = body

    if (!filePath || !pdfPath) {
      return NextResponse.json(
        { error: 'File paths are required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: parseInt(params.id) },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.authorId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get next version number
    const lastVersion = await prisma.version.findFirst({
      where: { projectId: parseInt(params.id) },
      orderBy: { versionNumber: 'desc' },
    })

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

    // Update project timestamp
    await prisma.project.update({
      where: { id: parseInt(params.id) },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ version })
  } catch (error) {
    console.error('Create version error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
