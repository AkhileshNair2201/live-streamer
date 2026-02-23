# Phase 5: Frontend - Player View

**Goal:** Build the view to watch the converted video stream. All commands are run from the project root.

### Task Tracker

- [x] **Create Player UI Component:**
    - [x] In the `frontend` project, develop a `PlayerView.tsx` component.
    - [x] Use the `useParams` hook from `react-router-dom` to get the `videoId` from the URL.

- [x] **Backend: Create Status Endpoint:**
    - [x] In the `api-gateway` app, create a `GET /videos/:id` endpoint.
    - [x] This endpoint fetches and returns the video record (including `status` and `hlsPath`).

- [x] **Frontend: Implement Status Polling:**
    - [x] In `PlayerView.tsx`, use a `useEffect` hook to poll the `/videos/:id` endpoint.
    - [x] Set an interval to re-fetch the status every 3-5 seconds.
    - [x] Display a loading message while `status` is not `COMPLETED`.
    - [x] Clear the interval once `status` is `COMPLETED`.

- [x] **Integrate HLS Player:**
    - [x] Add `react-player` and `hls.js` to the `frontend` workspace.
      ```shell
      pnpm add react-player hls.js --filter frontend
      ```
    - [x] When the video status is `COMPLETED`, render the `ReactPlayer` component and pass the HLS URL to its `src` prop.

- [ ] **Checkpoint Testing:**
    - [ ] Upload a video and get redirected to the player view.
    - [ ] **Verify:**
        - [ ] A "processing" message is displayed.
        - [ ] The message is replaced by a video player after a short time.
        - [ ] The video player successfully loads and plays the HLS stream.
