import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  const assignment = await prisma.assignment.findUnique({
    where: { id: params.id },
    include: {
      submissions: {
        include: { student: { select: { id: true, studentId: true, name: true } } },
        orderBy: { submittedAt: 'desc' },
      },
    },
  })
  if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(assignment)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  const { title, description, dueDate } = await req.json()
  const assignment = await prisma.assignment.update({
    where: { id: params.id },
    data: { title, description, dueDate: dueDate ? new Date(dueDate) : undefined },
  })
  return NextResponse.json(assignment)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  await prisma.assignment.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}