import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken, verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  const { studentId, content } = await req.json()
  if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 })
  const submission = await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId: params.id, studentId } },
    create: { assignmentId: params.id, studentId, content },
    update: { content, submittedAt: new Date() },
  })
  return NextResponse.json(submission)
}