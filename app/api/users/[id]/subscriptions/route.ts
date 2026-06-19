// Subscriptions API endpoint
// NextJS: API Routes (jsnxPmBsSC) - GET обработчик
// NextJS: Динамические роуты (jsnxPmRtDy) - [id] параметр

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET subscriptions for a user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { subscriberId: parseInt(params.id) },
      include: {
        author: {
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
      subscriptions: subscriptions.map(s => s.author),
    })
  } catch (error) {
    console.error('Get subscriptions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
