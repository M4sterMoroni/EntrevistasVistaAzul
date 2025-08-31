# EntrevistasVistaAzul

This is a Next.js app for selecting and requesting interviews for Barrio Vista Azul.

## Features

- Clean, mobile‑first UI with expandable sections
- Options for: Recomendación para el templo, Dignidad, Ajuste anual de diezmos, Desafíos temporales (Varones/Mujeres), Otros
- Client redirects to URLs based on environment variables
- "Otros" posts Name + Comment to a Telegram group via server API

## Requirements

- Node 20+
- pnpm 8+ (Corepack recommended)

## Setup

1) Create env files

```bash
cp .env.example .env.local
```

2) Fill envs

- Public (client redirects):
  - `NEXT_PUBLIC_OBISPO`
  - `NEXT_PUBLIC_PRIMER_CONSEJERO`
  - `NEXT_PUBLIC_SEGUNDO_CONSEJERO`
  - `NEXT_PUBLIC_PRES_CUORUM`
  - `NEXT_PUBLIC_PRES_SOCSOC`

- Server (Telegram):
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID`

3) Install and run

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

## Testing

All test files are organized in the `tests/` directory:
- `tests/jest.config.js` - Jest configuration
- `tests/jest.setup.js` - Jest setup and mocks
- `tests/playwright.config.ts` - Playwright configuration
- `tests/e2e/` - E2E test files
- `src/__tests__/` - Unit test files

### Unit Tests
```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### E2E Tests
```bash
# Run E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Run headed (visible browser)
pnpm test:e2e:headed
```

### Linting
```bash
pnpm lint
```

## Test Coverage

- **Unit Tests**: React components, API routes, utility functions
- **E2E Tests**: User interactions, navigation, form submissions
- **Accessibility**: ARIA attributes, keyboard navigation
- **Responsive**: Mobile, tablet, desktop layouts
- **Error Handling**: API failures, network errors, validation

## CI/CD Pipeline

The project uses GitHub Actions for automated testing:

### Workflow Steps
1. **Lint**: ESLint checks for code quality
2. **Unit Tests**: Jest tests with coverage reporting
3. **Build Check**: Ensures the app builds successfully
4. **E2E Tests**: Playwright tests across multiple browsers
5. **Security Audit**: npm audit for vulnerabilities

### Branch Protection
- All tests must pass before merging to `main`
- Code coverage threshold: 80%
- Security vulnerabilities block deployment

### Deployment
- Vercel automatically rebuilds and deploys when code is pushed to `main`
- No additional deployment steps needed in GitHub Actions

## Telegram configuration

1) Create a bot with @BotFather → `/newbot`, copy the token.
2) Add the bot to your group and send a message in the group.
3) Get the group chat ID:
   - Visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   - Copy `chat.id` (negative number like `-100...`).
4) Set envs:
   - `TELEGRAM_BOT_TOKEN=<your-token>`
   - `TELEGRAM_CHAT_ID=-100XXXXXXXXXX`

## Behavior

- Recomendación para el templo
  - Ordenanza personal → `NEXT_PUBLIC_OBISPO`
  - Renovación → random 50/50 between `NEXT_PUBLIC_PRIMER_CONSEJERO` and `NEXT_PUBLIC_SEGUNDO_CONSEJERO`
- Dignidad → `NEXT_PUBLIC_OBISPO`
- Ajuste anual de diezmos → `NEXT_PUBLIC_OBISPO`
- Desafíos temporales
  - Varones → `NEXT_PUBLIC_PRES_CUORUM`
  - Mujeres → `NEXT_PUBLIC_PRES_SOCSOC`
- Otros (Telegram)
  - Shows a form (Nombre, Comentario) when expanded
  - Sends to Telegram via `POST /api/otros-telegram`

If a URL env is missing, the UI shows an alert with the missing key.

## Deploy (Vercel)

1) Set Environment Variables (Production and Preview):
   - Public: `NEXT_PUBLIC_OBISPO`, `NEXT_PUBLIC_PRIMER_CONSEJERO`, `NEXT_PUBLIC_SEGUNDO_CONSEJERO`, `NEXT_PUBLIC_PRES_CUORUM`, `NEXT_PUBLIC_PRES_SOCSOC`
   - Server: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
2) Redeploy to apply changes.

## Troubleshooting

- Missing env var alert:
  - Ensure the key exists and is non‑empty in Vercel and `.env.local`.
  - For public vars, rebuild/redeploy (inlined at build time).
- Telegram not sending:
  - Bot must be in the group; use the negative `chat_id`.
  - Remove webhook: `https://api.telegram.org/bot<token>/deleteWebhook`
  - Send a fresh message, then check `getUpdates`.
- Tests failing:
  - Run `pnpm install` to ensure all dependencies are installed
  - Check that Node version is 20+
  - For E2E tests, ensure Playwright browsers are installed: `npx playwright install`

## Tech

- Next.js 15 (App Router), React 19
- Tailwind CSS v4
- Jest + React Testing Library (Unit Tests)
- Playwright (E2E Tests)
- GitHub Actions (CI/CD)
- Vercel (Deployment)
