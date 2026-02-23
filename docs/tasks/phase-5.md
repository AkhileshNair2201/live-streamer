# Phase 5: Frontend - Player View

**Goal:** Build the view to watch the converted video stream. All commands are run from the project root.

### Task Tracker

- [ ] **Create Player UI Component:**
    - [ ] In the `frontend` project, develop a `PlayerView.tsx` component.
    - [ ] Use the `useParams` hook from `react-router-dom` to get the `videoId` from the URL.

- [ ] **Backend: Create Status Endpoint:**
    - [ ] In the `api-gateway` app, create a `GET /videos/:id` endpoint.
    - [ ] This endpoint should fetch and return the video record (including `status` and `hlsPath`).

- [ ] **Frontend: Implement Status Polling:**
    - [ ] In `PlayerView.tsx`, use a `useEffect` hook to poll the `/videos/:id` endpoint.
    - [ ] Set an interval to re-fetch the status every 3-5 seconds.
    - [ ] Display a loading message while `status` is not `COMPLETED`.
    - [ ] Clear the interval once `status` is `COMPLETED`.

- [ ] **Integrate HLS Player:**
    - [ ] Add `react-player` and `hls.js` to the `frontend` workspace.
      ```shell
      pnpm add react-player hls.js --filter frontend
      ```
    - [ ] When the video status is `COMPLETED`, render the `ReactPlayer` component and pass the `hlsPath` to its `url` prop.

- [ ] **Checkpoint Testing:**
    - [ ] Upload a video and get redirected to the player view.
    - [ ] **Verify:**
        - [ ] A "processing" message is displayed.
        - [ ] The message is replaced by a video player after a short time.
        - [ ] The video player successfully loads and plays the HLS stream.
