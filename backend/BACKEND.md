# Hellware Backend Architecture

This folder is a standalone Vercel app for admin/backend operations. Deploy it as its own
Vercel project with `backend` as the root directory.

## Runtime Pattern

```text
Next.js App Router API
  -> Prisma/PostgreSQL for atomic records
  -> Google Drive for resumes and payment proof screenshots
  -> Google Sheets as the management-facing mirror
```

## Data Model

The Prisma schema lives in `prisma/schema.prisma` and defines:

- `User`: login identity with `STUDENT`, `ADMIN`, or `MANAGEMENT` role.
- `StudentProfile`: application state and student profile.
- `PaymentProof`: payment screenshot URL, transaction hash, and verification state.

## Google Sheets Tabs

Create these tabs in the spreadsheet configured by `GOOGLE_SHEETS_ID`:

- `Applications Index`
- `Financial Audit`

Applications rows:

```text
Student ID | Full Name | Email | Phone | College | Grad Year | Skills | Application Status | Applied Date | Resume URL
```

Payment rows:

```text
Payment ID | Student ID | Student Name | Amount (INR) | Tx Hash | Drive Screenshot Link | Verification Status | Reason | Updated Date
```

## API Surface

Public/student:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/applications/apply`
- `GET /api/applications/me`
- `POST /api/payments/upload-proof`

Admin/management:

- `GET /api/admin/metrics`
- `GET /api/admin/applications`
- `PATCH /api/admin/applications/[id]`
- `GET /api/admin/payments`
- `PATCH /api/admin/payments/[id]/verify`

Health:

- `GET /api/health`

## Environment

Copy `.env.example` to `.env.local` for local development, and add the same variables in
the Vercel backend project.

```bash
cd backend
cp .env.example .env.local
npm install
npm run prisma:generate
npm run dev
```

## Admin User Setup

Register the first admin by calling `POST /api/auth/register` with:

```json
{
  "email": "admin@hellware.in",
  "password": "strong-password",
  "fullName": "Hellware Admin",
  "role": "ADMIN",
  "adminSetupToken": "value-from-ADMIN_SETUP_TOKEN"
}
```

After login, use the returned token as `Authorization: Bearer <token>` or rely on the
HttpOnly cookie in browser-based admin flows.
