# Phase 0: Environment & Service Setup

**Goal:** Prepare the complete local development environment and project structure.

### Task Tracker

- [x] **Install Core Tools:**
    - [x] Install `nvm` (Node Version Manager).
    - [x] Install and use a stable Node.js LTS version: `nvm install --lts`.
    - [x] Install `pnpm` globally: `npm install -g pnpm`.
    - [x] Ensure `docker` and `docker-compose` are installed.

- [x] **Initialize PNPM Workspace:**
    - [x] At the project root, create a `package.json` file: `pnpm init`.
    - [x] Create a `pnpm-workspace.yaml` file at the root.
    - [x] In `pnpm-workspace.yaml`, define the future locations of your apps:
      ```yaml
      packages:
        - 'frontend'
        - 'live-stream-backend/apps/*'
      ```

- [x] **Setup `docker-compose.yml`:**
    - [x] Create a `docker-compose.yml` file at the project root.
    - [x] Add services for `postgres`, `rabbitmq:3-management`, and `minio/minio`.
    - [x] Configure ports, environment variables, and persistent volumes.

- [x] **Launch & Verify Services:**
    - [x] Run `docker-compose up -d`.
    - [x] Verify containers are running with `docker ps`.
    - [x] Access RabbitMQ UI (`http://localhost:15672`).
    - [x] Access MinIO console (`http://localhost:9001`) and create buckets (`videos-raw`, `videos-processed`).
