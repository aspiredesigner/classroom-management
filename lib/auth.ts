import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export function getToken(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret123') as {
      id: string; email: string; role: string
    }
  } catch {
    return null
  }
}

export function signToken(payload: { id: string; email: string; role: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret123')
}