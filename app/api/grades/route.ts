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
  const grades = await prisma.grade.findMany({
    where: { classId },
    include: { student: { select: { id: true, studentId: true, name: true } } },
    orderBy: { recordedAt: 'desc' },
  })
  return NextResponse.json(grades)
}

export async function POST(req: NextRequest) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  const { studentId, classId, examName, score } = await req.json()
  if (!studentId || !classId || !examName || score === undefined) {
    return NextResponse.json({ error: 'studentId, classId, examName, score required' }, { status: 400 })
  }
  const grade = await prisma.grade.create({ data: { studentId, classId, examName, score } })
  return NextResponse.json(grade)
}