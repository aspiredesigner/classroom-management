import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken, verifyToken } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { sid: string } }) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  const { grade, feedback } = await req.json()
  const submission = await prisma.submission.update({
    where: { id: params.sid },
    data: { grade, feedback },
  })
  return NextResponse.json(submission)
}