# Hellware

Project-based engineering and experiential learning platform for students.

## Architecture

- **Frontend**: Next.js 16 (App Router) on Vercel
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Email**: Resend + React Email
- **Payments**: Razorpay
- **Cron**: Vercel Cron Jobs

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/          # All backend API routes
│   │   │   └── ...           # Frontend pages
│   │   ├── lib/
│   │   │   ├── supabase/     # Supabase clients
│   │   │   ├── validations/  # Zod schemas
│   │   │   └── middleware/   # Auth middleware
│   │   └── emails/           # React Email templates
│   └── vercel.json           # Cron job config
│
├── supabase/
│   └── migrations/           # SQL migrations
│
└── webcloner/                # Web cloning tool (separate project)
```

## Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Set Up Supabase

```bash
npm i -g supabase vercel
supabase login
supabase projects create --name hellware --region ap-south-1
supabase link --project-ref <your-project-ref>
supabase db push
```

This creates all 17 tables, RLS policies, storage buckets, and the auth trigger.

### 3. Set Up Environment Variables

Copy `.env.example` to `.env.local` in the `frontend/` directory:

```bash
cp frontend/.env.example frontend/.env.local
```

Fill in the values from your Supabase, Resend, and Razorpay accounts.

### 4. Run Development Server

```bash
cd frontend
npm run dev
```

The app will run on `http://localhost:3000`

## API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/apply` | Submit application | Public |
| POST | `/api/admin/accept-application` | Accept student | Admin |
| POST | `/api/admin/reject-application` | Reject application | Admin |
| POST | `/api/submissions/submit` | Submit project work | Student |
| PATCH | `/api/reviews/submit` | Review submission | Reviewer/Admin |
| POST | `/api/certificates/generate` | Generate certificate | Internal |
| GET | `/api/certificates/verify/[certId]` | Verify certificate | Public |
| POST | `/api/payments/create-order` | Create Razorpay order | Student |
| POST | `/api/payments/verify` | Verify payment | Public |
| POST | `/api/referrals/track` | Track referral | Public |
| PATCH | `/api/milestones/complete` | Complete milestone | Student |
| PATCH | `/api/profile/update` | Update profile | Student |
| GET | `/api/leaderboard` | Public leaderboard | Public |
| POST | `/api/notifications/send` | Send notification | Internal |
| POST | `/api/admin/broadcast-email` | Batch email | Admin |
| GET | `/api/admin/stats` | Admin dashboard stats | Admin |
| POST | `/api/cron/weekly-reminder` | Weekly email reminders | Cron |
| POST | `/api/cron/leaderboard` | Recalculate scores | Cron |

## Deployment

### Vercel + Supabase (Free Tier)

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy: `vercel deploy --prod`

### Required Accounts (One-Time Web UI Setup)

- **Supabase**: Create project, run migration
- **Resend**: Verify domain `hellware.in` (DNS records)
- **Razorpay**: Create account, get API keys
- **Vercel**: Connect GitHub repo

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

### Backend
- Next.js API Routes (serverless)
- Supabase (PostgreSQL + Auth + Storage)
- Zod (validation)
- Resend (email)
- Razorpay (payments)
- pdf-lib (certificate generation)
- React Email (templates)

## Cron Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Weekly Reminder | Monday 9am IST | Send progress emails to active students |
| Leaderboard Recalc | Daily midnight | Recalculate all student scores |
