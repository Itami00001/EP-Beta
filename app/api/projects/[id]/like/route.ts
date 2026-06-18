// Like/Unlike project API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { getUserFromToken } = await import('@/lib/auth')
    const user = await getUserFromToken(token)
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const projectId = parseInt(params.id)

    const existing = await prisma.like.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    })

    if (existing) {
      // Unlike
      await prisma.like.delete({ where: { userId_projectId: { userId: user.id, projectId } } })
      await prisma.project.update({ where: { id: projectId }, data: { likes: { decrement: 1 } } })
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.like.create({ data: { userId: user.id, projectId } })
      await prisma.project.update({ where: { id: projectId }, data: { likes: { increment: 1 } } })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Check if user liked this project
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ liked: false })

    const { getUserFromToken } = await import('@/lib/auth')
    const user = await getUserFromToken(token)
    if (!user) return NextResponse.json({ liked: false })

    const existing = await prisma.like.findUnique({
      where: { userId_projectId: { userId: user.id, projectId: parseInt(params.id) } },
    })

    return NextResponse.json({ liked: !!existing })
  } catch {
    return NextResponse.json({ liked: false })
  }
}
