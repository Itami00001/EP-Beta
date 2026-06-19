// Subscribers API endpoint
// NextJS: API Routes (jsnxPmBsSC) - GET обработчик
// NextJS: Динамические роуты (jsnxPmRtDy) - [id] параметр

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET subscribers for a user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscribers = await prisma.subscription.findMany({
      where: { authorId: parseInt(params.id) },
      include: {
        subscriber: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      subscribers: subscribers.map(s => s.subscriber),
    })
  } catch (error) {
    console.error('Get subscribers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
