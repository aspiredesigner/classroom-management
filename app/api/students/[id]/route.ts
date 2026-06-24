import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken, verifyToken } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  const { name, email } = await req.json()
  const student = await prisma.student.update({ where: { id: params.id }, data: { name, email } })
  return NextResponse.json(student)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  await prisma.student.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}