'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, api } from '@/components/AuthContext'
import { Plus, Users, LogOut, BookOpen } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [classes, setClasses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newClass, setNewClass] = useState({ name: '', description: '' })
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push('/login')
    else loadClasses()
  }, [user])

  const loadClasses = async () => {
    const res = await api('/api/classes')
    const data = await res.json()
    setClasses(data)
  }

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await api('/api/classes', {
      method: 'POST',
      body: JSON.stringify(newClass),
    })
    if (res.ok) {
      setNewClass({ name: '', description: '' })
      setShowForm(false)
      loadClasses()
    } else {
      const data = await res.json()
      alert(data.error)
    }
  }

  const deleteClass = async (id: string) => {
    if (!confirm('確定刪除？')) return
    await api(`/api/classes/${id}`, { method: 'DELETE' })
    loadClasses()
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">教室管理系統</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <button onClick={logout} className="text-gray-500 hover:text-red-500">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">我的班級</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus size={18} /> 新增班級
          </button>
        </div>

        {showForm && (
          <form onSubmit={createClass} className="bg-white p-6 rounded-xl shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="班級名稱"
                value={newClass.name}
                onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                required
              />
              <input
                placeholder="說明（選填）"
                value={newClass.description}
                onChange={e => setNewClass({ ...newClass, description: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg">儲存</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">取消</button>
            </div>
          </form>
        )}

        {classes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p>還沒有班級，點擊上方按鈕新增</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls: { id: string; name: string; description?: string; _count?: { students: number } }) => (
              <div key={cls.id} className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-gray-800">{cls.name}</h3>
                  <button onClick={() => deleteClass(cls.id)} className="text-gray-400 hover:text-red-500 text-sm">刪除</button>
                </div>
                {cls.description && <p className="text-gray-500 text-sm mb-3">{cls.description}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><Users size={14} /> {cls._count?.students || 0} 名學生</span>
                </div>
                <Link
                  href={`/classes/${cls.id}`}
                  className="block text-center bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100"
                >
                  進入班級
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}