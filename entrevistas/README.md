This is a Next.js app to select and redirect to interview forms.

## Getting Started

1) Copy environment variables:

```bash
cp .env.example .env.local
# Fill each URL with your final destinations
```

2) Run the development server:

```bash
pnpm dev
```

Open http://localhost:3000 with your browser.

Update URLs in `.env.local`. If a URL is missing, the UI will show an alert instead of redirecting.

This project uses Next.js App Router and Tailwind CSS v4.

## Deploy

Any platform that supports Next.js 15 is fine (e.g. Vercel). Ensure the same variables from `.env.example` are configured in production.
