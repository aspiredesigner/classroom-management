'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'
import { BookOpen, Users, LogOut } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard')
  }, [user, loading, router])

  if (loading) return <div className="min-h-screen flex items-center justify-center">載入中...</div>
  if (user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-indigo-600 mb-4">教室管理系統</h1>
        <p className="text-gray-600 mb-8">輕鬆管理班級、學生、出席、作業、成績</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
            登入
          </Link>
          <Link href="/register" className="bg-white text-indigo-600 px-6 py-3 rounded-lg border border-indigo-200 hover:bg-indigo-50">
            註冊
          </Link>
        </div>
      </div>
    </div>
  )
}