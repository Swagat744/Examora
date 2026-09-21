# Examora — Online Examination Platform

Semester 5 Full Stack project, built incrementally.

- **Practical 1** — Responsive/interactive UI (React + Vite + Tailwind CSS)
- **Practical 2** — React Hooks (useState, useEffect, useContext, custom hook)
- **Practical 3** — Complex state management (Redux Toolkit)
- **Practical 4** — REST API + Node.js + Express.js + MongoDB + Mongoose
- **Platform upgrade** — Real authentication (email/password + Google), protected routes, working dashboard navigation, backend-graded exam results
- **Practical 5** — Secure REST APIs (Helmet, rate limiting, CORS hardening, input validation, mass-assignment protection) ← current

## Project structure

```
examora/
├── frontend/   React + Vite + Tailwind + Redux Toolkit
└── backend/    Node.js + Express + Mongoose REST API
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string
- A Firebase project with Google Sign-In enabled (only needed for "Continue with Google" — email/password auth works without it)

## 1. Start MongoDB

```
mongod
```
(or use a free MongoDB Atlas cluster and put its connection string in `backend/.env`)

## 2. Configure the backend

`backend/.env` (already present with working defaults for everything except Google sign-in):

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/examora
CLIENT_ORIGIN=http://localhost:5173

JWT_SECRET=<already set to a random value — change it if you want>
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com

# Rate limiting (Practical 5 — optional overrides; defaults shown)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=20
```

Email/password signup and login work immediately with no further setup. **Google sign-in requires `GOOGLE_CLIENT_ID`** — see step 4.

## 3. Start the backend

```
cd backend
npm install
npm run seed   # populates Exams + Questions with sample data
npm run dev    # starts the API on http://localhost:5000
```

You should see:
```
MongoDB connected
Examora API running on port 5000
```

## 4. Set up Google Sign-In (optional — skip if you only need email/password)

"Continue with Google" uses Firebase only to drive the Google popup. The ID token it returns is independently re-verified by the backend (`google-auth-library`) and exchanged for our own JWT — Firebase is not Examora's session system, just the mechanism for the popup.

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication → Sign-in method → Google → Enable.**
3. **Project Settings → General → Your apps → Add app (Web)** — copy the config values into `frontend/.env` (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`).
4. Still in **Authentication → Sign-in method → Google**, expand the Web SDK configuration and copy the **Web client ID** — put that same value in `backend/.env` as `GOOGLE_CLIENT_ID`.
5. Restart both servers.

Without this, the "Continue with Google" button will fail with a clear error — email/password auth is unaffected.

## 5. Start the frontend

```
cd frontend
npm install
npm run dev    # http://localhost:5173
```

## What's real vs. still mock

**Real, backend-backed:**
- Signup, login, Google login, session persistence across refresh, logout
- Student Dashboard's exam list, Admin Dashboard's exam-count stats
- Exam questions during an attempt (fetched from the database, correct answers never sent to the browser)
- Exam scoring (calculated server-side from the real answer key — the frontend only ever sends the student's picks)
- Results history (a student can only ever see their own)
- Profile (real name/email/role/join date; name and photo are editable)

**Still mock (explicitly out of scope for this pass):**
- Admin Dashboard's "Active Exams" attempt counts and "Recent Activity" feed (no backend model for these yet)
- Creating/editing exams and questions from the UI (the REST endpoints exist and are protected, but there's no admin form built for them yet — use Postman, or promote a user's `role` directly in MongoDB to `teacher`/`admin` to test the protected write endpoints)

## Security notes

- Passwords are hashed with bcrypt; the hash is never sent to the frontend (`select: false` + `toSafeJSON()`).
- JWT is stored in `localStorage` and sent as `Authorization: Bearer <token>`. This is simpler than httpOnly cookies but more exposed to XSS — a reasonable tradeoff for this project's scope, worth upgrading to httpOnly cookies before any real deployment.
- Every protected backend route re-verifies the token itself — hiding a nav link on the frontend was never treated as "protection" on its own.
- Scoring, "who am I", and "which results are mine" are always computed from the verified token server-side, never from anything the frontend sends.
- One attempt per student per exam is enforced by a unique index in MongoDB, not just a frontend check — a double-submit race can't create two records.

See also the detailed **[API Security](#api-security)** section below.

## REST API reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create an account (always role `student`) |
| POST | `/api/auth/login` | — | Email/password login |
| POST | `/api/auth/google` | — | Exchange a Google ID token for an Examora session |
| GET | `/api/auth/me` | required | Current user |
| PUT | `/api/auth/me` | required | Edit name/profile photo |
| GET | `/api/exams` | — | List all exams |
| GET | `/api/exams/:id` | — | Get one exam |
| POST/PUT/DELETE | `/api/exams...` | teacher/admin | Exam CRUD |
| GET | `/api/exams/:examId/questions` | required | Questions for an exam, correct answers stripped |
| POST | `/api/exams/:examId/questions` | teacher/admin | Add a question |
| GET/PUT/DELETE | `/api/questions/:id` | teacher/admin | Single-question ops (includes correct answer) |
| POST | `/api/exams/:examId/attempts` | required | Submit answers; backend grades and stores the result |
| GET | `/api/results` | required | The caller's own results |
| GET | `/api/results/:id` | required | One result (404 if it isn't the caller's) |
| GET | `/api/health` | — | Liveness check |

All responses follow `{ success, data }` or `{ success: false, message }`.

---

## API Security

> Added in Practical 5 — Secure REST APIs

### Secure HTTP Headers (Helmet)

[Helmet](https://helmetjs.github.io/) is applied globally in `server.js`. It sets the following response headers on every request:

| Header | Effect |
|---|---|
| `X-Content-Type-Options: nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options: SAMEORIGIN` | Prevents clickjacking |
| `X-XSS-Protection: 0` | Disables legacy XSS filter (modern approach) |
| `Strict-Transport-Security` | Enforces HTTPS |
| `Referrer-Policy: no-referrer` | Limits referrer leakage |
| `Cross-Origin-Opener-Policy` | Isolates browsing context |

`Content-Security-Policy` is **disabled** — this server returns JSON, not HTML, so CSP has no effect and would add unnecessary complexity. `Cross-Origin-Embedder-Policy` is disabled to allow Firebase Auth popup flows.

### Rate Limiting

Implemented with [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit). Two limiters are applied:

| Limiter | Routes | Default limit |
|---|---|---|
| `generalLimiter` | All `/api/*` routes | 200 req / 15 min per IP |
| `authLimiter` | `/api/auth/register`, `/api/auth/login`, `/api/auth/google` | 20 req / 15 min per IP |

When the limit is exceeded, the API returns:
```json
HTTP 429 Too Many Requests
{ "success": false, "message": "Too many requests — please slow down and try again shortly." }
```

Limits are configurable via environment variables:
- `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` — general limiter
- `AUTH_RATE_LIMIT_WINDOW_MS` / `AUTH_RATE_LIMIT_MAX` — auth limiter

### CORS Configuration

CORS is configured with an explicit allowlist, not `origin: "*"`:

- Allowed origins are set via the `CLIENT_ORIGIN` environment variable (default: `http://localhost:5173`)
- Multiple origins can be specified as a comma-separated list: `CLIENT_ORIGIN=http://localhost:5173,https://examora.example.com`
- `credentials: true` allows the `Authorization: Bearer` header to be sent
- Requests with no `Origin` header (Postman, curl, server-to-server) are permitted
- Explicit `methods` and `allowedHeaders` are specified

### JWT Authentication

- Every protected route verifies the `Authorization: Bearer <token>` header independently on the backend
- Tokens are signed with `JWT_SECRET` (from environment variable) and expire after `JWT_EXPIRES_IN` (default `7d`)
- The user is always re-fetched from the database on each protected request — a deleted user's token is rejected
- Google sign-in tokens are independently re-verified against Google's servers via `google-auth-library` before any user record is created or updated

### Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| `student` | Take exams, view own results, edit own name/photo |
| `teacher` | All student permissions + create/update/delete exams and questions |
| `admin` | Same as teacher |

Role cannot be set by a client — every signup hardcodes `role: 'student'`. Elevation requires direct database modification.

### Input Validation

Two layers of validation protect every write endpoint:

1. **Request-level** (`middleware/validate.js`) — runs before controllers, rejects malformed requests with HTTP 400 immediately:
   - Required field presence
   - Type checking (string, number, array)
   - Email format
   - Password length (≥ 8 chars)
   - Numeric constraints (duration, marks, question count)
   - Allowed enum values (exam status)
   - MongoDB ObjectId format validation (all `:id` / `:examId` parameters)

2. **Schema-level** (Mongoose models) — validates data types, constraints, and relationships at the database layer

### Mass Assignment Protection

All write endpoints explicitly whitelist the fields allowed to reach the database:

- **Exam create/update** — only `title`, `subject`, `description`, `instructions`, `duration`, `totalMarks`, `numberOfQuestions`, `startTime`, `endTime`, `status` are accepted. Internal fields like `_id`, `createdAt`, `updatedAt` are always server-controlled.
- **Question create/update** — only `questionText`, `options`, `correctAnswer`, `marks`, `questionOrder` are accepted. The `exam` reference on creation is always set from the authenticated route parameter, never from the request body.
- **User profile update** — only `name` and `profileImage` can be updated. Role, email, provider, googleId, and passwordHash are never accepted from the client.
- **Registration** — `role` is always hardcoded to `student`, regardless of request body content.

### Server-Side Score Calculation

The frontend is **never trusted** for any scoring information. On exam submission:

1. The backend authenticates the user from the JWT
2. Verifies the exam exists
3. Checks no prior attempt exists (duplicate prevention)
4. Loads all questions from MongoDB (including `correctAnswer`)
5. Validates each submitted answer index against the actual option count
6. Calculates `score`, `percentage`, `correctCount`, `incorrectCount`, `unansweredCount` from the real answer key
7. Stores the server-calculated result
8. Returns the server-generated result to the client

The client submits only `{ answers: { [questionId]: selectedOptionIndex } }`. Any client-supplied score is ignored.

### Duplicate Submission Prevention

Protected at two levels:
- **Controller check** — rejects with HTTP 400 and a clear message if an attempt already exists
- **Database constraint** — a unique compound index `{ student, exam }` on the Attempt collection means even a race condition (two simultaneous requests) cannot create two records

### Sensitive Data Protection

- `passwordHash` has `select: false` in the User schema — it is never included in query results unless explicitly requested
- `User.toSafeJSON()` is the only shape sent to the frontend — it excludes `passwordHash`, `googleId`, and internal fields
- `Question.toPublicJSON()` strips `correctAnswer` for student-facing responses
- `getResultById` returns HTTP 404 (not 403) if a result belongs to a different user — prevents confirming existence of other users' data
- Stack traces and internal error details are never sent to clients in production (`NODE_ENV=production`)

### Error Handling

All errors return a consistent JSON shape:
```json
{ "success": false, "message": "Meaningful error message" }
```

HTTP status codes used:

| Code | Meaning |
|---|---|
| 200 | Successful GET / update |
| 201 | Successful creation |
| 400 | Invalid request / validation failure |
| 401 | Not authenticated / invalid token |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Duplicate / conflict |
| 413 | Request payload too large |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

### Request Payload Size

`express.json({ limit: '10kb' })` — prevents oversized JSON payloads from reaching controllers. 10 kb is more than sufficient for any legitimate Examora request.

### Environment Variable Security

| Variable | Purpose | Secret? |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No (public) |
| `CLIENT_ORIGIN` | Allowed CORS origin(s) | No |
| `PORT` | Server port | No |
| `JWT_EXPIRES_IN` | Token lifetime | No |
| `RATE_LIMIT_*` | Rate limit config | No |

`.env` is excluded from Git via `.gitignore`. `.env.example` contains only placeholder values — never real credentials.
