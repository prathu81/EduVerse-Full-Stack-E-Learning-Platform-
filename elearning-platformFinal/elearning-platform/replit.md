# Workspace

## Overview

E-Learning Platform — Full-stack web application with Student and Admin roles, 120+ courses, live classes, quizzes, certificates, and more.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/elearning), Tailwind CSS, shadcn/ui
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Auth**: Session-based (express-session)
- **Build**: esbuild (CJS bundle)

## Default Accounts

- **Admin**: admin@elearning.com / admin123
- **Student**: student@elearning.com / student123

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (auth, courses, quizzes, liveclasses, etc.)
│   └── elearning/          # React + Vite frontend
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # Database seeder (120 courses, users, quizzes, etc.)
```

## Features

### Student Side
- Registration with all required fields (photo upload, parent phone, course selection)
- Login and session management
- Home page with 120+ courses, search, and category filtering
- Course detail with syllabus, price, instructor, and enroll button
- Student dashboard: enrolled courses with progress bars, live classes, notifications
- Live class joining with attendance tracking (auto-marks on join)
- Quiz/test system with immediate score display
- Certificate generation and download
- Chatbot-style messaging for teacher communication
- Notifications panel

### Admin Side
- Admin registration and login
- Dashboard with stats (students, courses, enrollments, upcoming classes)
- Student management table
- Course management (create, edit, delete with image URLs)
- Live class scheduling (Zoom link + date/time)
- Quiz creation with questions, options, correct answers, and marks
- Quiz results viewer for all students
- Attendance tracking table
- Certificate generation

## Database Schema

- `users` - students and admins
- `courses` - 120 seeded courses across 10 categories
- `enrollments` - student course enrollments with progress
- `course_materials` - videos and PDFs per course
- `live_classes` - scheduled Zoom classes with status
- `attendance` - records when students join live classes
- `quizzes` + `quiz_questions` + `quiz_results` - quiz system
- `certificates` - generated completion certificates
- `notifications` - user notifications
- `chat_messages` - chatbot/messaging system

## Key Routes

- `GET /api/courses` - list courses (search, category, pagination)
- `POST /api/auth/login` - login
- `POST /api/auth/register/student` - student registration
- `POST /api/auth/register/admin` - admin registration
- `GET /api/students/dashboard` - student dashboard
- `GET /api/admin/dashboard` - admin dashboard
- `POST /api/liveclasses/:id/join` - join live class (records attendance)
- `POST /api/quizzes/:id/submit` - submit quiz answers
- `POST /api/certificates/generate/:enrollmentId` - generate certificate
