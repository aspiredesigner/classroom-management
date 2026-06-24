-- 執行這個 SQL 來建立所有表格
-- 位置：Supabase Dashboard → SQL Editor → New query → 貼上執行

-- User (老師)
CREATE TABLE IF NOT EXISTS "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT DEFAULT 'teacher',
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Class (班級)
CREATE TABLE IF NOT EXISTS "Class" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "teacherId" UUID NOT NULL REFERENCES "User"("id"),
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Student (學生)
CREATE TABLE IF NOT EXISTS "Student" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentId" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "classId" UUID NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Attendance (出席)
CREATE TABLE IF NOT EXISTS "Attendance" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentId" UUID NOT NULL REFERENCES "Student"("id") ON DELETE CASCADE,
  "classId" UUID NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "status" TEXT DEFAULT 'present',
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE("studentId", "classId", "date")
);

-- Assignment (作業)
CREATE TABLE IF NOT EXISTS "Assignment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "classId" UUID NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "dueDate" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Submission (繳交)
CREATE TABLE IF NOT EXISTS "Submission" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "assignmentId" UUID NOT NULL REFERENCES "Assignment"("id") ON DELETE CASCADE,
  "studentId" UUID NOT NULL REFERENCES "Student"("id") ON DELETE CASCADE,
  "content" TEXT,
  "submittedAt" TIMESTAMPTZ DEFAULT now(),
  "grade" DOUBLE PRECISION,
  "feedback" TEXT,
  UNIQUE("assignmentId", "studentId")
);

-- Grade (成績)
CREATE TABLE IF NOT EXISTS "Grade" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentId" UUID NOT NULL REFERENCES "Student"("id") ON DELETE CASCADE,
  "classId" UUID NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "examName" TEXT NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "recordedAt" TIMESTAMPTZ DEFAULT now()
);

-- Announcement (公告)
CREATE TABLE IF NOT EXISTS "Announcement" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "classId" UUID NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "teacherId" UUID NOT NULL REFERENCES "User"("id"),
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS "Class_teacherId_idx" ON "Class"("teacherId");
CREATE INDEX IF NOT EXISTS "Student_classId_idx" ON "Student"("classId");
CREATE INDEX IF NOT EXISTS "Attendance_classId_idx" ON "Attendance"("classId");
CREATE INDEX IF NOT EXISTS "Attendance_studentId_idx" ON "Attendance"("studentId");
CREATE INDEX IF NOT EXISTS "Assignment_classId_idx" ON "Assignment"("classId");
CREATE INDEX IF NOT EXISTS "Submission_assignmentId_idx" ON "Submission"("assignmentId");
CREATE INDEX IF NOT EXISTS "Grade_classId_idx" ON "Grade"("classId");
CREATE INDEX IF NOT EXISTS "Grade_studentId_idx" ON "Grade"("studentId");
CREATE INDEX IF NOT EXISTS "Announcement_classId_idx" ON "Announcement"("classId");