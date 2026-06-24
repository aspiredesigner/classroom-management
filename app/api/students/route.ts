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
  const students = await prisma.student.findMany({
    where: { classId },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(students)
}

export async function POST(req: NextRequest) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  const { studentId, name, email, classId } = await req.json()
  if (!studentId || !name || !classId) {
    return NextResponse.json({ error: 'studentId, name, classId required' }, { status: 400 })
  }
  const existing = await prisma.student.findUnique({ where: { studentId } })
  if (existing) return NextResponse.json({ error: 'Student ID already exists' }, { status: 400 })
  const student = await prisma.student.create({ data: { studentId, name, email, classId } })
  return NextResponse.json(student)
}