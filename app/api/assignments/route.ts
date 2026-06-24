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
  const assignments = await prisma.assignment.findMany({
    where: { classId },
    include: { _count: { select: { submissions: true } } },
    orderBy: { dueDate: 'desc' },
  })
  return NextResponse.json(assignments)
}

export async function POST(req: NextRequest) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  const { classId, title, description, dueDate } = await req.json()
  if (!classId || !title || !dueDate) {
    return NextResponse.json({ error: 'classId, title, dueDate required' }, { status: 400 })
  }
  const assignment = await prisma.assignment.create({
    data: { classId, title, description, dueDate: new Date(dueDate) },
  })
  return NextResponse.json(assignment)
}