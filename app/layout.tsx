import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '教室管理系統',
  description: 'Classroom Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}