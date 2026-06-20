// Subscriptions API endpoint
// NextJS: API Routes (jsnxPmBsSC) - POST/DELETE обработчики
// React: Работа с данными (jsrtPmDtInr) - управление подписками

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST create subscription
export async function POST(request: NextRequest) {
  try {
    console.log('[Subscriptions API] Creating subscription')
    
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
    const { authorId } = body

    console.log('[Subscriptions API] Subscription request:', { subscriberId: user.id, authorId })

    if (!authorId) {
      return NextResponse.json(
        { error: 'Author ID is required' },
        { status: 400 }
      )
    }

    if (authorId === user.id) {
      return NextResponse.json(
        { error: 'Cannot subscribe to yourself' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = await prisma.subscription.findUnique({
      where: {
        subscriberId_authorId: {
          subscriberId: user.id,
          authorId: authorId,
        },
      },
    })

    if (existing) {
      console.log('[Subscriptions API] Already subscribed')
      return NextResponse.json(
        { error: 'Already subscribed' },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.create({
      data: {
        subscriberId: user.id,
        authorId: authorId,
      },
    })

    console.log('[Subscriptions API] Subscription created:', subscription.id)

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('[Subscriptions API] Create subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE subscription
export async function DELETE(request: NextRequest) {
  try {
    console.log('[Subscriptions API] Deleting subscription')
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { getUserFromToken } = await import('@/lib/auth')
    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const authorId = searchParams.get('authorId')

    console.log('[Subscriptions API] Unsubscribe request:', { subscriberId: user.id, authorId })

    if (!authorId) {
      return NextResponse.json(
        { error: 'Author ID is required' },
        { status: 400 }
      )
    }

    await prisma.subscription.deleteMany({
      where: {
        subscriberId: user.id,
        authorId: parseInt(authorId),
      },
    })

    console.log('[Subscriptions API] Subscription deleted')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Subscriptions API] Delete subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
