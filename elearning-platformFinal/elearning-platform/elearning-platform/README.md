# 🎓 EduVerse — E-Learning Platform (Final Year Project)

A complete full-stack E-Learning Platform with **Student** and **Admin** roles, modern dark UI, live classes, quizzes, certificates, chatbot, and attendance tracking.

---

## ✨ Features

### 🎓 Student Side
- Register & Login (Email + Password)
- Profile with photo upload
- Browse 100+ courses across 10 categories
- Enroll in courses (free & paid)
- Student Dashboard with progress tracking
- Join Live Zoom/Meet classes
- Automatic attendance on joining class
- Download notes/PDFs
- View video lectures
- Take timed quizzes with instant results
- AI Chatbot for doubt solving
- Generate & download certificates
- Notification panel

### 👨‍💼 Admin Side
- Admin Register & Login
- Admin Dashboard with stats
- Student management (view, search)
- Course management (add, edit, delete)
- Schedule live classes with Zoom links
- Update live class status (Live → Completed)
- Upload recordings → auto-appear as video lectures
- Create quizzes with dynamic question builder
- Upload study notes (PDF)
- Upload video lectures
- Parent SMS notification system
- View quiz results & attendance reports

---

## 🚀 Quick Start (3 Steps)

### Step 1 — Install Dependencies
```bash
cd elearning-platform/backend
npm install
```

### Step 2 — Start Server
```bash
npm start
```

### Step 3 — Open Browser
```
http://localhost:5000
```

> ✅ **Demo Mode**: Works WITHOUT any database. All data is in-memory.

---

## 🔐 Demo Login Credentials

| Role    | Email                | Password    |
|---------|----------------------|-------------|
| Admin   | admin@elearn.com     | Admin@123   |
| Student | student@demo.com     | Student@123 |

---

## 🗄️ MySQL Setup (Optional — for production)

1. Create database:
```sql
CREATE DATABASE elearning_db;
USE elearning_db;
SOURCE database/schema.sql;
```

2. Create `.env` file in `/backend`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=elearning_db
JWT_SECRET=your_super_secret_key_here
```

3. Restart server — it auto-detects MySQL.

---

## 📁 Project Structure

```
elearning-platform/
├── backend/
│   ├── server.js          # Express server + all API routes
│   ├── package.json
│   └── uploads/           # Auto-created (photos, notes, videos)
│
├── database/
│   └── schema.sql         # MySQL schema + 100+ courses seed data
│
└── frontend/
    ├── index.html         # Landing page
    ├── css/
    │   └── main.css       # Complete design system
    ├── js/
    │   └── api.js         # Shared API utility & helpers
    └── pages/
        ├── login.html         # Login (student + admin)
        ├── register.html      # Registration (student + admin)
        ├── courses.html       # Browse all courses with filters
        ├── course-detail.html # Course detail with enroll
        ├── dashboard.html     # Student dashboard
        ├── admin-dashboard.html # Admin dashboard
        └── quiz.html          # Timed quiz with results
```

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | HTML5, CSS3, JavaScript (Vanilla) |
| Backend   | Node.js + Express.js              |
| Database  | MySQL (optional) / Demo Mode      |
| Auth      | JWT (7-day tokens) + bcryptjs     |
| Uploads   | Multer (local file storage)       |
| Fonts     | Plus Jakarta Sans + Space Grotesk |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| POST   | /api/auth/register  | Register user       |
| POST   | /api/auth/login     | Login               |
| GET    | /api/auth/profile   | Get profile         |

### Courses
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| GET    | /api/courses        | List courses        |
| GET    | /api/courses/:id    | Course detail       |
| POST   | /api/courses        | Add course (Admin)  |
| DELETE | /api/courses/:id    | Delete (Admin)      |

### Student
| Method | Endpoint                         | Description          |
|--------|----------------------------------|----------------------|
| POST   | /api/enrollments                 | Enroll in course     |
| GET    | /api/enrollments/my              | My enrollments       |
| POST   | /api/attendance                  | Mark attendance      |
| POST   | /api/messages                    | Chatbot message      |
| POST   | /api/certificates/generate       | Generate certificate |

### Quizzes
| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| GET    | /api/quizzes                    | List quizzes         |
| GET    | /api/quizzes/:id/questions      | Quiz questions       |
| POST   | /api/quizzes/:id/submit         | Submit quiz          |
| POST   | /api/quizzes                    | Create quiz (Admin)  |

### Admin
| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| GET    | /api/admin/stats            | Platform stats         |
| GET    | /api/admin/students         | All students           |
| POST   | /api/admin/send-sms         | Send parent SMS        |
| POST   | /api/live-classes           | Schedule class         |
| PUT    | /api/live-classes/:id/status| Update class status    |

---

## 🎨 Design System

| Variable         | Value     | Usage                |
|------------------|-----------|----------------------|
| --bg             | #030712   | Page background      |
| --bg-card        | #0F172A   | Card background      |
| --primary        | #4F46E5   | Primary indigo       |
| --secondary      | #7C3AED   | Purple accent        |
| --accent         | #06B6D4   | Cyan accent          |
| --success        | #10B981   | Green success        |
| --danger         | #EF4444   | Red error            |

---

## 📱 SMS Integration (Production)

Replace the SMS mock in `server.js` with a real provider:

**Twilio:**
```js
const twilio = require('twilio');
const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
await client.messages.create({ body: message, from: '+1234567890', to: parent_phone });
```

**MSG91 (India):**
```js
// Use MSG91 API with your API key and sender ID
```

---

## 📋 Requirements

- Node.js v16 or higher
- npm v8 or higher
- MySQL 8.0+ (optional)

---

## 👨‍💻 Development

```bash
# Install nodemon for auto-restart
npm install -g nodemon

# Run in development mode
cd backend
npm run dev
```

---

## 📝 License

Built as a Final Year Project for educational purposes.

---

*Built with ❤️ using Node.js, Express, and Vanilla JS*
