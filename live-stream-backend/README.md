# Live Stream Backend

NestJS monorepo for the live-stream backend services.

## Current Apps

- `live-stream-backend` (default Nest app)
- `api-gateway`
- `video-upload-service`
- `video-processing-worker`

All apps currently expose a single route:

- `GET /` -> returns `Hello World!`

## Monorepo Structure

```text
live-stream-backend/
  apps/
    live-stream-backend/
    api-gateway/
    video-upload-service/
    video-processing-worker/
```

## Setup

```bash
pnpm install
```

## Run

Start default app (`live-stream-backend`):

```bash
pnpm start
```

Start a specific app:

```bash
pnpm exec nest start api-gateway
pnpm exec nest start video-upload-service
pnpm exec nest start video-processing-worker
pnpm exec nest start live-stream-backend
```

Watch mode:

```bash
pnpm start:dev
```

## Build

Build all apps:

```bash
pnpm build
```

Build a single app:

```bash
pnpm exec nest build api-gateway
pnpm exec nest build video-upload-service
pnpm exec nest build video-processing-worker
pnpm exec nest build live-stream-backend
```

## Test

Unit tests:

```bash
pnpm test
```

E2E test for default app:

```bash
pnpm run test:e2e
```

Run E2E for other apps directly:

```bash
pnpm exec jest --config ./apps/api-gateway/test/jest-e2e.json
pnpm exec jest --config ./apps/video-upload-service/test/jest-e2e.json
pnpm exec jest --config ./apps/video-processing-worker/test/jest-e2e.json
```

Coverage:

```bash
pnpm run test:cov
```

## Runtime Notes (As Implemented)

- `apps/live-stream-backend/src/main.ts` reads `process.env.PORT`, fallback `3000`.
- `apps/api-gateway/src/main.ts` reads `process.env.PORT`, fallback `3001`.
- `apps/video-upload-service/src/main.ts` reads `process.env.PORT`, fallback `3002`.
- `apps/video-processing-worker/src/main.ts` reads `process.env.PORT`, fallback `3003`.

If you run multiple apps locally, set different ports per process.

## Phases Tracker

Execution phases are tracked in `docs/tasks`.

- `docs/tasks/phase-0.md` - completed
- `docs/tasks/phase-1.md` - completed
- `docs/tasks/phase-2.md` - pending
- `docs/tasks/phase-3.md` - pending
- `docs/tasks/phase-4.md` - pending
- `docs/tasks/phase-5.md` - pending
- `docs/tasks/phase-6.md` - pending
