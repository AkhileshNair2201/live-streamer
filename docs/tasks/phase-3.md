# Phase 3: Backend - Video Processing Worker

**Goal:** Implement the worker to process the video into HLS format. All commands are run from the project root.

### Task Tracker

- [ ] **`video-processing-worker`: Add Dependencies:**
    - [ ] Add necessary libraries for message consumption, DB access, and storage to the `video-processing-worker` workspace.
      ```shell
      pnpm add amqplib @nestjs/microservices @nestjs/typeorm typeorm pg @aws-sdk/client-s3 --filter video-processing-worker
      ```

- [ ] **`video-processing-worker`: Job Consumption:**
    - [ ] Configure the worker as a NestJS microservice to connect to RabbitMQ and subscribe to the `video_processing_queue`.
    - [ ] Create a handler that receives and acknowledges messages.

- [ ] **`video-processing-worker`: FFmpeg Integration:**
    - [ ] Ensure `ffmpeg` is installed in your local environment's PATH.
    - [ ] Create a service that uses Node.js's `child_process` to execute `ffmpeg` commands.

- [ ] **`video-processing-worker`: Processing Logic:**
    - [ ] **Fetch Job:** On message receipt, fetch the video record from PostgreSQL.
    - [ ] **Download Video:** Download the raw video from the `videos-raw` MinIO bucket.
    - [ ] **Execute FFmpeg:** Run `ffmpeg` to create HLS renditions.
    - [ ] **Upload HLS Files:** Upload the resulting `.m3u8` and `.ts` files to the `videos-processed` MinIO bucket.
    - [ ] **Update Job Status:** Update the video's record in the database with `status='COMPLETED'` and the `hlsPath`.

- [ ] **Checkpoint Testing:**
    - [ ] Trigger a job by uploading a video (as in Phase 2).
    - [ ] **Verify:**
        - [ ] The worker's logs show a job was processed.
        - [ ] HLS files appear in the `videos-processed` MinIO bucket.
        - [ ] The video's status in PostgreSQL is updated to `COMPLETED`.
