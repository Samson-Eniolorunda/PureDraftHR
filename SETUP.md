# PureDraft HR — Setup Guide

## Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** 9+
- A **Vercel** account (for deployment)
- A **Google Cloud** account (for Gemini AI API key)

---

## 1. Clone & Install

```bash
git clone https://github.com/Samson-Eniolorunda/PureDraftHR.git
cd PureDraftHR
npm install
```

---

## 2. Environment Variables

Create a `.env.local` file in the project root with **all** of the following:

```env
# ── Google Gemini AI (required) ──────────────────────────
GOOGLE_GENERATIVE_AI_API_KEY=""
# Get from: https://aistudio.google.com/apikey

# ── Resend — Email (required for email feature) ─────────
RESEND_API_KEY=""
CONTACT_EMAIL=""
# Get from: https://resend.com → API Keys
# CONTACT_EMAIL is the address that receives contact-form emails

# ── Upstash Redis — Rate Limiting (required) ─────────────
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
# Get from: https://console.upstash.com → Create a Redis database → REST API

# ── Clerk — Authentication (required for Save/Dashboard) ─
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
# Get from: https://clerk.com → Create application → API Keys
# Enable Google OAuth in Clerk dashboard → User & Authentication → Social Connections

# ── Supabase PostgreSQL — Database (required for Save/Dashboard) ─
DATABASE_URL=""
DIRECT_URL=""
# Get from: https://supabase.com → Project Settings → Database → Connection string
# DATABASE_URL = Transaction/Pooler connection string (port 6543)
# DIRECT_URL  = Direct connection string (port 5432)
```

---

## 3. Set Up Each Service

### Google Gemini AI

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key
3. Paste into `GOOGLE_GENERATIVE_AI_API_KEY`

### Upstash Redis

1. Go to [Upstash Console](https://console.upstash.com)
2. Create a new Redis database (free tier works)
3. Copy **REST URL** → `UPSTASH_REDIS_REST_URL`
4. Copy **REST Token** → `UPSTASH_REDIS_REST_TOKEN`

### Resend (Email)

1. Go to [Resend](https://resend.com) and create an account
2. Add and verify your sending domain (or use the free onboarding domain)
3. Create an API key → `RESEND_API_KEY`
4. Set `CONTACT_EMAIL` to the address that should receive contact-form emails

### Clerk (Authentication)

1. Go to [Clerk](https://clerk.com) and create an application
2. In the Clerk dashboard, go to **User & Authentication → Social Connections** and enable **Google**
3. Copy **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
4. Copy **Secret key** → `CLERK_SECRET_KEY`

### Supabase (Database)

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to **Project Settings → Database → Connection string**
3. Copy the **Transaction/Pooler** URI (port `6543`) → `DATABASE_URL`
4. Copy the **Direct** URI (port `5432`) → `DIRECT_URL`
5. Push the schema to your database:

```bash
npx prisma db push
```

---

## 4. Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## 5. Deploy to Vercel

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add **all** environment variables from step 2 in the Vercel project settings (Settings → Environment Variables)
4. Deploy — the build script automatically runs `prisma generate` before `next build`

### Vercel Build Settings (auto-detected)

| Setting           | Value                            |
| ----------------- | -------------------------------- |
| Framework         | Next.js                          |
| Build Command     | `prisma generate && next build`  |
| Output Directory  | `.next`                          |
| Install Command   | `npm install`                    |

---

## 6. Post-Deploy Checklist

- [ ] All env vars set in Vercel
- [ ] Clerk Google OAuth enabled and redirect URIs configured
- [ ] `npx prisma db push` run against production Supabase database
- [ ] Upstash Redis database created and env vars added
- [ ] Resend domain verified

---

## Troubleshooting

| Issue | Fix |
| --- | --- |
| `prisma generate` fails | Ensure `DATABASE_URL` is set (even a placeholder works for generation) |
| Auth not working | Check Clerk publishable key starts with `pk_` |
| Save button not showing | Sign in first — Save is only visible to authenticated users |
| Rate limit errors | Verify Upstash Redis URL and token are correct |
| Email sending fails | Verify Resend API key and domain |
