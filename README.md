# FinTrace

Personal finance management PWA — track money in and out, categories, and monthly insights.

FinTrace helps you manage everyday finances in one place. Add payments manually or paste a Mobile Money / bank SMS when money moves on your phone. As a browser app, FinTrace cannot read your SMS inbox; paste and share are the fast way to save those messages without retyping amount, direction, and category.

## Features

- **Dashboard** — net position, money in/out, recent activity
- **Activity & insights** — full transaction history, monthly net, category breakdown
- **Paste SMS** — copy a MoMo message to fill in amount, direction, merchant, and category
- **Add manually** — record a payment or money received without SMS
- **Share to app** — Android Web Share Target opens the SMS log screen with shared text
- **Edit category** — fix a category; FinTrace remembers per merchant
- **Auth + cloud sync** — InsForge Postgres with row-level security

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **InsForge** — auth, Postgres, API (`@insforge/sdk`)

## Getting started

```bash
npm install
cp .env.example .env.local   # add InsForge URL + anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On your phone (same Wi‑Fi): `http://<your-lan-ip>:3000`.

### InsForge setup

```bash
npx @insforge/cli link          # or create
npx @insforge/cli db push       # apply migrations/
```

Env vars (`.env.local`):

```bash
NEXT_PUBLIC_INSFORGE_URL=https://your-project.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your-anon-key
```

## Install as PWA

On Android Chrome: **Menu → Install app** or **Add to Home screen**.  
You can **Share** a MoMo SMS to FinTrace from other apps when logging phone transactions.
