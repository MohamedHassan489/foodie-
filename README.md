# Foodie AI — Graduation Project 2026

An AI-powered culinary companion. Generate recipes from your ingredients, scan your fridge, plan your week, and discover thousands of real recipes.

## Features

- **Generate recipes** — type ingredients, get a personalised recipe (requires Anthropic API key)
- **Scan fridge** — upload a photo, AI detects ingredients (requires Anthropic API key)
- **Discover recipes** — search 300+ real recipes from TheMealDB (no API key needed)
- **Weekly meal plan** — AI-generated 7-day plan with shopping list
- **Save & manage** — rate, annotate, favourite, and print recipes
- **PWA** — installable as a mobile/desktop app

## Tech stack

- **Backend**: Node.js 18+ · Express · Prisma ORM · SQLite
- **Frontend**: Vanilla JS SPA (hash router) · CSS custom properties
- **AI**: Anthropic Claude API (haiku for text, sonnet for vision)
- **Auth**: JWT · bcrypt
- **External data**: TheMealDB (free, no key needed)

## Requirements

- **Node.js 18 or higher** — required for the built-in `fetch` used by the Discover feature
- npm 8+

## Setup

### 1. Clone and install

```bash
git clone https://github.com/MohamedHassan489/foodie-
cd foodie-ai
npm install
```

`npm install` automatically generates the Prisma client via the `postinstall` hook.

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set at minimum:

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | For AI features | Get from [console.anthropic.com](https://console.anthropic.com) |
| `JWT_SECRET` | Yes | Any long random string |
| `PORT` | No | Defaults to `3000` |
| `APP_URL` | No | Base URL for password-reset links (default `http://localhost:3000`) |
| `SMTP_HOST` | No | SMTP server — if blank, reset links are printed to the console |

> **No API key?** The app still works fully: manual recipe creation, Discover, saving, rating, notes, and meal plan browsing all work without an AI key.

### 3. Create the database

```bash
npm run db:setup
```

This creates `prisma/dev.db` (SQLite file — no external database needed).

### 4. (Optional) Seed a demo user

```bash
npm run db:seed
```

Creates `demo@foodie.ai` / `demo1234` for quick testing.

### 5. Start the server

```bash
npm run dev        # development — auto-restarts on file changes
# or
npm start          # production
```

Open **http://localhost:3000**

## Project structure

```
foodie-ai/
├── client/              # Static frontend (served by Express)
│   ├── index.html
│   ├── manifest.json    # PWA manifest
│   ├── sw.js            # Service worker
│   ├── css/styles.css
│   └── js/
│       ├── api.js       # HTTP client (window.API)
│       └── app.js       # SPA router + all page renderers
├── prisma/
│   └── schema.prisma    # DB schema (SQLite)
├── server/
│   ├── index.js         # Express app entry point
│   ├── config/
│   │   ├── db.js        # Prisma client singleton
│   │   └── seed.js      # Demo data seeder
│   ├── controllers/     # Route handlers
│   ├── middleware/
│   │   └── auth.js      # JWT verify + sign
│   ├── routes/          # Express routers
│   └── services/
│       ├── claude.js    # Anthropic API calls
│       └── email.js     # Nodemailer (password reset)
├── .env.example
└── package.json
```

## API routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in, get JWT |
| POST | `/api/auth/forgot-password` | — | Send reset link |
| POST | `/api/auth/reset-password` | — | Set new password |
| GET | `/api/recipes` | JWT | List recipes (paginated) |
| POST | `/api/recipes` | JWT | Save recipe |
| GET | `/api/recipes/:id` | JWT | Get one recipe |
| PATCH | `/api/recipes/:id/favorite` | JWT | Toggle favourite |
| PATCH | `/api/recipes/:id/rating` | JWT | Set 1–5 star rating |
| PATCH | `/api/recipes/:id/notes` | JWT | Update personal notes |
| DELETE | `/api/recipes/:id` | JWT | Delete recipe |
| GET | `/api/discover` | JWT | Search TheMealDB |
| GET | `/api/discover/categories` | JWT | List recipe categories |
| POST | `/api/ai/generate` | JWT | Generate recipe (AI) |
| POST | `/api/ai/scan` | JWT | Scan fridge image (AI) |
| POST | `/api/ai/meal-plan` | JWT | Generate meal plan (AI) |
| POST | `/api/ai/tip` | JWT | Get step tip (AI) |
| GET | `/api/users/profile` | JWT | Get profile |
| PUT | `/api/users/profile` | JWT | Update profile |
| GET | `/api/users/meal-plans` | JWT | List saved meal plans |

## Common issues

**`Error: Cannot find module '@prisma/client'`**
Run `npm run db:setup` — this generates the Prisma client and creates the database.

**AI features return "503 AI features require an Anthropic API key"**
Add a real `ANTHROPIC_API_KEY` to your `.env` file.

**Port already in use**
Change `PORT=3001` (or any free port) in `.env`.
