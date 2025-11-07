# Cognito Learning Hub - Technical Dossier

> Architected, designed, coded, and deployed end-to-end. **Made with team OPTIMISTIC MUTANT CODERS**.

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Role Matrix and Capabilities](#2-role-matrix-and-capabilities)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Page and Feature Map](#4-page-and-feature-map)
5. [Feature Deep Dive](#5-feature-deep-dive)
6. [Analytics and Reporting](#6-analytics-and-reporting)
7. [AI Services](#7-ai-services)
8. [Backend Architecture](#8-backend-architecture)
9. [Data Models](#9-data-models)
10. [API Catalog](#10-api-catalog)
11. [Security and Compliance](#11-security-and-compliance)
12. [DevOps and Deployment](#12-devops-and-deployment)
13. [Developer Experience](#13-developer-experience)
14. [Observability and Roadmap](#14-observability-and-roadmap)
15. [Credits](#15-credits)

---

## 1. Product Overview

- **Mission**: Deliver an AI-first learning environment where quizzes are effortless to author, engaging to play, and social by design.
- **Audience**: Students seeking personalised practice, teachers needing rapid quiz authoring, moderators safeguarding quality, and admins running platform-wide operations.
- **Tech Pillars**:
  - Frontend: React 18, Vite, Tailwind CSS, Framer Motion, lucide-react.
  - Backend: Express 5, MongoDB (Mongoose 8), JWT auth, Multer uploads.
  - AI: Google Gemini 2.5 Flash for topic/file quiz generation and doubt solving.
  - Export: html2canvas + jsPDF (client) and custom HTML compositor (server).
- **Deployment**: Vercel-hosted SPA (`quizwise-ai.live`) backed by a Render Node service (`quizwise-ai-server.onrender.com`).
- **Source Structure**:
  - `quizwise-ai/`: React application, UI assets, Tailwind config, Vite settings.
  - `quizwise-ai-server/`: Express API, models, middleware, AI integrations.
  - `Steps/`: chronological build/deployment notes. Made with team OPTIMISTIC MUTANT CODERS.

## 2. Role Matrix and Capabilities

| Role      | Core Abilities                                                                                                                                                                                 | Extended Privileges                                                                                                                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Student   | Register/login (email or Google), explore quizzes, attempt quizzes (standard and gamified), view personal dashboard, chat with AI tutor, join social hub, receive notifications, download PDFs | Participate in challenges, track achievements and streaks                                                                                                                                                     |
| Teacher   | Everything a Student can do                                                                                                                                                                    | Access quiz maker studio (topic, file, manual, enhanced flows), manage own quizzes (edit/delete), monitor quiz analytics (times taken, scores), export teacher/student copies, broadcast to class communities |
| Moderator | All Student capabilities                                                                                                                                                                       | Access moderator dashboard, review reported questions, edit/remove any quiz item, monitor community chats, escalate/resolve reports                                                                           |
| Admin     | Superset of every role                                                                                                                                                                         | Manage users and roles, access global analytics dashboards, issue platform-wide broadcasts, configure communities, audit system health                                                                        |

Role enforcement exists on both the client (route guards) and server (middleware) so unauthorised API access is denied even if the UI is bypassed.

## 3. Frontend Architecture

### 3.1 Application Shell

- `App.jsx` composes routing with `react-router-dom`, wraps the UI with `ToastProvider`, and houses the global navigation bar with responsive mobile drawer.
- Theme persisted via `useTheme` hook (localStorage) toggling Tailwind dark mode classes.
- Assets (video hero background, Lottie animations, icons) co-located under `public/` and `src/components` for dynamic imports.

### 3.2 State and Context

- `AuthContext` holds JWT-derived user object, isAuthenticated boolean, and exposes `login/logout` functions.
- Locale persistence (token and theme) via localStorage with expiry checks to prevent stale sessions.
- Components consume context with hooks, reducing prop drilling.

### 3.3 Routing and Protection

- `ProtectedRoute`, `AdminRoute`, `ModeratorRoute` wrap `Outlet` components, redirecting when role requirements are not met.
- Navigation menu adapts to role (links to dashboards, admin broadcast, moderator queue, etc.).

### 3.4 UI Composition

- Tailwind CSS for design system; `tailwind-merge` normalises class combinations.
- Framer Motion orchestrates entrance/hover animations (`fadeInUp`, `staggerContainer`).
- Custom UI primitives (`components/ui/Button`, `Input`, `Card`, `Badge`, `Toast`) standardise styling and behaviour.
- Sound cues triggered in quiz taker for correct/incorrect answers.

## 4. Page and Feature Map

| Route                       | Component(s)                                                                                       | Auth                | Description                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------- |
| `/`                         | `Home` (legacy/new variants)                                                                       | Public              | Landing experience with hero videos, testimonials, feature highlights              |
| `/features`                 | `Features`                                                                                         | Public              | Deep dive into platform capabilities with comparison cards                         |
| `/login`, `/signup`         | `Login`, `SignUp`                                                                                  | Public              | Email/password auth, Google OAuth with post-flow role selection, password feedback |
| `/dashboard`                | `Dashboard`                                                                                        | Protected           | Student-centric analytics, recent achievements, recommended actions, score trends  |
| `/teacher-dashboard`        | `TeacherDashboard*`                                                                                | Protected (Teacher) | Teacher analytics, quiz management, leaderboards, quick creation shortcuts         |
| `/admin`                    | `AdminDashboard*`                                                                                  | Admin               | System metrics, user list with role edit controls, flagged content panels          |
| `/moderator`                | `ModeratorDashboard`                                                                               | Moderator+          | Report queue, quick actions on offending content, approval history                 |
| `/admin-broadcast`          | `AdminBroadcast`                                                                                   | Admin               | Compose audience-filtered announcements with priority + optional scheduling        |
| `/quizzes`                  | `QuizList`                                                                                         | Protected           | Filterable quiz catalog with tags, difficulty, sorting                             |
| `/quiz/:quizId`             | `QuizDisplay`/`QuizTaker`                                                                          | Protected           | Timed quiz flow, progress bar, answer reveal, streak bonuses                       |
| `/quiz/:quizId/gamified`    | `GamifiedQuizTaker`                                                                                | Protected           | Game-mode effects (streak multipliers, animated feedback)                          |
| `/quiz/:quizId/leaderboard` | `Leaderboard`                                                                                      | Protected           | Ranked results, medal visualization, call-to-action for reattempt                  |
| `/quiz-maker/*`             | `QuizMaker`, `TopicQuizGenerator`, `ManualQuizCreator`, `FileQuizGenerator`, `EnhancedQuizCreator` | Teacher+            | Multi-modal quiz authoring flows                                                   |
| `/pdf-quiz-generator`       | `PDFQuizGenerator`                                                                                 | Teacher+            | Request teacher/student/answer key exports                                         |
| `/social`                   | `SocialDashboard`                                                                                  | Protected           | Friends list, incoming requests, challenges, notifications                         |
| `/chat`                     | `ChatSystem`                                                                                       | Protected           | Direct/group messaging UI with read receipts                                       |
| `/create-challenge`         | `ChallengeCreator`                                                                                 | Protected           | Challenge creation wizard (select friend, quiz, message)                           |
| `/achievements`             | `AchievementDashboard`                                                                             | Protected           | Badge timeline, XP progress, rarity filters                                        |
| `/doubt-solver`             | `DoubtSolver`                                                                                      | Protected           | AI tutor chat, context chips, emphasised citations                                 |

## 5. Feature Deep Dive

### 5.1 Quiz Authoring Studio

- **Topic Generator**: Teachers input topic, question count, difficulty. Request hits `/api/generate-quiz-topic`. `extractJson` helper sanitises AI output before persisting `Quiz` document.
- **File Generator**: Uses Multer to store uploaded PDF/TXT, `pdf-parse` to extract text, prompts Gemini for multiple question types.
- **Manual Creator**: React form builder persisting question set to state before submission (`POST /api/quizzes`). Supports hints, explanations, points, time per question.
- **Enhanced Generator**: Combines metadata (learning objectives, tone) with AI prompt for richer sets (`POST /api/quizzes/generate-enhanced`).
- **PDF Export**: Teachers choose format. Backend `QuizPDFGenerator` composes HTML with metadata panels; frontend `pdfExporter` turns it into downloadable PDFs or print dialog.

### 5.2 Quiz Experience

- **Standard Mode**: Question-by-question navigation, time limit enforcement, real-time correctness feedback.
- **Gamified Mode**: Streak bonuses, confetti for perfect answers, audio cues via `sounds/` assets.
- **Reports**: Inline button triggers `POST /api/quizzes/report` storing reason, description, and quiz context for moderators.
- **Leaderboard**: `GET /api/quizzes/:quizId/leaderboard` surfaces top scores with avatars and time taken.

### 5.3 Student Success Toolkit

- Personal dashboard fetches `/api/results/my-results` to populate score history, average score, streak count, and recommended next quiz difficulty.
- Achievement hints highlight upcoming milestones to encourage continued practice.
- Doubt Solver integrates chat history, fallback messaging, and multi-step prompts for deeper explanations.

### 5.4 Teacher Suite

- `/api/quizzes/my-quizzes` aggregates teacher-authored quizzes with derived stats (times taken, average score). Sorting by latest or popularity.
- Quick actions (preview, edit, delete, export) available inline.
- Teacher stats integrate with achievements to boost content creation motivation.

### 5.5 Social Hub & Collaboration

- Friend lifecycle managed through `/api/friends/request`, `/api/friends/respond/:id`, and `GET /api/friends` for roster.
- Challenges recorded with both participants’ outcomes and winner detection. Notifications generated for challenge status changes.
- Chat system supports direct messaging and community rooms. `/api/chat/messages/:friendId` returns conversation history, `/api/chat/send` posts messages, `/api/chat/read/:friendId` updates read receipts.
- Notifications API (`GET /api/notifications`, `PUT /api/notifications/:id/read`) keeps feed in sync with actions.

### 5.6 Moderation & Administration

- Reports dashboard driven by `Report` model: statuses transition from `pending` to `resolved` or `dismissed` with optional `priority` escalation.
- Admin broadcast composer hits `/api/broadcasts/create` with payload (title, content, type, audience roles, optional schedule) and persists to `Broadcast` model.
- Moderator privileges allow editing/removing any quiz via `PUT/DELETE /api/quizzes/:id` irrespective of authorship.

## 6. Analytics and Reporting

- **Student Dashboard**: Recharts line graph for scores over time, difficulty pie chart, streak counters, achievements preview.
- **Teacher Dashboard**: Aggregated metrics (total quizzes, total takes, unique students, average rating). Leaderboard for top-performing quizzes.
- **Admin Dashboard**: Platform KPIs (total users per role, active quizzes, daily attempts, report volume) fed by aggregated Mongo queries.
- **Moderator Dashboard**: Filtered lists (by status, priority), SLA timers, assignment metadata.
- **Achievement Dashboard**: XP bar, level calculation, rarity filters (`common` -> `legendary`), recently unlocked timeline.

## 7. AI Services

- **Gemini 2.5 Flash Integration**:
  - Single `GoogleGenerativeAI` client per server instance (`API_KEY` from `.env`).
  - Prompt engineering emphasises strict JSON structures, enumerated keys, and context injection for documents.
  - Error handling distinguishes between API errors and format violations; fallback messaging returned to client.
- **Doubt Solver**: Accepts question, optional context, and conversation history array to maintain continuity; returns structured paragraphs and bullet lists for readability.
- **AI Safety**: Responses scrubbed for JSON parsing errors, truncated when necessary, and never persisted without validation.

## 8. Backend Architecture

### 8.1 Core Stack

- Express app configured with helmet-like safeguards (CORS, JSON parsing, error logging).
- MongoDB connection via `mongoose.connect` with unified topology and console feedback.
- Server listens on `PORT 3001`, aligning with Render setup.

### 8.2 Middleware

- `auth`: verifies `x-auth-token` header, decodes JWT, injects `req.user` (id, role, name). Handles missing/expired tokens.
- `adminMiddleware`, `moderatorMiddleware`: extend `auth`; respond with 403 when role mismatch detected.
- Multer disk storage persists uploads to `/uploads` with timestamp+random suffix to avoid collisions.

### 8.3 Services & Helpers

- `extractJson` isolates JSON arrays from AI responses even when additional text is present.
- `checkUserAchievements` computes newly unlocked achievements using stored criteria.
- PDF generator composes semantic HTML with metadata cards, question badges, teacher annotations, and print CSS.
- Achievement updater increments XP, handles level thresholds, and ensures no duplicate unlock.

## 9. Data Models

- **User**: Name, email (unique), password (optional when Google ID present), `googleId`, `picture`, role enum (`Student`, `Teacher`, `Moderator`, `Admin`), presence fields (`status`, `lastSeen`, `lastActivity`).
- **Quiz**: Title, description, array of `Question` subdocuments (type, options, correct answer, explanation, difficulty, time limit, points), metadata (category, tags, visibility, total points, attempts, ratings with comments, game settings toggles).
- **Result**: References `user` and `quiz`, raw score, total questions, percentage, pass flag, streak at completion, timing metrics, XP gained, `questionResults` array capturing answer correctness per question.
- **Achievement**: Name, description, icon, type (`quiz_completion`, `score_achievement`, `streak`, `speed`, `category_master`, `special`), criteria (target, category, score, time limit), rarity, points, activation flag.
- **UserAchievement**: Links user to achievement with `unlockedAt`, progress, completion flag.
- **UserStats**: Aggregates totals (quizzes taken/created, points, streaks, average score, total time), experience, level, favourite categories, earned badges.
- **Report**: Quiz reference, question text, reason enum, optional description, reporter, status, resolver, priority, category; indexed by status/createdAt.
- **Friendship**: requester, recipient, status (`pending`, `accepted`, `blocked`), timestamps.
- **Challenge**: challenger, challenged, quiz reference, status, per-user results, winner pointer, expiry.
- **Message**: sender, recipient or chat room, content, type (`text`, `quiz-challenge`, `quiz-result`, `system`), metadata links, read flag.
- **ChatRoom**: name, type (`direct`, `teacher-community`, `study-group`, `broadcast`), participants, admins, creator, settings flags.
- **Notification**: recipient, sender, type enum, title, message, metadata references, read state.
- **Broadcast**: sender (Admin), title, content, type (`announcement`, `maintenance`, `feature-update`, `event`), target audience, priority, scheduling, read receipts.

## 10. API Catalog

### 10.1 Authentication

- `POST /api/auth/register` — Create account (Student/Teacher selection). Hashes password with bcrypt.
- `POST /api/auth/login` — Authenticate, returns JWT with embedded role and profile.
- `POST /api/auth/google` — Verify Google ID token, auto-provision user, issue JWT.
- `POST /api/auth/google/update-role` — Attach chosen role to Google sign-in (requires JWT).

### 10.2 Quiz Management

- `GET /api/quizzes` — Public listing with creator names.
- `GET /api/quizzes/:id` — Fetch quiz details (student view).
- `GET /api/quizzes/my-quizzes` — Teacher-only analytics, sorted via `sortBy` query.
- `POST /api/generate-quiz-topic` — AI topic-based generation (auth).
- `POST /api/quizzes` — Save manual quiz (auth, Teacher+).
- `PUT /api/quizzes/:id` — Update quiz metadata/questions (author or Moderator/Admin).
- `DELETE /api/quizzes/:id` — Remove quiz (author or privileged roles).
- `POST /api/quizzes/enhanced` / `POST /api/quizzes/generate-enhanced` — AI enhanced templates.
- `POST /api/quizzes/:id/submit` — Submit answers, persists `Result` and computes stats.
- `POST /api/quizzes/submit` — Deprecated legacy submission endpoint (still present for compatibility).
- `GET /api/quizzes/:quizId/leaderboard` — Return top results for leaderboard view.
- `POST /api/quizzes/generate-pdf` — Server-side HTML builder for exports.
- `GET /api/quizzes/:id/pdf/:format` — Return HTML for desired format (`teacher`, `student`, `answer-key`).
- `POST /api/quizzes/report` — File report on questionable question; generates moderation task.

### 10.3 Results and Achievements

- `GET /api/results/my-results` — Student dashboard data set.
- `GET /api/achievements/stats` (inside index) — Returns `UserStats`, leaderboard comparisons, and recent achievements.
- `GET /api/achievements/catalog` (where available) — Pre-seeded achievements for client display.

### 10.4 Social and Communication

- `POST /api/friends/request` — Send friend request.
- `PUT /api/friends/respond/:friendshipId` — Accept/decline/block request.
- `GET /api/friends` — List friendships and statuses.
- `POST /api/challenges/create` — Challenge friend to specific quiz with optional message.
- `GET /api/challenges` — Fetch active/past challenges for dashboard display.
- `GET /api/notifications` — Retrieve unread + historical notifications.
- `PUT /api/notifications/:notificationId/read` — Mark notification as read.
- `POST /api/chat/send` — Persist direct/group message (stores metadata for challenge links, etc.).
- `GET /api/chat/messages/:friendId` — Retrieve conversation history.
- `GET /api/chat/rooms` — List available chat rooms (study groups, teacher communities).
- `PUT /api/chat/read/:friendId` — Mark messages as read for the thread.
- `POST /api/broadcasts/create` — Admin send broadcast (audience filters, priority).
- `GET /api/broadcasts` — Fetch relevant broadcasts (role-filtered).

### 10.5 AI & Tutor

- `POST /api/doubt-solver` — Relay student prompt/history to Gemini, returns explanation.
- `POST /api/quizzes/generate-from-file` (defined alongside file route) — Accepts uploaded document, returns quiz JSON.

### 10.6 Administration & Moderation

- `GET /api/reports` (within moderator section) — List reports by status/priority.
- `PUT /api/reports/:id/status` — Resolve or dismiss report (Moderator/Admin).
- `GET /api/admin/users` — Administrative user listing with role data.
- `PUT /api/admin/users/:id/role` — Update user role.

> **Note**: Routes grouped above are representative; see `quizwise-ai-server/index.js` for full list, middleware guards, and response schemas.

## 11. Security and Compliance

- **Authentication**: JWT issuance with expiry, stored client-side; server rejects expired tokens, client purges them proactively.
- **Password Handling**: bcrypt hashing with salt; passwords optional for Google accounts (conditionally enforced in schema).
- **Transport**: Enforced HTTPS via hosting providers; CORS whitelist limits origins.
- **Authorisation**: Role middleware on sensitive routes (quiz mutation, reports, broadcasts, admin actions).
- **Data Validation**: Schema validators (required, enum fields) plus manual checks in controllers.
- **Auditing**: Mongoose timestamps on all models provide modification history; broadcasts capture read receipts.
- **Content Safety**: Report workflow and moderator tools maintain educational integrity.

## 12. DevOps and Deployment

- **Frontend**: Vercel deployment using `vercel.json` rewrites; environment variables supply API base URLs per stage.
- **Backend**: Render Node service with environment-specific `.env`, runs `npm start` targeting `index.js`.
- **Build Pipelines**: Vite production build for SPA; server uses plain Node runtime (no bundler) for faster cold starts.
- **Environment Separation**: `NODE_ENV` toggles CORS lists; `.env` separates secrets from codebase.
- **Static Assets**: Hosted via Vercel CDN (video, images, animations) for low-latency delivery.

## 13. Developer Experience

- **Scripts**: `npm run dev` spins Vite with HMR, `npm run build` produces static assets, `npm run preview` tests production build locally; server uses `npm start`.
- **Tooling**: Tailwind IntelliSense, ESLint defaults via Vite, optional Prettier integration.
- **Documentation**: `Steps/` directory narrates build journey (Tailwind setup, authentication, deployment, dashboards, etc.).
- **Reusable Patterns**: Shared animation utilities, button variants, and layout components maintain consistency while accelerating iteration.
- **PDF Utility**: `lib/pdfExporter.js` exposes high-level methods (`exportAsTeacherCopy`, `printQuiz`) for rapid reuse across pages.

## 14. Observability and Roadmap

- **Current Monitoring**: Console logging on server and client, error toasts for UI failures.
- **Recommended Enhancements**:
  - Introduce Winston/Pino logging with persistent sinks.
  - Add automated tests (Vitest/Jest + React Testing Library, Supertest for APIs).
  - Move chat presence to WebSockets (Socket.IO) for real-time experience.
  - Externalise configuration constants (roles, achievement thresholds) into shared module or config service.
  - Implement rate limiting on AI endpoints to manage usage and costs.
  - Add analytics warehouse integration (e.g., Segment, Mixpanel) for behavioural insights.

## 15. Credits

All product strategy, UX design, frontend development, backend engineering, AI prompt crafting, and deployment automation demonstrating full-stack craftsmanship across the Cognito Learning Hub platform. **Made with team OPTIMISTIC MUTANT CODERS**.
