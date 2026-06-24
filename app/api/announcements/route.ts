import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const classId = searchParams.get('classId')
  if (!classId) return NextResponse.json({ error: 'classId required' }, { status: 400 })
  const announcements = await prisma.announcement.findMany({
    where: { classId },
    include: { teacher: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(announcements)
}

export async function POST(req: NextRequest) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  const { classId, title, content } = await req.json()
  if (!classId || !title || !content) {
    return NextResponse.json({ error: 'classId, title, content required' }, { status: 400 })
  }
  const announcement = await prisma.announcement.create({
    data: { classId, teacherId: user.id, title, content },
  })
  return NextResponse.json(announcement)
}