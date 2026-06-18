// Admin add coins to all users API endpoint
// NextJS: API Routes (jsnxPmBsSC) - POST обработчик
// React: Работа с данными (jsrtPmDtInr) - массовое обновление

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST add coins to all users (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { getUserFromToken } = await import('@/lib/auth')
    const user = await getUserFromToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { amount } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    // Add coins to all users
    const result = await prisma.user.updateMany({
      data: {
        balance: {
          increment: amount,
        },
      },
    })

    return NextResponse.json({
      message: `Added ${amount} coins to ${result.count} users`,
      affectedCount: result.count,
    })
  } catch (error) {
    console.error('Add coins error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
