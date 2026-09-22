# Career Flow — AI-Powered Career Management & Job Search Platform

**Career Flow** is a full-stack, enterprise-grade AI career copilot and job-search management platform. It assists software engineers and technology professionals through every milestone of the career lifecycle: candidate profile, categorized skills tracking, job discovery, transparent deterministic skill matching, Kanban application pipeline tracking, interview scheduling, AI mock interview simulations with scoring, resume ATS optimization, skill gap analysis, multi-stage career roadmaps, email scam detection, and telemetry analytics.

---

## Key Architecture & Features

1. **Deterministic & AI Job Matching**: Transparent mathematical skill overlap calculation (`matchPercentage`, `matchedSkills`, `missingSkills`) combined with deep AI job fit analysis.
2. **Kanban Application Tracking**: 6-stage lifecycle tracking (`Saved`, `Applied`, `Screening`, `Interview`, `Offer`, `Rejected`) with action dates and activity notes.
3. **AI Interview Prep & Interactive Mock Interviews**: Technical architecture, behavioral STAR method questions, and real-time response evaluation with 1-100 scoring and actionable critiques.
4. **ATS Resume Optimization & Role Targeting**: Instant 100-point ATS scan analyzing sections, action verbs, quantifiable metrics, and tech keywords, plus direct resume-to-job comparison.
5. **Skill Gap Analysis**: Compares candidate competencies against industry standards across top roles with priority learning modules.
6. **Email Guardian & Scam Shield**: Scans recruiter communications for malicious signals, upfront fees, phishing domains, and extracts meeting dates.
7. **Resilient Backend AI Proxy**: Resilient proxy connecting to OpenAI with an intelligent fallback heuristic engine so the platform never crashes even without an API key.
8. **Modern Design System**: Dark and Light themes, fluid responsive layouts from 4K down to 375px mobile screens.

---

## Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Lucide Icons, Custom CSS Design System with theme variables.
- **Backend**: Node.js (ES Modules), Express.js, Mongoose (MongoDB), JSON Web Tokens (JWT), `bcryptjs`, CORS, Rate Limiting.
- **Database**: MongoDB (Local `mongodb://127.0.0.1:27017/career_flow` or Atlas `mongodb+srv://...`).

---

## Directory Structure

```
career_flow/
├── backend/
│   ├── config/              # DB connection and app constants
│   ├── controllers/         # Centralized endpoint handlers
│   ├── middleware/          # JWT auth guard and error handlers
│   ├── models/              # Mongoose schemas (User, Job, Application, Interview, Resume, Notification)
│   ├── routes/              # Express API routers
│   ├── services/            # Matching algorithm, ATS scorer, AI proxy & fallbacks
│   ├── seed/                # Idempotent database seeder with 20+ realistic roles
│   ├── server.js            # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Common, Layout, AI Drawer, Modal components
│   │   ├── context/         # Auth, Theme, and Notification providers
│   │   ├── pages/           # All 14 application views
│   │   ├── services/        # Centralized API client
│   │   ├── styles/          # Design system tokens and styles
│   │   ├── App.jsx          # Route declarations
│   │   └── main.jsx         # Root bootstrap
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB community service running on port 27017 or MongoDB Atlas connection string.

### 2. Backend Setup
```bash
cd backend
npm install
```

Create or verify `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/career_flow
JWT_SECRET=career_flow_super_secure_jwt_secret_dev_2025
OPENAI_API_KEY=
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```
*(The server connects to MongoDB and automatically seeds 20 realistic jobs and a demo user if the database is fresh).*

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Demo Credentials

For quick evaluation without registering, click the **⚡ 1-Click Demo Login** button on the sign-in page:
- **Email**: `demo@careerflow.ai`
- **Password**: `password123`

---

## API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Purpose | Auth | Request Body |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public | `{ name, email, password, headline, targetRole }` |
| `POST` | `/api/auth/login` | Login user & return JWT token | Public | `{ email, password }` |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Bearer | None |
| `PUT` | `/api/auth/profile` | Update profile, preferences & skills | Bearer | `{ headline, bio, skills, targetRole, ... }` |

### Jobs & Matching (`/api/jobs`)
| Method | Endpoint | Purpose | Auth | Request Body / Query |
|---|---|---|---|---|
| `GET` | `/api/jobs` | Search & filter jobs with match % | Optional | `?search=&workMode=&experience=&sortBy=&page=` |
| `GET` | `/api/jobs/:id` | Get single job details & match report | Optional | None |
| `GET` | `/api/jobs/:id/match`| Deterministic skill match calculation | Bearer | None |
| `POST`| `/api/jobs/:id/ai-fit`| AI job fit & interview prep recommendations| Bearer | None |
| `POST`| `/api/jobs/:id/save` | Bookmark / save a job | Bearer | None |
| `DELETE`| `/api/jobs/:id/save` | Remove from saved jobs | Bearer | None |
| `GET` | `/api/jobs/saved` | List all saved jobs | Bearer | None |
| `POST`| `/api/jobs/:id/apply`| Submit application (creates Application record)| Bearer | None |
| `POST`| `/api/jobs/check-scam`| Scan job content for scam/phishing indicators | Bearer | `{ content }` |

### Applications Pipeline (`/api/applications`)
| Method | Endpoint | Purpose | Auth | Request Body |
|---|---|---|---|---|
| `GET` | `/api/applications` | List applications grouped by Kanban stages | Bearer | None |
| `POST` | `/api/applications` | Track application | Bearer | `{ jobId, status, notes, nextAction }` |
| `PUT` | `/api/applications/:id` | Update stage, add notes, or set follow-up | Bearer | `{ status, nextAction, newNote }` |
| `DELETE`| `/api/applications/:id` | Remove application from tracking | Bearer | None |

### Interviews (`/api/interviews`)
| Method | Endpoint | Purpose | Auth | Request Body |
|---|---|---|---|---|
| `GET` | `/api/interviews` | List upcoming and completed interviews | Bearer | None |
| `POST` | `/api/interviews` | Schedule an interview round | Bearer | `{ company, role, date, time, type, locationOrLink }`|
| `PUT` | `/api/interviews/:id` | Update interview details or status | Bearer | `{ status, notes, ... }` |
| `DELETE`| `/api/interviews/:id`| Cancel/delete interview record | Bearer | None |

### ATS Resume Center (`/api/resume`)
| Method | Endpoint | Purpose | Auth | Request Body |
|---|---|---|---|---|
| `GET` | `/api/resume` | Retrieve primary ATS resume & scores | Bearer | None |
| `POST` | `/api/resume` | Save resume text & compute ATS score | Bearer | `{ rawText, title, targetRole }` |
| `POST` | `/api/resume/analyze` | Direct ATS scan without saving | Bearer | `{ rawText, targetRole }` |
| `POST` | `/api/resume/match-job`| Compare resume text against specific job | Bearer | `{ resumeText, jobId }` |

### AI Career Assistant & Interview Prep (`/api/ai`)
| Method | Endpoint | Purpose | Auth | Request Body |
|---|---|---|---|---|
| `POST` | `/api/ai/chat` | Context-aware AI career assistant chat | Bearer | `{ message, conversationHistory }` |
| `POST` | `/api/ai/interview-prep/generate` | Generate Technical, Behavioral, and HR questions | Bearer | `{ company, role, jobDescription }` |
| `POST` | `/api/ai/mock-interview/evaluate` | Grade mock interview candidate response | Bearer | `{ question, userAnswer, role }` |
| `POST` | `/api/ai/career-roadmap` | Generate multi-stage progression roadmap | Bearer | `{ currentRole, targetRole }` |

### Email Guardian (`/api/email-guardian`)
| Method | Endpoint | Purpose | Auth | Request Body |
|---|---|---|---|---|
| `POST` | `/api/email-guardian/analyze` | Detect scam risk, categorize email, extract dates | Bearer | `{ emailText, senderEmail, subject }` |

### Analytics & Notifications
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `GET` | `/api/analytics` | Telemetry, conversion funnel, status distributions | Bearer |
| `GET` | `/api/notifications` | User notifications & unread count | Bearer |
| `PUT` | `/api/notifications/:id/read` | Mark notification as read | Bearer |
| `POST` | `/api/notifications/mark-all-read` | Mark all notifications read | Bearer |
| `GET` | `/api/search?q=` | Global search across jobs, apps, interviews | Bearer |
