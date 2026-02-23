# Master Plan: LiveStream Convertor Implementation (Phased Approach)

This document outlines a phased master plan for implementing the LiveStream Convertor project. Each phase is designed to be a testable checkpoint, providing a clear and iterative development path.

---

### **Development Environment & Tooling**

*   **Node Version Manager:** Use `nvm` to manage Node.js versions.
*   **Node.js Version:** Use a stable LTS version (e.g., `v20.x.x`). Install with `nvm install --lts`.
*   **Package Manager:** Use `pnpm` for its efficiency. Install with `npm install -g pnpm`.
*   **CLI Tools:** We will heavily rely on CLIs like `nest-cli` for backend setup and `vite` for the frontend.

---

## Phase 0: Environment & Service Setup

**Goal:** Prepare the complete local development environment.

**Tasks:**
1.  **Install Tools:**
    *   Ensure `nvm`, `node`, `pnpm`, and `docker` are installed.
    *   Use `nvm` to install and use a stable Node.js LTS version.
2.  **Setup `docker-compose.yml`:**
    *   Create a `docker-compose.yml` file at the project root.
    *   Add services for:
        *   `postgres:latest`
        *   `rabbitmq:3-management` (the `management` tag includes the UI)
        *   `minio/minio`
    *   Configure environment variables, ports (e.g., `5434` for Postgres host mapping, `5672` for RabbitMQ, `9000` for Minio API, `9001` for Minio Console), and persistent volumes.
3.  **Launch Services:**
    *   Run `docker-compose up -d`.

**Checkpoint (Test):**
*   All services are running. You can verify this with `docker ps`.
*   You can access the RabbitMQ management UI (e.g., `http://localhost:15672`).
*   You can access the MinIO console (e.g., `http://localhost:9001`) and create a new bucket for video uploads.

---

## Phase 1: Backend - API Scaffolding

**Goal:** Create the backend application structure using `nest-cli`.

**Tasks:**
1.  **Install NestJS CLI:**
    *   `pnpm install -g @nestjs/cli`
2.  **Scaffold Monorepo:**
    *   Run `nest new live-stream-backend --package-manager pnpm` to create a new monorepo.
    *   Navigate into the `live-stream-backend` directory.
3.  **Generate Applications:**
    *   Inside the monorepo, generate the necessary applications:
        *   `nest g app api-gateway`
        *   `nest g app video-upload-service`
        *   `nest g app video-processing-worker`
4.  **Establish Service Communication (Initial):**
    *   Configure the `api-gateway` to use TCP for potential future microservice communication.

**Checkpoint (Test):**
*   The `live-stream-backend` directory contains a `apps` folder with the three generated applications.
*   Each application can be started individually (e.g., `pnpm run start:dev api-gateway`).

---

## Phase 2: Backend - Video Upload & Job Creation

**Goal:** Implement the functionality to upload a video, store it, and create a conversion job.

**Tasks:**
1.  **`video-upload-service`:**
    *   **Database Integration:**
        *   Install TypeORM and the PostgreSQL driver (`pg`).
        *   Configure the service to connect to the PostgreSQL instance from Docker Compose.
        *   Create a `Video` entity and use TypeORM CLI or `synchronize` (for dev) to create the table.
    *   **Storage Integration:**
        *   Install an S3 client library (`@aws-sdk/client-s3`) and configure it to connect to the MinIO instance.
    *   **API Endpoint:**
        *   Create a controller with a `POST` endpoint that accepts `multipart/form-data`.
        *   Implement the logic to stream the uploaded file directly to MinIO.
        *   On successful upload, create a new record in the `videos` table with a `status` of `PENDING`.
    *   **Job Publishing:**
        *   Install RabbitMQ client library (`amqplib`).
        *   After creating the database record, publish a message to a `video_processing_queue` with the video's ID.
2.  **`api-gateway`:**
    *   Set up a proxy endpoint that forwards `/upload` requests to the `video-upload-service`.

**Checkpoint (Test):**
*   Start all services (`docker-compose up` and the NestJS apps).
*   Use an API client (like Postman or Insomnia) to send a POST request with a video file to the `api-gateway`'s `/upload` endpoint.
*   **Verify:**
    *   The video file appears in your MinIO bucket.
    *   A new row appears in the `videos` table in PostgreSQL.
    *   A message appears in the `video_processing_queue` in the RabbitMQ management UI.

---

## Phase 3: Backend - Video Processing Worker

**Goal:** Implement the worker to process the video into HLS format.

**Tasks:**
1.  **`video-processing-worker`:**
    *   **Job Consumption:**
        *   Configure the worker to connect to RabbitMQ and listen for messages on the `video_processing_queue`.
    *   **FFmpeg Integration:**
        *   Ensure `ffmpeg` is installed on your machine (or in the Docker container for the worker later).
        *   On receiving a job, use a Node.js child process to execute `ffmpeg` commands.
    *   **Processing Logic:**
        *   Fetch video details from the database.
        *   Download the video file from MinIO.
        *   Run `ffmpeg` to create multiple HLS renditions (e.g., 360p, 720p).
        *   Upload the resulting `.m3u8` playlists and `.ts` segments to a separate MinIO bucket.
        *   Update the video's record in the database with `status='COMPLETED'` and the path to the master playlist.

**Checkpoint (Test):**
*   Start all backend services.
*   Trigger a job (by uploading a video as in Phase 2).
*   **Verify:**
    *   The `video-processing-worker` logs show it received and processed a job.
    *   The HLS files (`.m3u8`, `.ts`) appear in the designated MinIO bucket.
    *   The video's status in the PostgreSQL database is updated to `COMPLETED`.

---

## Phase 4: Frontend - Project Setup & Upload View

**Goal:** Create the user-facing interface for uploading videos.

**Tasks:**
1.  **Scaffold Frontend:**
    *   In the project root (outside the backend monorepo), run `pnpm create vite frontend --template react-ts`.
2.  **Create Upload UI:**
    *   Develop a React component (`UploadView.tsx`) with a file input and a submit button.
    *   Use a library like `axios` to handle the file upload.
3.  **Implement Upload Logic:**
    *   On form submission, send the file to the backend's `/upload` endpoint.
    *   Display an upload progress bar.
4.  **Routing:**
    *   Use `react-router-dom` to set up routing.
    *   After a successful upload, redirect the user to a player page (e.g., `/watch/{videoId}`).

**Checkpoint (Test):**
*   Run the frontend development server (`pnpm dev`).
*   Open the browser and see the upload page.
*   Select a video and upload it.
*   **Verify:**
    *   The upload progress bar works.
    *   The backend processes the file as in the previous phases.
    *   The page redirects to a (currently blank) watch page.

---

## Phase 5: Frontend - Player View

**Goal:** Build the view to watch the converted video stream.

**Tasks:**
1.  **Create Player UI:**
    *   Develop the `PlayerView.tsx` component.
    *   It should extract the `videoId` from the URL.
2.  **API Integration:**
    *   Create a new backend endpoint in the `api-gateway` to get video status and details by ID.
    *   Implement status polling from the frontend: repeatedly call the status endpoint until the status is `COMPLETED`.
    *   Display a loading message while the video is processing.
3.  **Integrate HLS Player:**
    *   Once the status is `COMPLETED`, the API should return the URL to the master `.m3u8` playlist.
    *   Use a library like `hls.js` integrated with a React video player (e.g., `ReactPlayer`) to play the stream.

**Checkpoint (Test):**
*   Upload a video.
*   The page redirects and shows a "Processing..." message.
*   After a few moments, the message disappears, and the video player loads and plays the converted HLS stream.

---

## Phase 6: Refinement & Documentation

**Goal:** Improve reliability, add tests, and document the project.

**Tasks:**
1.  **Error Handling:** Implement comprehensive error handling on both frontend and backend.
2.  **Testing:** Write unit and integration tests for the backend, and component tests for the frontend.
3.  **Documentation:** Create a `README.md` with setup instructions, architecture overview, and API documentation.
4.  **Containerize Applications:** Create `Dockerfile`s for each backend and frontend service to prepare for deployment.

**Checkpoint (Test):**
*   The application is stable and handles errors gracefully.
*   A new developer can easily set up and run the project using the `README.md` and `docker-compose`.
