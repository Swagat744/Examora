<div align="center">

# 📝 Examora

### Secure Online Examination Platform

A full-stack web platform for timed online exams, automatic evaluation, and role-based management — built with **React, Node.js, Express, MongoDB and JWT**.

![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux-Toolkit-764ABC?logo=redux&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-API-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Google%20Sign--In-FFCA28?logo=firebase&logoColor=black)

</div>

---

## 📖 Overview

Examora simplifies the complete online examination workflow for **students, teachers, and administrators**.

It provides secure authentication, exam and question management, timed examinations, automatic **server-side** evaluation, result tracking, role-based access control, and a protected REST API.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Authentication](#-authentication)
- [Role-Based Access Control](#-role-based-access-control)
- [Examination Workflow](#-examination-workflow)
- [REST API](#-rest-api)
- [Security](#-security)
- [API Response Format](#-api-response-format)
- [Environment Variables](#-environment-variables)
- [Academic Implementation](#-academic-implementation)
- [Future Scope](#-future-scope)
- [Project Status](#-project-status)
- [License](#-license)
- [Author](#-author)

---

## ✨ Features

### 🎓 Student

- Secure email/password authentication
- Google Sign-In
- Persistent login sessions
- Browse available examinations
- View exam instructions and details
- Attempt timed examinations
- Navigate between questions
- Submit answers securely
- Automatic server-side evaluation
- View examination results and previous attempts
- Manage profile information

### 👩‍🏫 Teacher / Admin

- Role-based access control
- Create and manage examinations
- Create and manage questions
- Configure examination details
- Manage the examination lifecycle
- Access protected management APIs
- View examination-related statistics

### 🔒 Security

- JWT-based authentication
- Firebase-powered Google Sign-In with backend Google ID token verification
- bcrypt password hashing
- Role-Based Access Control (RBAC)
- Helmet security headers
- API rate limiting
- Strict CORS configuration
- Request validation and MongoDB ObjectId validation
- Mass-assignment protection
- Server-side score calculation
- Duplicate attempt prevention
- Sensitive data filtering
- Environment-variable based configuration

---

## 🛠 Tech Stack

| Layer | Technologies |
| ----- | ------------ |
| **Frontend** | React, Vite, Tailwind CSS, Redux Toolkit, React Router, Firebase Authentication |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JSON Web Tokens (JWT), bcrypt, Helmet, express-rate-limit, google-auth-library |
| **Dev & Testing** | Git & GitHub, Postman, MongoDB Atlas, Firebase Console |

---

## 🏗 System Architecture

```text
┌─────────────────────────────────┐
│            Frontend             │
│                                 │
│  React + Vite + Tailwind CSS    │
│  Redux Toolkit + React Router   │
└────────────────┬────────────────┘
                 │
                 │  REST API / JSON
                 ▼
┌─────────────────────────────────┐
│             Backend             │
│                                 │
│  Node.js + Express.js           │
│  JWT Authentication + RBAC      │
│  Validation + Security          │
└────────────────┬────────────────┘
                 │
                 │  Mongoose
                 ▼
┌─────────────────────────────────┐
│          MongoDB Atlas          │
│                                 │
│  Users                          │
│  Exams                          │
│  Questions                      │
│  Attempts / Results             │
└─────────────────────────────────┘

        ┌──────────────────┐
        │  Firebase Auth   │
        │  Google Sign-In  │
        └──────────────────┘
```

---

## 📁 Project Structure

```text
Examora/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   ├── seed.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas account (or a local MongoDB instance)
- A Firebase project
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Swagat744/Examora.git
cd Examora
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

CLIENT_ORIGIN=http://localhost:5173

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200

AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=20
```

> ⚠️ Never commit `.env` files or real credentials to GitHub.

### 3. Configure MongoDB

Examora works with both local MongoDB and MongoDB Atlas. For Atlas, use your connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/examora
```

Make sure your Atlas database user and network access rules are configured correctly.

### 4. Configure Firebase Google Sign-In

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Open **Authentication** and enable **Google** as a sign-in provider.
3. Register a **Web application** in the project.
4. Copy the Firebase configuration values.
5. Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

The Google ID token obtained from Firebase is verified by the backend before an Examora JWT session is created.

### 5. Start the backend

From the `backend` directory:

```bash
npm run seed   # seed the database
npm run dev    # start the API server
```

The API runs at `http://localhost:5000`. Health check: `GET /api/health`

### 6. Start the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app is normally available at `http://localhost:5173`.

### Available scripts

| Location | Command | Purpose |
| -------- | ------- | ------- |
| `backend/` | `npm run seed` | Seed the database |
| `backend/` | `npm run dev` | Run the API in development mode |
| `frontend/` | `npm run dev` | Run the Vite development server |

---

## 🔐 Authentication

Examora supports two authentication methods.

### Email & Password

```text
Register
   ↓
Password hashing with bcrypt
   ↓
User stored in MongoDB
   ↓
Login
   ↓
JWT issued
   ↓
Protected API requests
```

### Google Sign-In

```text
Google Sign-In
      ↓
Firebase Authentication
      ↓
Google ID Token
      ↓
Backend Verification
      ↓
User Lookup / Creation
      ↓
Examora JWT
      ↓
Authenticated Session
```

Firebase handles the Google authentication flow only. Examora uses its **own backend-issued JWT** for application sessions.

---

## 👥 Role-Based Access Control

| Role | Access |
| ---- | ------ |
| **Student** | Take exams, view personal results, manage profile |
| **Teacher** | Student capabilities + exam/question management |
| **Admin** | Administrative exam/question management |

Authorization is enforced on the backend. Frontend navigation controls are not treated as security boundaries.

---

## 🧭 Examination Workflow

```text
User Login
    ↓
Browse Exams
    ↓
Select Examination
    ↓
Read Instructions
    ↓
Start Examination
    ↓
Answer Questions
    ↓
Submit Examination
    ↓
Backend Validation
    ↓
Server-Side Evaluation
    ↓
Result Stored in MongoDB
    ↓
Result Displayed to Student
```

The client submits **only the selected answers**. The backend fetches the real answer key from MongoDB and calculates:

- Score
- Percentage
- Correct answers
- Incorrect answers
- Unanswered questions

This prevents the frontend from determining its own score.

---

## 📡 REST API

### Authentication

| Method | Endpoint | Access | Description |
| ------ | -------- | ------ | ----------- |
| POST | `/api/auth/register` | Public | Register a student |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/google` | Public | Google authentication |
| GET | `/api/auth/me` | Authenticated | Get current user |
| PUT | `/api/auth/me` | Authenticated | Update profile |

### Exams

| Method | Endpoint | Access | Description |
| ------ | -------- | ------ | ----------- |
| GET | `/api/exams` | Public | List examinations |
| GET | `/api/exams/:id` | Public | Get examination details |
| POST | `/api/exams` | Teacher / Admin | Create examination |
| PUT | `/api/exams/:id` | Teacher / Admin | Update examination |
| DELETE | `/api/exams/:id` | Teacher / Admin | Delete examination |

### Questions

| Method | Endpoint | Access | Description |
| ------ | -------- | ------ | ----------- |
| GET | `/api/exams/:examId/questions` | Authenticated | Get exam questions |
| POST | `/api/exams/:examId/questions` | Teacher / Admin | Create question |
| GET | `/api/questions/:id` | Teacher / Admin | Get question |
| PUT | `/api/questions/:id` | Teacher / Admin | Update question |
| DELETE | `/api/questions/:id` | Teacher / Admin | Delete question |

### Attempts & Results

| Method | Endpoint | Access | Description |
| ------ | -------- | ------ | ----------- |
| POST | `/api/exams/:examId/attempts` | Authenticated | Submit examination |
| GET | `/api/results` | Authenticated | Get own results |
| GET | `/api/results/:id` | Authenticated | Get a specific result |

### Health

| Method | Endpoint | Access | Description |
| ------ | -------- | ------ | ----------- |
| GET | `/api/health` | Public | Verify the API server is running |

---

## 🛡 Security

Security is applied at multiple layers.

**HTTP security** — Helmet applies security-related HTTP headers.

**Rate limiting** — two layers, configurable through environment variables:

| Scope | Default limit |
| ----- | ------------- |
| General API | 200 requests / 15 minutes / IP |
| Authentication | 20 requests / 15 minutes / IP |

**CORS** — the API uses an explicit origin allowlist instead of allowing all origins.

**Input validation** — requests are validated before reaching controllers:

- Required fields and data types
- Email format and password length
- Numeric constraints and enum values
- MongoDB ObjectId format

**Mass-assignment protection** — only explicitly permitted fields can be written to the database. For example, a student cannot modify their own `role`, `email`, `passwordHash`, `googleId` or `provider`.

**Sensitive data protection** — password hashes and internal authentication fields are excluded from normal API responses, and correct answers are removed from student-facing question responses.

**Duplicate attempt protection** — exam attempts are guarded by both a controller-level duplicate check and a MongoDB unique compound index, protecting against duplicate submissions and race conditions.

---

## 📦 API Response Format

Successful response:

```json
{
  "success": true,
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Meaningful error message"
}
```

| Status | Meaning |
| ------ | ------- |
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid request |
| 401 | Authentication required |
| 403 | Access denied |
| 404 | Resource not found |
| 409 | Conflict |
| 413 | Payload too large |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

## ⚙️ Environment Variables

**Backend (`backend/.env`)**

| Variable | Purpose |
| -------- | ------- |
| `PORT` | Backend port |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_ORIGIN` | Allowed frontend origin (CORS) |
| `JWT_SECRET` | JWT signing key |
| `JWT_EXPIRES_IN` | JWT expiration |
| `GOOGLE_CLIENT_ID` | Google ID token verification |
| `RATE_LIMIT_WINDOW_MS` | General rate-limit window |
| `RATE_LIMIT_MAX` | General request limit |
| `AUTH_RATE_LIMIT_WINDOW_MS` | Authentication rate-limit window |
| `AUTH_RATE_LIMIT_MAX` | Authentication request limit |

**Frontend (`frontend/.env`)**

| Variable | Purpose |
| -------- | ------- |
| `VITE_API_URL` | Backend API base URL |
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

Sensitive values must always stay in environment variables.

---

## 🎓 Academic Implementation

Examora was developed incrementally as a **Semester 5 Full Stack Development** project.

| Practical | Implementation | Status |
| --------- | -------------- | ------ |
| 1 | Responsive UI with React, Vite & Tailwind CSS | ✅ Done |
| 2 | React Hooks and custom hooks | ✅ Done |
| 3 | Redux Toolkit state management | ✅ Done |
| 4 | REST API with Node.js, Express, MongoDB & Mongoose | ✅ Done |
| 5 | Secure REST APIs | ✅ Done |
| 6 | JWT Authentication & Role-Based Access Control | ✅ Done |
| 7 | API testing with Postman | ✅ Done |
| 8 | WebSocket integration | 🚧 Planned |
| 9 | CI/CD deployment | 🚧 Planned |
| 10 | Docker & DevOps | 🚧 Planned |

---

## 🔭 Future Scope

- Real-time examination updates using WebSockets
- Advanced performance analytics
- Automated CI/CD pipelines
- Docker containerization
- Cloud deployment
- Enhanced examination monitoring
- Email notifications
- Question bank categorization
- Advanced teacher analytics
- Improved examination scheduling
- Detailed administrative reporting

---

## 📌 Project Status

Examora is an **actively developed academic full-stack project**. The current implementation focuses on:

- Full-stack architecture
- Authentication and authorization
- Examination workflow
- REST APIs and MongoDB integration
- Server-side evaluation
- API security and role-based access control

Additional platform capabilities will be added incrementally as development continues.

---

## 📄 License

This project was developed for educational and academic purposes.

---

## 👤 Author

**Swagat Patil**
B.Tech Information Technology — VESIT, Mumbai

GitHub: [@Swagat744](https://github.com/Swagat744)
