# Hellware Backend

Standalone Vercel-deployable backend/admin app for the Hellware frontend.

## Deploy

Create a separate Vercel project with:

- Root Directory: `backend`
- Build Command: `npm run build`
- Install Command: `npm ci`
- Output Directory: `.next`

## Services

- PostgreSQL via Prisma
- Google Sheets mirror for admin-friendly live records
- Google Drive asset vault for resumes and payment screenshots
- JWT HttpOnly cookie auth for students/admin/management

## Main Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/applications/apply`
- `GET /api/applications/me`
- `POST /api/payments/upload-proof`
- `GET /api/admin/metrics`
- `PATCH /api/admin/applications/[id]`
- `PATCH /api/admin/payments/[id]/verify`

The admin panel is available at `/`.
