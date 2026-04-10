# SubmitApp — Setup Guide

## 1. Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- npm or pnpm

## 2. Installation

```bash
# Clone or download the project, then:
cd submission-flow

# Install dependencies
npm install

# Copy environment variable template
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials (see step 3).

## 3. Supabase Setup

### Create a Supabase project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready

### Enable Email Auth
1. In your Supabase dashboard, go to **Authentication → Providers**
2. Ensure **Email** provider is enabled
3. For local testing, you can disable "Confirm email" under **Authentication → Settings**

### Run the database schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Paste the contents of `supabase/schema.sql` and run it
3. Verify the `submissions` table was created in **Table Editor**

### Set up storage
1. In the SQL Editor, paste the contents of `supabase/storage.sql` and run it
2. Go to **Storage** and verify the `submission-images` bucket was created

### Copy your API credentials
1. Go to **Settings → API** in your Supabase dashboard
2. Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
3. Copy **anon public key** → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

## 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 5. Test Checklist

- [ ] Visit `/` — landing page loads with "Log in" and "Sign up" buttons
- [ ] Visit `/signup` — create a new account with email + password
- [ ] Check email and confirm your account (or disable email confirmation in Supabase)
- [ ] Visit `/login` — log in with your credentials
- [ ] You are redirected to `/submit` automatically
- [ ] Fill in the submission form:
  - Select Type A or Type B
  - Upload an image file (JPG/PNG/WEBP, under 5MB)
  - Enter an identifier (e.g. `TEST-001`)
- [ ] Click "Submit entry" — you should see the success state with a submission ID
- [ ] Visit `/dashboard` — your submission appears in the table with status "Pending"
- [ ] In Supabase **Table Editor → submissions** — verify the row exists with correct data
- [ ] In Supabase **Storage → submission-images** — verify the uploaded image exists under your user ID folder
- [ ] Log out — you are redirected to `/`
- [ ] Try visiting `/submit` while logged out — you are redirected to `/login`
