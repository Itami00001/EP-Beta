// Subscribe/Unsubscribe to user API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { getUserFromToken } = await import('@/lib/auth')
    const currentUser = await getUserFromToken(token)
    if (!currentUser) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const authorId = parseInt(params.id)
    if (currentUser.id === authorId) {
      return NextResponse.json({ error: 'Cannot subscribe to yourself' }, { status: 400 })
    }

    const existing = await prisma.subscription.findUnique({
      where: { subscriberId_authorId: { subscriberId: currentUser.id, authorId } },
    })

    if (existing) {
      await prisma.subscription.delete({
        where: { subscriberId_authorId: { subscriberId: currentUser.id, authorId } },
      })
      return NextResponse.json({ subscribed: false })
    } else {
      await prisma.subscription.create({
        data: { subscriberId: currentUser.id, authorId },
      })
      return NextResponse.json({ subscribed: true })
    }
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ subscribed: false })

    const { getUserFromToken } = await import('@/lib/auth')
    const currentUser = await getUserFromToken(token)
    if (!currentUser) return NextResponse.json({ subscribed: false })

    const existing = await prisma.subscription.findUnique({
      where: { subscriberId_authorId: { subscriberId: currentUser.id, authorId: parseInt(params.id) } },
    })

    return NextResponse.json({ subscribed: !!existing })
  } catch {
    return NextResponse.json({ subscribed: false })
  }
}
