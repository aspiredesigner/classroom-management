import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  const cls = await prisma.class.findUnique({
    where: { id: params.id },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      students: { orderBy: { name: 'asc' } },
      assignments: { orderBy: { dueDate: 'desc' } },
      announcements: {
        include: { teacher: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      grades: {
        include: { student: { select: { id: true, studentId: true, name: true } } },
        orderBy: { recordedAt: 'desc' },
      },
    },
  })
  if (!cls) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(cls)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  const { name, description } = await req.json()
  const cls = await prisma.class.update({
    where: { id: params.id, teacherId: user.id },
    data: { name, description },
  })
  return NextResponse.json(cls)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  await prisma.class.delete({ where: { id: params.id, teacherId: user.id } })
  return NextResponse.json({ success: true })
}