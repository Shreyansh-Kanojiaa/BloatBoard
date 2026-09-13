# BloatBoard — Design Document

**Project**: Public leaderboard for ranking the most RAM-hungry desktop apps
**Submission**: GCSRM Technical Track (Web Dev, Year 2) — Option A: Mini Collaborative App
**Category fit**: Voting/poll engine

---

## 1. Problem & Premise

Every developer has opinions about which apps eat the most RAM for what they actually do (looking at you, Electron). BloatBoard turns that into a crowdsourced, votable leaderboard: users submit an app with its typical memory footprint, the community upvotes/downvotes entries, and a live leaderboard ranks the worst offenders.

This maps directly onto GCSRM's "voting/poll engine" example premise, and naturally exercises the bonus features they're scoring for (auth, upvoting, filtering, real-time sync).

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (App Router) | On the approved stack list, fast to scaffold, good defaults for loading/error states |
| Backend/DB | Supabase (Postgres) | Auth + DB + realtime in one service, approved stack |
| Auth | Supabase Auth (GitHub OAuth) | Thematically fits a GitHub club; low integration effort |
| Styling | Tailwind CSS | Fast to make it look polished without hand-rolling CSS |
| Hosting | Vercel | Zero-config Next.js deploys |

---

## 3. Data Model

**`apps`** (a submitted entry)
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text | e.g. "Slack" |
| category | text | enum-like: electron / java / native / browser-tab / other |
| ram_mb | integer | self-reported typical RAM usage |
| description | text, nullable | optional context ("idle, one workspace open") |
| source_url | text, nullable | screenshot or proof link |
| submitted_by | uuid, FK → auth.users | |
| created_at | timestamptz | default now() |

**`votes`**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| app_id | uuid, FK → apps.id | |
| user_id | uuid, FK → auth.users | |
| value | smallint | +1 or -1 |
| created_at | timestamptz | |

Unique constraint on `(app_id, user_id)` — one vote per user per app, upsert to change/retract.

**Derived**: `score = sum(votes.value)` per app — computed via a Postgres view (`app_scores`) or aggregated client-side; a view is cleaner and keeps the leaderboard query simple.

---

## 4. Core Pages/Routes

- `/` — Leaderboard, sorted by score desc. Filter chips for category. Skeleton loading state, empty state ("no apps yet, be the first to snitch on Slack").
- `/submit` — Form to add a new app (name, category, RAM, optional description/source). Client + server-side validation (RAM must be positive int, name required, no dupes without confirmation).
- `/app/[id]` — Single app detail: vote buttons, score, submitter, comments-free for v1.
- `/login` — GitHub OAuth via Supabase.
- `/profile` (optional/bonus) — User's submissions, edit/delete.

---

## 5. Feature Scope

**Base requirements (must-have)**
- Persisted real data (Postgres via Supabase) ✅
- Responsive UI
- Loading skeletons, empty states, network error handling, form validation
- Multi-user interaction (voting is inherently shared state)

**Bonus features to include**
- Auth (GitHub OAuth) — gates voting/submitting, not browsing
- Upvote/downvote, one per user per app (enforced via unique constraint + upsert)
- Filtering by category
- Real-time sync — Supabase Realtime subscription on `votes`/`app_scores`, so scores update live across open tabs without refresh (this is the single most impressive thing to show in a demo video: open two tabs, vote in one, watch the other update)
- Edit/delete own submissions (ownership check: `submitted_by = auth.uid()`)

**Explicitly out of scope for v1**
- Comments/threads
- Verified RAM measurement (self-reported only, clearly labeled as such)
- Admin moderation tooling

---

## 6. Auth & Permissions

- Anyone can view the leaderboard without logging in.
- Voting and submitting require GitHub OAuth login.
- Row Level Security (RLS) policies in Supabase:
  - `apps`: insert requires `auth.uid() = submitted_by`; update/delete requires `auth.uid() = submitted_by`; select is public.
  - `votes`: insert/update requires `auth.uid() = user_id`; select is public (needed for aggregate scores).

---

## 7. Real-Time Flow

1. Client subscribes to Postgres changes on `votes` (or a materialized `app_scores` table) filtered by relevant `app_id`s on the leaderboard page.
2. On vote insert/update, Supabase pushes the change over websocket.
3. Client updates local state (re-sort leaderboard) without a full refetch.

---

## 8. Repo Structure

```
bloatboard/
├── app/
│   ├── page.tsx              # leaderboard
│   ├── submit/page.tsx
│   ├── app/[id]/page.tsx
│   ├── login/page.tsx
│   └── layout.tsx
├── components/
│   ├── LeaderboardTable.tsx
│   ├── VoteButtons.tsx
│   ├── SubmitForm.tsx
│   ├── CategoryFilter.tsx
│   └── Skeletons.tsx
├── lib/
│   ├── supabaseClient.ts
│   └── queries.ts
├── supabase/
│   └── schema.sql            # tables, RLS policies, views
├── README.md
└── package.json
```

---

## 9. Deliverables Checklist

- [ ] Public GitHub repo, modular structure as above
- [ ] README with architecture overview (stack, schema diagram, RLS notes)
- [ ] Live deploy on Vercel
- [ ] Screen recording: submit an app → vote → leaderboard reorders → open second tab, vote, show real-time update in first tab

---

## 10. Rough Timeline

| Day | Task |
|---|---|
| 1 | Supabase project + schema + RLS, Next.js scaffold, GitHub OAuth wired up |
| 2 | Leaderboard page + submit form + validation |
| 3 | Voting logic (upsert, unique constraint), category filter |
| 4 | Real-time subscription, edit/delete own submissions, loading/error/empty states polish |
| 5 | README, deploy, seed with some obvious targets (Slack, Discord, Teams, VS Code, Chrome), record demo video |
