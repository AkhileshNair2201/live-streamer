# Live Stream Backend

NestJS monorepo for the live-stream backend services.

## Current Apps

- `live-stream-backend` (default Nest app)
- `api-gateway`
- `video-upload-service`
- `video-processing-worker`

Current routes:

- `live-stream-backend`: `GET /` -> `Hello World!`
- `api-gateway`: `GET /` -> `Hello World!`, `POST /upload` (multipart proxy)
- `video-upload-service`: `GET /` -> `Hello World!`, `POST /upload` (stores file + creates job)
- `video-processing-worker`: `GET /` -> `Hello World!`

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

## Phase 2 Config (Upload Path)

`video-upload-service` uses:

- PostgreSQL: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  Defaults: `localhost:5434`, `postgres/postgres`, DB `live_stream`
- MinIO/S3: `MINIO_ENDPOINT`, `MINIO_REGION`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_RAW_BUCKET`
- RabbitMQ: `RABBITMQ_URL`, `VIDEO_PROCESSING_QUEUE`

`api-gateway` uses:

- Upload service target: `VIDEO_UPLOAD_SERVICE_URL` (default `http://localhost:3002`)

## Execution Phases

Execution phases are tracked in `docs/tasks`.

- `docs/tasks/phase-0.md` - completed (infra setup with Docker services)
- `docs/tasks/phase-1.md` - completed (Nest monorepo and app scaffolding)
- `docs/tasks/phase-2.md` - implemented (upload, DB, MinIO, RabbitMQ publish, gateway proxy)
- `docs/tasks/phase-3.md` - pending (worker processing and HLS conversion)
- `docs/tasks/phase-4.md` - pending (frontend upload view)
- `docs/tasks/phase-5.md` - pending (frontend player view)
- `docs/tasks/phase-6.md` - pending (refinement, tests, docs, containerization)
