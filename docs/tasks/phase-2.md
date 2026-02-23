# Phase 2: Backend - Video Upload & Job Creation

**Goal:** Implement the functionality to upload a video, store it, and create a conversion job. All commands are run from the project root.

### Task Tracker

- [ ] **`video-upload-service`: Database Integration:**
    - [ ] Add TypeORM, `pg`, and `@nestjs/typeorm` to the `video-upload-service` workspace.
      ```shell
      pnpm add @nestjs/typeorm typeorm pg --filter video-upload-service
      ```
    - [ ] Configure the `video-upload-service` module to connect to the PostgreSQL Docker container.
    - [ ] Create a `Video` entity.
    - [ ] Use TypeORM's `synchronize: true` for development.

- [ ] **`video-upload-service`: Storage Integration:**
    - [ ] Add the AWS S3 client library to the workspace.
      ```shell
      pnpm add @aws-sdk/client-s3 --filter video-upload-service
      ```
    - [ ] Create a `StorageService` configured to connect to the MinIO container.

- [ ] **`video-upload-service`: API Endpoint:**
    - [ ] Create a new controller in `video-upload-service`.
    *   [ ] Implement a `POST` endpoint for `multipart/form-data`.
    *   [ ] Add logic to stream the file to the `videos-raw` MinIO bucket.
    *   [ ] Save a new record to the `videos` table with a `PENDING` status.

- [ ] **`video-upload-service`: Job Publishing:**
    - [ ] Add RabbitMQ client libraries to the workspace.
      ```shell
      pnpm add amqplib @nestjs/microservices --filter video-upload-service
      ```
    - [ ] Configure the service to connect to the RabbitMQ container.
    - [ ] After saving the DB record, publish a message to `video_processing_queue` with the `videoId`.

- [ ] **`api-gateway`: Proxy Setup:**
    - [ ] Configure `api-gateway` to proxy `/upload` requests to the `video-upload-service`.

- [ ] **Checkpoint Testing:**
    - [ ] Use an API client (Postman/Insomnia) to send a video file to the `/upload` endpoint.
    - [ ] **Verify:**
        - [ ] The file is in the `videos-raw` MinIO bucket.
        - [ ] A new record is in the `videos` PostgreSQL table.
        - [ ] A message is in the `video_processing_queue` in the RabbitMQ UI.
