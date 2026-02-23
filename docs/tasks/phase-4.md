# Phase 4: Frontend - Project Setup & Upload View

**Goal:** Create the user-facing interface for uploading videos, managed within the root pnpm workspace. All commands are run from the project root.

### Task Tracker

- [ ] **Scaffold Frontend Project:**
    - [ ] At the project root, run `pnpm create vite frontend --template react-ts`.
    - [ ] The `pnpm-workspace.yaml` file should already be configured to recognize the `frontend` directory.
    - [ ] Run `pnpm install` from the root to link the new workspace package.

- [ ] **Add Frontend Dependencies:**
    - [ ] Add `axios` and `react-router-dom` to the `frontend` workspace.
      ```shell
      pnpm add axios react-router-dom --filter frontend
      ```

- [ ] **Create Upload UI Component:**
    - [ ] In the `frontend` project, create a new `pages` directory.
    - [ ] Develop an `UploadView.tsx` component with a file input and submit button.

- [ ] **Implement Upload Logic:**
    - [ ] In `UploadView.tsx`, create a form handler.
    - [ ] On submit, construct a `FormData` object.
    - [ ] Use `axios` to `POST` the `FormData` to the backend.
    - [ ] Implement an `onUploadProgress` handler to display the upload percentage.

- [ ] **Setup Routing:**
    - [ ] Configure `react-router-dom` in `frontend/src/App.tsx`.
    - [ ] Set the default route (`/`) to `UploadView`.
    - [ ] After a successful upload, navigate the user to `/watch/{videoId}`.

- [ ] **Checkpoint Testing:**
    - [ ] Run the frontend dev server from the root: `pnpm --filter frontend dev`.
    - [ ] Open the app, select a video, and upload it.
    - [ ] **Verify:**
        - [ ] The upload progress bar updates.
        - [ ] The backend processes the file.
        - [ ] The browser redirects to `/watch/some-id`.
