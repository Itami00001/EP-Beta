// User API endpoint
// NextJS: API Routes (jsnxPmBsSC) - GET/PUT обработчики
// NextJS: Динамические роуты (jsnxPmRtDy) - [id] параметр

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        balance: true,
        role: true,
        theme: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            subscribers: true,
            subscriptions: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { getUserFromToken } = await import('@/lib/auth')
    const currentUser = await getUserFromToken(token)
    if (!currentUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { username, bio, avatar, theme } = body

    // Validate avatar format
    if (avatar && !avatar.startsWith('/uploads/avatars/')) {
      return NextResponse.json(
        { error: 'Invalid avatar path' },
        { status: 400 }
      )
    }

    // Only user can update their own profile (or admin)
    if (currentUser.id !== parseInt(params.id) && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
        ...(theme && { theme }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        balance: true,
        role: true,
        theme: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
