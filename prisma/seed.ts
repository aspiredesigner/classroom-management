import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@school.edu.tw' },
    update: {},
    create: { name: '王小明', email: 'teacher@school.edu.tw', passwordHash },
  })

  const cls = await prisma.class.upsert({
    where: { id: 'class-101' },
    update: {},
    create: { id: 'class-101', name: '101 班', description: '一年級甲班', teacherId: teacher.id },
  })

  const students = [
    { studentId: 'S001', name: '林小華', email: 's001@school.edu.tw', classId: cls.id },
    { studentId: 'S002', name: '陳小美', email: 's002@school.edu.tw', classId: cls.id },
    { studentId: 'S003', name: '張小強', email: 's003@school.edu.tw', classId: cls.id },
  ]

  for (const s of students) {
    await prisma.student.upsert({
      where: { studentId: s.studentId },
      update: {},
      create: s,
    })
  }

  console.log('Seed complete')
  console.log('Teacher: teacher@school.edu.tw / password123')
}

main().catch(console.error).finally(() => prisma.$disconnect())