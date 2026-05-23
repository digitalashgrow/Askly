# Askly — Modern Anonymous Social Messaging App 🤫

Askly is an elegant, Gen-Z-inspired anonymous messaging web application built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Supabase**. Inspired by apps like NGL but featuring a highly-polished custom glassmorphism aesthetic, Apple-level micro-interactions, real-time live database synchronization, and pixel-perfect Instagram Story share card generators.

---

## 🚀 Key Features

1. **Viral Onboarding Flow**: Instant landing page featuring a live-debouncing username checker that connects directly to Supabase to verify availability.
2. **Robust Supabase Auth**: Multi-layered sign-up/login utilizing standard password authentication and pre-configured support for Google OAuth.
3. **Automated User Sync**: Custom PostgreSQL database triggers that auto-create user profile details on new auth signups.
4. **Real-time Live Inbox**: The inbox utilizes active Supabase Realtime Channels to push new anonymous messages onto the screen live without manual page refreshes!
5. **Interactive Emoji Bar**: Tapping emojis appends them smoothly directly at the cursor selection point inside the public text box.
6. **Smart Cooldown & Safety**: Dynamic client-side spam rate limit checks (12-second lockouts) combined with curated server-side profanity filters.
7. **HD Story Share Cards**: Generates high-fidelity 9:16 Instagram Story previews with customizable aesthetic gradients, compiled using a high-density client canvas engine for sharp downloads.
8. **QR Profile Generator**: Renders pixel-perfect profile QR codes compiled inside downloadable gradient frames.

---

## 🛠️ Tech Stack

* **Framework**: Next.js 15.x App Router (Server Actions & Route Handlers)
* **Language**: TypeScript
* **Database & Auth**: Supabase (Auth + PostgreSQL Database + Storage)
* **Styling**: Tailwind CSS v4 & custom HSL glassmorphism systems
* **Animations**: Framer Motion (spring layouts, dialog scales, sliding tabs)
* **Graphics**: `html-to-image` for PNG creation & `qrcode.react` for SVGs
* **User Feedback**: Custom event-driven Toast System

---

## 📂 Project Structure

```
d:\askly\
├── src/
│   ├── app/
│   │   ├── actions/               # Server Actions (message, profile, report)
│   │   ├── auth/callback/         # Auth router callbacks
│   │   ├── dashboard/             # Protected User Dashboards
│   │   │   ├── settings/          # Profile customizers
│   │   │   └── share/[id]/        # 9:16 share card generators
│   │   ├── [username]/            # Public message boxes
│   │   ├── globals.css            # Base Tailwind v4 configurations
│   │   └── layout.tsx             # Root template & custom head loaders
│   ├── components/
│   │   ├── ui/                    # Reusable React components
│   │   │   ├── Button.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Textarea.tsx
│   │   │   └── Toast.tsx
│   │   ├── FloatingBlobs.tsx      # Decorative background layers
│   │   ├── QRModal.tsx            # SVG QR compile generators
│   │   └── ThemeToggle.tsx        # Dark/light selector utilities
│   ├── utils/
│   │   ├── supabase/              # Auth cookie handlers
│   │   └── profanity.ts           # Message sanitization helpers
├── supabase_setup.sql             # SQL database migrations
└── .env.example                   # Environment templates
```

---

## 🛠️ Step-by-Step Setup Guide

### Step 1: Database Setup in Supabase
1. Create a brand new project inside the **[Supabase Dashboard](https://supabase.com)**.
2. Go to the **SQL Editor** tab on the left-side navigation.
3. Open a **New Query** window.
4. Copy the entire contents of [supabase_setup.sql](file:///d:/askly/supabase_setup.sql) and paste it into the editor.
5. Click **Run**. This will successfully create:
   * Public tables `users`, `messages`, and `reports`.
   * Realtime indexes for instant queries.
   * Auto-sync Postgres user triggers linking Supabase Auth with your profiles.
   * Fine-grained Row Level Security (RLS) policies protecting messages.

### Step 2: Configure Environment Variables
1. Rename `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Navigate to your Supabase project's **Project Settings -> API** page.
3. Retrieve your **Project URL** and **Anon API Key** (`anon`, `public`).
4. Replace the credentials inside `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### Step 3: Run Locally
1. Install project dependencies:
   ```bash
   npm install
   ```
2. Start the local Next.js dev server:
   ```bash
   npm run dev
   ```
3. Open **[http://localhost:3000](http://localhost:3000)** inside your browser!

---

## ⚡ Vercel Deployment Instructions

Askly is fully optimized and pre-configured for instant **[Vercel](https://vercel.com)** deployment:

1. **Push to GitHub**: Push your codebase to a private/public GitHub repository.
2. **Import Project**: Log into Vercel, click "Add New", and select "Project". Import your repository.
3. **Environment Variables**: In the deployment screen, copy the environment variables from your `.env.local` file and paste them into the "Environment Variables" section:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `NEXT_PUBLIC_APP_URL` (Set this to your live Vercel URL once generated, e.g., `https://askly-example.vercel.app`)
4. **Deploy**: Click **Deploy**! Vercel will compile, build, and deploy the application in under 2 minutes.

---

## 🔒 Security & Moderation Features

* **Spam Rate-Limiting**: Front-end rate limiting keeps track of timestamps inside client localStorage and enforces a 12-second lockout timer per messaging page to prevent malicious automated question flooding.
* **Server-Side Profanity Filtering**: All incoming texts pass through server actions running a custom sanitization filter to replace offensive vulgarities with clean standard asterisks (`***`).
* **Instant Abuse Reporting**: Receivers can easily report any inappropriate message. Reporting a message automatically flags it in the database and triggers a soft deletion so it instantly vanishes from the user's view, ensuring high safety.
