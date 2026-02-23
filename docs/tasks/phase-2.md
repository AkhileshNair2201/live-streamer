# Phase 2: Backend - Video Upload & Job Creation

**Goal:** Implement the functionality to upload a video, store it, and create a conversion job. All commands are run from the project root.

### Task Tracker

- [x] **`video-upload-service`: Database Integration:**
    - [x] Add TypeORM, `pg`, and `@nestjs/typeorm` to the `video-upload-service` workspace.
      ```shell
      pnpm add @nestjs/typeorm typeorm pg --filter video-upload-service
      ```
    - [x] Configure the `video-upload-service` module to connect to PostgreSQL via env config.
    - [x] Create a `Video` entity.
    - [x] Use TypeORM's `synchronize: true` for development.

- [x] **`video-upload-service`: Storage Integration:**
    - [x] Add the AWS S3 client library to the workspace.
      ```shell
      pnpm add @aws-sdk/client-s3 --filter video-upload-service
      ```
    - [x] Create a `StorageService` configured to connect to MinIO/S3-compatible storage.

- [x] **`video-upload-service`: API Endpoint:**
    - [x] Implement `POST /upload` in `video-upload-service`.
    *   [x] Implement a `POST` endpoint for `multipart/form-data`.
    *   [x] Add logic to upload the file to the `videos-raw` bucket.
    *   [x] Save a new record to the `videos` table with a `PENDING` status.

- [x] **`video-upload-service`: Job Publishing:**
    - [x] Add RabbitMQ client libraries to the workspace.
      ```shell
      pnpm add amqplib @nestjs/microservices --filter video-upload-service
      ```
    - [x] Configure the service to connect to RabbitMQ via env config.
    - [x] After saving the DB record, publish a message to `video_processing_queue` with the `videoId`.

- [x] **`api-gateway`: Proxy Setup:**
    - [x] Configure `api-gateway` to proxy `/upload` requests to the `video-upload-service`.

- [x] **Checkpoint Testing:**
    - [x] Use an API client (Postman/Insomnia) to send a video file to the `/upload` endpoint.
    - [x] **Verify:**
        - [x] The file is in the `videos-raw` MinIO bucket.
        - [x] A new record is in the `videos` PostgreSQL table.
        - [x] A message is in the `video_processing_queue` in the RabbitMQ UI.
