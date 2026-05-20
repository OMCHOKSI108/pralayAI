# Hellware Setup Guide

## Automated Setup

Run the setup script:

```bash
setup.bat
```

B*G!q$NCU4iYkE5
hackerchief001@gmail.com

This will:
1. Install `supabase` and `vercel` CLI tools
2. Login to Supabase (browser opens)
3. Create Supabase project
4. Push database schema (17 tables, RLS, storage, triggers)
5. Login to Vercel (browser opens)
6. Link Vercel project
7. Add environment variables (you'll be prompted for values)
8. Deploy to production

---

## Manual Steps (Cannot Be Automated)

### 1. Resend — Email Domain Verification

1. Go to https://resend.com/domains
2. Add domain: `hellware.in`
3. Add these DNS records to your domain registrar:

| Type | Name | Value |
|------|------|-------|
| TXT | @ | `v=spf1 include:spf.resend.com ~all` |
| TXT | resend._domainkey | `k=rsa; p=...` (from Resend dashboard) |
| TXT | @ | `v=DMARC1; p=none;` |

4. Wait for DNS propagation (up to 48 hours)
5. Verify in Resend dashboard

### 2. Razorpay — Payment Keys

1. Go to https://dashboard.razorpay.com
2. Sign up / Login
3. Go to Settings → API Keys
4. Generate test keys
5. Copy `Key ID` and `Key Secret`
6. Complete KYC for production mode

### 3. Supabase — GitHub OAuth

1. Create GitHub OAuth App: https://github.com/settings/developers
   - Homepage URL: `https://hellware.in`
   - Authorization callback URL: `https://<project-ref>.supabase.co/auth/v1/callback`
2. Copy Client ID and Client Secret
3. Go to Supabase Dashboard → Authentication → Providers → GitHub
4. Enable GitHub, paste Client ID and Secret
5. Save

---

## Environment Variables Reference

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API (keep secret!) |
| `RESEND_API_KEY` | Resend Dashboard → API Keys |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → API Keys (keep secret!) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as RAZORPAY_KEY_ID |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |
| `CRON_SECRET` | Generate random string (e.g., `openssl rand -hex 32`) |

---

## Verify Deployment

After deployment, test the health of your API:

```bash
curl https://your-vercel-url.vercel.app/api/health
```

Expected response:
```json
{ "status": "OK", "message": "Backend is running" }
```

---

## Local Development

```bash
cd frontend
cp .env.example .env.local
# Fill in .env.local with your values
npm run dev
```

Server runs at `http://localhost:3000`
