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
  const date = searchParams.get('date')
  if (!classId) return NextResponse.json({ error: 'classId required' }, { status: 400 })
  const where: { classId: string; date?: Date } = { classId }
  if (date) where.date = new Date(date)
  const records = await prisma.attendance.findMany({
    where,
    include: { student: { select: { id: true, studentId: true, name: true } } },
  })
  return NextResponse.json(records)
}

export async function POST(req: NextRequest) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  const { classId, studentId, date, status } = await req.json()
  if (!classId || !studentId || !date) {
    return NextResponse.json({ error: 'classId, studentId, date required' }, { status: 400 })
  }
  const record = await prisma.attendance.upsert({
    where: { studentIdClassIdDate: { studentId, classId, date: new Date(date) } },
    create: { classId, studentId, date: new Date(date), status: status || 'present' },
    update: { status },
  })
  return NextResponse.json(record)
}