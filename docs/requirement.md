# LiveStream Convertor: Product & System Design Requirements

## 1. Introduction

This document outlines the requirements for the "LiveStream Convertor," an MVP (Minimum Viable Product) designed as a learning opportunity for product and system design. The goal is to build a tool that transforms standard video files into the HLS (HTTP Live Streaming) format, making them suitable for adaptive bitrate streaming across various devices.

The project will be approached from the perspective of a senior backend engineer, emphasizing robust, scalable, and maintainable architecture.

## 2. User Stories

*   **As a content creator,** I want to upload a video file through a simple web interface so that I can prepare it for live streaming.
*   **As a content creator,** I want the system to convert my uploaded video into multiple resolutions so that my viewers can have a smooth streaming experience regardless of their internet speed.
*   **As a content creator,** I want to receive a streamable URL (HLS playlist file) after the conversion is complete so that I can embed it in my website or streaming platform.
*   **As a developer,** I want to understand the system architecture and design choices so that I can learn about building scalable media processing pipelines.

## 3. Functional Requirements

### 3.1. Web Interface
The web application will have two primary views:

#### 3.1.1. Upload View
*   This view will feature a simple interface for the user to select and upload a standard video file (e.g., MP4, MOV, AVI).
*   A progress bar must be displayed to show the upload status.
*   After the upload is complete, the user should be redirected to the Player View or given a link to it.

#### 3.1.2. Player View
*   This view will be dedicated to playing the converted HLS stream.
*   It should include a basic video player to preview the stream.
*   The HLS playlist URL (`.m3u8`) will be displayed for the user to copy.

### 3.2. HLS Conversion
*   The backend must process the uploaded video file and convert it into the HLS format.
*   The conversion process must generate multiple renditions of the video at different resolutions (e.g., 480p, 720p, 1080p).
*   The output must be a master HLS playlist file (`.m3u8`) that references the different resolution-specific playlists.

### 3.3. Output & Playback
*   Upon successful conversion, the system shall make the HLS playlist URL available in the Player View.

## 4. Non-Functional Requirements

*   **Scalability:** The system should be designed to handle multiple concurrent video conversion requests.
*   **Reliability:** The conversion process should be resilient to failures and have a mechanism for retries.
*   **Usability:** The web interface should be intuitive and easy to use.
*   **Performance:** The time taken for video conversion should be optimized.

## 5. System Design & Architectural Considerations (Learning Focus)

This section outlines a potential system design, keeping in mind the learning objectives of the project.

### 5.1. Proposed Architecture: Microservices
A microservices architecture is recommended to decouple the different concerns of the system.

*   **Frontend Service:** A React-based single-page application (SPA) that provides the user interface.
*   **API Gateway:** A gateway to route requests from the frontend to the appropriate backend services.
*   **Video Upload Service:** A service responsible for handling file uploads and storing the original video file.
*   **Video Processing Service:** A worker service that performs the HLS conversion. This service would be computationally intensive.
*   **Notification Service:** (Optional) A service to notify the user when the conversion is complete (e.g., via WebSockets or email).

### 5.2. Technology Stack & Rationale

*   **Backend:** **NestJS** is the recommended framework for building the backend services. Its modular architecture, support for microservices, and strong typing with TypeScript make it an excellent choice for building maintainable and scalable systems.
*   **Frontend:** **React** with TypeScript for a modern, component-based UI.
*   **Storage:**
    *   **AWS S3** (or equivalent object storage) is ideal for storing the original video files and the generated HLS segments.
    *   A **PostgreSQL** database can be used to store metadata about the videos, users, and conversion jobs.
*   **Video Processing:** **FFmpeg** is the industry-standard tool for video and audio processing and should be used for the HLS conversion. The Video Processing Service would wrap FFmpeg in a NodeJS environment.
*   **Asynchronous Processing:** A message queue (like **RabbitMQ** or **AWS SQS**) should be used to communicate between the Video Upload Service and the Video Processing Service. This decouples the services and allows for better scalability and reliability.

### 5.3. High-Level Workflow
1.  User uploads a video file via the React frontend.
2.  The Frontend sends the file to the Video Upload Service.
3.  The Video Upload Service stores the file in an S3 bucket and creates a new job entry in the PostgreSQL database with a "pending" status.
4.  The Video Upload Service sends a message to the message queue with the job details.
5.  The Video Processing Service picks up the message from the queue.
6.  It downloads the video from S3, performs the HLS conversion using FFmpeg, and uploads the HLS segments and playlists back to S3.
7.  Upon completion, it updates the job status in the PostgreSQL database to "completed" and stores the HLS playlist URL.
8.  The frontend can poll the API for the job status or receive a real-time update via the Notification Service.

## 6. MVP Scope

The initial MVP will focus on the core functionality:

*   A simple web interface for uploading a single video file.
*   Backend processing to convert the video to HLS with a fixed set of resolutions (e.g., 480p, 720p).
*   Displaying the HLS stream URL to the user upon completion.
*   A basic video player for preview.

**Out of Scope for MVP:**
*   User accounts and authentication.
*   Custom resolution selection.
*   Advanced error handling and retries.
*   Real-time notifications.

## 7. Tech Stack Recommendations

*   **Frontend:** React, TypeScript, CSS
*   **Backend:** NodeJS, NestJS, TypeScript
*   **Database:** PostgreSQL
*   **Storage:** AWS S3 (or MinIO for local development)
*   **Messaging:** RabbitMQ (or a similar message broker)
*   **Video Processing:** FFmpeg
*   **Containerization & Local Development:** Docker & Docker Compose. All backend services (PostgreSQL, RabbitMQ, MinIO, etc.) should be managed via a `docker-compose.yml` file to ensure a consistent and easy-to-manage local development environment.
