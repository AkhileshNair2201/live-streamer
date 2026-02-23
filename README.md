# Live Streamer

A full-stack video upload and HLS streaming system built with a NestJS microservices backend and a React frontend.

## Architecture Overview

The platform is split into services with clear responsibilities:

- `frontend` (`http://localhost:5173` in dev, `http://localhost:8080` in Docker)
  - Upload UI and player UI.
- `api-gateway` (`http://localhost:3001`)
  - Public backend entry point.
  - Proxies upload/status requests.
  - Serves HLS playlist/segment files from MinIO.
- `video-upload-service` (`http://localhost:3002`)
  - Accepts uploaded videos.
  - Stores metadata in PostgreSQL.
  - Uploads raw files to MinIO.
  - Publishes processing jobs to RabbitMQ.
- `video-processing-worker` (`http://localhost:3003`)
  - Consumes RabbitMQ jobs.
  - Downloads raw video from MinIO.
  - Converts to HLS using `ffmpeg`.
  - Uploads HLS output to MinIO and updates DB status.
- `live-stream-backend` (`http://localhost:3000`)
  - Base app scaffold used in early phases.

Infra services:

- PostgreSQL 17 (`postgres:17-alpine`) host mapped to `localhost:5434`
- RabbitMQ (`localhost:5672`, management UI at `localhost:15672`)
- MinIO (`localhost:9000`, console at `localhost:9001`)

## Request Flow

1. Frontend sends `POST /upload` to API Gateway.
2. API Gateway proxies to Video Upload Service.
3. Video Upload Service stores raw object in MinIO, inserts DB row with `PENDING`, and publishes RabbitMQ job.
4. Video Processing Worker consumes job, generates HLS (`index.m3u8` + `.ts`), uploads processed files to MinIO, updates row to `COMPLETED` (or `FAILED`).
5. Frontend polls `GET /videos/:id` until `COMPLETED` and then plays `GET /hls/:videoId/:fileName` from API Gateway.

## Prerequisites

- Node.js 20+
- pnpm 8+
- Docker + Docker Compose (for infra or full containerized run)
- `ffmpeg` (only required when running worker on host machine; Docker worker image already contains it)

## Environment Setup

Create `.env` at project root:

```bash
cp .env.example .env
```

Default `.env.example` values already match this repo, including:

- PostgreSQL image: `postgres:17-alpine`
- Host DB port: `5434`
- Service ports: `3000`, `3001`, `3002`, `3003`

## Run Locally (Hybrid: Infra in Docker, apps on host)

1. Start infra:

```bash
docker compose up -d postgres rabbitmq minio minio-init
```

2. Install deps:

```bash
pnpm install
```

3. Start backend services (separate terminals):

```bash
pnpm backend:start:video-upload-service:dev
pnpm backend:start:video-processing-worker:dev
pnpm backend:start:api-gateway:dev
```

Optional:

```bash
pnpm backend:start:live-stream-backend:dev
```

4. Start frontend:

```bash
pnpm frontend:start
```

## Run Fully in Docker

```bash
docker compose up --build
```

Endpoints:

- Frontend: `http://localhost:8080`
- API Gateway: `http://localhost:3001`
- RabbitMQ UI: `http://localhost:15672`
- MinIO Console: `http://localhost:9001`

## API Endpoints

Base URL: `http://localhost:3001`

### Health/Hello

`GET /`

Response:

```json
"Hello World!"
```

### Upload Video

`POST /upload` (`multipart/form-data`, field name: `file`)

Example:

```bash
curl -X POST http://localhost:3001/upload \
  -F "file=@/absolute/path/to/video.mp4"
```

Success response:

```json
{
  "videoId": "df0acd31-ca57-4ce6-8d49-18dcf84e60a7",
  "status": "PENDING",
  "storageKey": "cb56.../1700000000000-video.mp4"
}
```

### Check Video Status

`GET /videos/:id`

Example:

```bash
curl http://localhost:3001/videos/df0acd31-ca57-4ce6-8d49-18dcf84e60a7
```

Response while processing:

```json
{
  "id": "df0acd31-ca57-4ce6-8d49-18dcf84e60a7",
  "status": "PENDING",
  "hlsPath": null,
  "storageKey": "cb56.../1700000000000-video.mp4",
  "originalFileName": "video.mp4"
}
```

Response when done:

```json
{
  "id": "df0acd31-ca57-4ce6-8d49-18dcf84e60a7",
  "status": "COMPLETED",
  "hlsPath": "df0acd31-ca57-4ce6-8d49-18dcf84e60a7/index.m3u8",
  "storageKey": "cb56.../1700000000000-video.mp4",
  "originalFileName": "video.mp4"
}
```

### Stream HLS Assets

`GET /hls/:videoId/:fileName`

Examples:

- Playlist: `/hls/<videoId>/index.m3u8`
- Segment: `/hls/<videoId>/segment_000.ts`

## Standardized Error Response

All backend apps now use a global exception filter with this response shape:

```json
{
  "statusCode": 400,
  "message": "No file provided. Use multipart/form-data with field name \"file\".",
  "timestamp": "2026-02-24T01:00:00.000Z",
  "path": "/upload"
}
```

## Scripts (Root)

```bash
pnpm frontend:start
pnpm frontend:build
pnpm frontend:lint
pnpm frontend:test

pnpm backend:build
pnpm backend:test
pnpm backend:test:e2e
pnpm backend:test:e2e:api-gateway

pnpm backend:start:api-gateway:dev
pnpm backend:start:video-upload-service:dev
pnpm backend:start:video-processing-worker:dev
pnpm backend:start:live-stream-backend:dev
```

## Testing Status (Phase 6)

Validated in this phase:

- Backend lint/build
- Backend unit tests
- API Gateway e2e tests (`GET /`, `GET /videos/:id`)
- Frontend lint/build
- Frontend component tests for `UploadView` and `PlayerView`

## Task Phases

Execution checklists are tracked in `docs/tasks`:

- `docs/tasks/phase-0.md`
- `docs/tasks/phase-1.md`
- `docs/tasks/phase-2.md`
- `docs/tasks/phase-3.md`
- `docs/tasks/phase-4.md`
- `docs/tasks/phase-5.md`
- `docs/tasks/phase-6.md`
