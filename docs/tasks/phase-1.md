# Phase 1: Backend - API Scaffolding

**Goal:** Create the backend application structure within the pnpm workspace.

### Task Tracker

- [x] **Scaffold Backend Monorepo:**
    - [x] At the project root, use `pnpm dlx` to run the NestJS CLI without a global install:
      ```shell
      pnpm dlx @nestjs/cli new live-stream-backend --package-manager pnpm
      ```
    - [x] This creates a `live-stream-backend` directory.

- [x] **Integrate into Workspace:**
    - [x] The new monorepo has its own `node_modules` and `pnpm-lock.yaml`. Remove them to let the root workspace manage dependencies:
      ```shell
      rm -rf live-stream-backend/node_modules live-stream-backend/pnpm-lock.yaml
      ```
    - [x] Run `pnpm install` from the **project root**. This will install the backend dependencies into the root `node_modules`.

- [x] **Generate Applications:**
    - [x] From the root, use the `pnpm nest` command to generate applications within the backend monorepo:
      ```shell
      pnpm --filter=live-stream-backend g app api-gateway
      pnpm --filter=live-stream-backend g app video-upload-service
      pnpm --filter=live-stream-backend g app video-processing-worker
      ```
    - Note: The NestJS workspace config in `live-stream-backend/nest-cli.json` correctly places these in the `apps` directory.

- [x] **Verify Application Structure:**
    - [x] Confirm the `live-stream-backend/apps` directory contains the three generated applications.
    - [x] Test run one of the applications from the root: `pnpm --filter=api-gateway start:dev`.
