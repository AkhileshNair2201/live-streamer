# Phase 4: Frontend - Project Setup & Upload View

**Goal:** Create the user-facing interface for uploading videos, managed within the root pnpm workspace. All commands are run from the project root.

### Task Tracker

- [x] **Scaffold Frontend Project:**
    - [x] At the project root, run `pnpm create vite frontend --template react-ts`.
    - [x] The `pnpm-workspace.yaml` file is configured to recognize the `frontend` directory.
    - [x] Run `pnpm install` from the root to link the new workspace package.

- [x] **Add Frontend Dependencies:**
    - [x] Add `axios` and `react-router-dom` to the `frontend` workspace.
      ```shell
      pnpm add axios react-router-dom --filter frontend
      ```

- [x] **Create Upload UI Component:**
    - [x] In the `frontend` project, create a new `pages` directory.
    - [x] Develop an `UploadView.tsx` component with a file input and submit button.

- [x] **Implement Upload Logic:**
    - [x] In `UploadView.tsx`, create a form handler.
    - [x] On submit, construct a `FormData` object.
    - [x] Use `axios` to `POST` the `FormData` to the backend.
    - [x] Implement an `onUploadProgress` handler to display the upload percentage.

- [x] **Setup Routing:**
    - [x] Configure `react-router-dom` in `frontend/src/App.tsx`.
    - [x] Set the default route (`/`) to `UploadView`.
    - [x] After a successful upload, navigate the user to `/watch/{videoId}`.

- [x] **Checkpoint Testing:**
    - [x] Run the frontend dev server from the root: `pnpm --filter frontend dev`.
    - [x] Open the app, select a video, and upload it.
    - [x] **Verify:**
        - [x] The upload progress bar updates.
        - [x] The backend processes the file.
        - [x] The browser redirects to `/watch/some-id`.
