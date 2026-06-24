'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, api } from '@/components/AuthContext'
import {
  Users, FileText, ClipboardList, BarChart2, Megaphone,
  Plus, Clock, BookOpen, BarChart
} from 'lucide-react'

const TABS = [
  { key: 'students', label: '學生', icon: Users },
  { key: 'assignments', label: '作業', icon: FileText },
  { key: 'attendance', label: '出席', icon: ClipboardList },
  { key: 'grades', label: '成績', icon: BarChart2 },
  { key: 'announcements', label: '公告', icon: Megaphone },
]

interface ClassData {
  id: string
  name: string
  teacher?: { name: string }
  students: Array<{ id: string; studentId: string; name: string; email?: string }>
  assignments: Array<{ id: string; title: string; description?: string; dueDate: string; _count?: { submissions: number } }>
  grades: Array<{ id: string; examName: string; score: number; student?: { name: string } }>
  announcements: Array<{ id: string; title: string; content: string; teacher?: { name: string }; createdAt: string }>
}

export default function ClassDetail() {
  const params = useParams()
  const router = useRouter()
  const [cls, setCls] = useState<ClassData | null>(null)
  const [tab, setTab] = useState('students')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return
    loadClass()
  }, [params.id])

  const loadClass = async () => {
    setLoading(true)
    const res = await api(`/api/classes/${params.id}`)
    if (res.ok) setCls(await res.json())
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">載入中...</div>
  if (!cls) return <div className="min-h-screen flex items-center justify-center">找不到班級</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-800">← 返回</Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-indigo-600">{cls.name}</h1>
            <p className="text-sm text-gray-500">{cls.teacher?.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                tab === t.key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'students' && <StudentsTab cls={cls} onUpdate={loadClass} />}
        {tab === 'assignments' && <AssignmentsTab cls={cls} onUpdate={loadClass} />}
        {tab === 'attendance' && <AttendanceTab cls={cls} onUpdate={loadClass} />}
        {tab === 'grades' && <GradesTab cls={cls} onUpdate={loadClass} />}
        {tab === 'announcements' && <AnnouncementsTab cls={cls} onUpdate={loadClass} />}
      </main>
    </div>
  )
}

function StudentsTab({ cls, onUpdate }: { cls: ClassData; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ studentId: '', name: '', email: '' })

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await api('/api/students', {
      method: 'POST',
      body: JSON.stringify({ ...form, classId: cls.id }),
    })
    if (res.ok) {
      setForm({ studentId: '', name: '', email: '' })
      setShowForm(false)
      onUpdate()
    } else {
      const data = await res.json()
      alert(data.error)
    }
  }

  const deleteStudent = async (sid: string) => {
    if (!confirm('確定刪除？')) return
    await api(`/api/students/${sid}`, { method: 'DELETE' })
    onUpdate()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">學生列表 ({cls.students?.length || 0})</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm">
          <Plus size={14} /> 新增學生
        </button>
      </div>
      {showForm && (
        <form onSubmit={addStudent} className="bg-white p-4 rounded-xl shadow mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="學號" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} className="px-3 py-2 border rounded-lg" required />
            <input placeholder="姓名" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border rounded-lg" required />
            <input placeholder="Email（選填）" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="px-3 py-2 border rounded-lg" />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">儲存</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">取消</button>
          </div>
        </form>
      )}
      {cls.students.length === 0 ? (
        <div className="text-center py-8 text-gray-400"><Users size={32} className="mx-auto mb-2" />尚無學生</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">學號</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">姓名</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Email</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cls.students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{s.studentId}</td>
                  <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.email || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteStudent(s.id)} className="text-gray-400 hover:text-red-500 text-sm">刪除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function AssignmentsTab({ cls, onUpdate }: { cls: ClassData; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' })

  const addAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await api('/api/assignments', {
      method: 'POST',
      body: JSON.stringify({ ...form, classId: cls.id }),
    })
    if (res.ok) {
      setForm({ title: '', description: '', dueDate: '' })
      setShowForm(false)
      onUpdate()
    }
  }

  const deleteAssignment = async (aid: string) => {
    if (!confirm('確定刪除？')) return
    await api(`/api/assignments/${aid}`, { method: 'DELETE' })
    onUpdate()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">作業列表</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm">
          <Plus size={14} /> 新增作業
        </button>
      </div>
      {showForm && (
        <form onSubmit={addAssignment} className="bg-white p-4 rounded-xl shadow mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="標題" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="px-3 py-2 border rounded-lg" required />
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="px-3 py-2 border rounded-lg" required />
          </div>
          <textarea placeholder="說明（選填）" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full mt-3 px-3 py-2 border rounded-lg" rows={3} />
          <div className="mt-3 flex gap-2">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">儲存</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">取消</button>
          </div>
        </form>
      )}
      {cls.assignments.length === 0 ? (
        <div className="text-center py-8 text-gray-400"><FileText size={32} className="mx-auto mb-2" />尚無作業</div>
      ) : (
        <div className="space-y-3">
          {cls.assignments.map(a => (
            <div key={a.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-start">
              <div>
                <h4 className="font-medium">{a.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{a.description}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock size={12} /> 截止：{new Date(a.dueDate).toLocaleDateString('zh-TW')}</p>
                <p className="text-xs text-gray-400">繳交：{a._count?.submissions || 0} / {cls.students.length || 0}</p>
              </div>
              <button onClick={() => deleteAssignment(a.id)} className="text-gray-400 hover:text-red-500">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AttendanceTab({ cls, onUpdate }: { cls: ClassData; onUpdate: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [records, setRecords] = useState<Array<{ studentId: string; status: string }>>([])

  useEffect(() => { loadAttendance() }, [date])

  const loadAttendance = async () => {
    const res = await api(`/api/attendance?classId=${cls.id}&date=${date}`)
    if (res.ok) {
      const data = await res.json()
      setRecords(data.map((r: { studentId: string; status: string }) => ({ studentId: r.studentId, status: r.status })))
    }
  }

  const saveAttendance = async (studentId: string, status: string) => {
    const res = await api('/api/attendance', {
      method: 'POST',
      body: JSON.stringify({ classId: cls.id, studentId, date, status }),
    })
    if (res.ok) loadAttendance()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">出席記錄</h3>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 border rounded-lg" />
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">學號</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">姓名</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">出席</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">遲到</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">缺席</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">請假</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cls.students.map(s => {
              const rec = records.find(r => r.studentId === s.id)
              const status = rec?.status || 'present'
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{s.studentId}</td>
                  <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                  {(['present', 'late', 'absent', 'leave'] as const).map(st => (
                    <td key={st} className="text-center px-4 py-3">
                      <button
                        onClick={() => saveAttendance(s.id, st)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition ${
                          status === st
                            ? st === 'present' ? 'bg-green-100 text-green-600'
                              : st === 'late' ? 'bg-yellow-100 text-yellow-600'
                              : st === 'absent' ? 'bg-red-100 text-red-600'
                              : 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {st === 'present' ? '✓' : st === 'late' ? '遲' : st === 'absent' ? '✕' : '假'}
                      </button>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GradesTab({ cls, onUpdate }: { cls: ClassData; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ studentId: '', examName: '', score: '' })

  const addGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await api('/api/grades', {
      method: 'POST',
      body: JSON.stringify({ ...form, classId: cls.id, score: parseFloat(form.score) }),
    })
    if (res.ok) {
      setForm({ studentId: '', examName: '', score: '' })
      setShowForm(false)
      onUpdate()
    }
  }

  const deleteGrade = async (gid: string) => {
    await api(`/api/grades/${gid}`, { method: 'DELETE' })
    onUpdate()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">成績記錄</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm">
          <Plus size={14} /> 新增成績
        </button>
      </div>
      {showForm && (
        <form onSubmit={addGrade} className="bg-white p-4 rounded-xl shadow mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} className="px-3 py-2 border rounded-lg" required>
              <option value="">選擇學生</option>
              {cls.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input placeholder="考試名稱" value={form.examName} onChange={e => setForm({ ...form, examName: e.target.value })} className="px-3 py-2 border rounded-lg" required />
            <input type="number" step="0.01" placeholder="分數" value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} className="px-3 py-2 border rounded-lg" required />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">儲存</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">取消</button>
          </div>
        </form>
      )}
      {cls.grades.length === 0 ? (
        <div className="text-center py-8 text-gray-400"><BarChart size={32} className="mx-auto mb-2" />尚無成績記錄</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">學生</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">考試</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">分數</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cls.grades.map(g => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{g.student?.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{g.examName}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{g.score}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteGrade(g.id)} className="text-gray-400 hover:text-red-500 text-sm">刪除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function AnnouncementsTab({ cls, onUpdate }: { cls: ClassData; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })

  const addAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await api('/api/announcements', {
      method: 'POST',
      body: JSON.stringify({ ...form, classId: cls.id }),
    })
    if (res.ok) {
      setForm({ title: '', content: '' })
      setShowForm(false)
      onUpdate()
    }
  }

  const deleteAnnouncement = async (aid: string) => {
    if (!confirm('確定刪除？')) return
    await api(`/api/announcements/${aid}`, { method: 'DELETE' })
    onUpdate()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">公告</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm">
          <Plus size={14} /> 發布公告
        </button>
      </div>
      {showForm && (
        <form onSubmit={addAnnouncement} className="bg-white p-4 rounded-xl shadow mb-4">
          <input placeholder="標題" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg mb-3" required />
          <textarea placeholder="內容" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={4} required />
          <div className="mt-3 flex gap-2">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">發布</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">取消</button>
          </div>
        </form>
      )}
      {cls.announcements.length === 0 ? (
        <div className="text-center py-8 text-gray-400"><Megaphone size={32} className="mx-auto mb-2" />尚無公告</div>
      ) : (
        <div className="space-y-3">
          {cls.announcements.map(a => (
            <div key={a.id} className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{a.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{a.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{a.teacher?.name} · {new Date(a.createdAt).toLocaleDateString('zh-TW')}</p>
                </div>
                <button onClick={() => deleteAnnouncement(a.id)} className="text-gray-400 hover:text-red-500">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}