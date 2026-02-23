# Phase 7: UI Revamp - Unified Upload + Library Experience

**Goal:** Redesign the frontend UX with a modern flow: default landing on a video library page, plus a dedicated upload-and-watch page. All commands are run from the project root.

### Task Tracker

- [x] **Routing & Navigation:**
    - [x] Updated routes so `/` lands on the **Video Listing** page by default.
    - [x] Added separate **Upload + Processing** page at `/upload`.
    - [x] Added clear navigation between listing and upload pages.

- [x] **Page 1: Upload + Auto-Load Player (Single Page Flow):**
    - [x] Revamped upload page UI/UX (layout, hierarchy, status feedback, error states).
    - [x] Kept upload action on this page and show progress states.
    - [x] After upload, poll processing status on the same page.
    - [x] Once processing is complete, automatically load and play the video on the same page.
    - [x] Added states for `PENDING`, `FAILED`, and retry guidance.

- [x] **Page 2: Video Listing (Default Landing):**
    - [x] Built a listing page that fetches and displays stored videos.
    - [x] Each item displays key metadata (`videoId`, status, filename, created time).
    - [x] Added loading, empty, and error states for the listing page.

- [x] **Modal Playback on Listing Page:**
    - [x] Clicking a video in the list opens a modal overlay on the same page.
    - [x] Modal contains the player and streams completed videos.
    - [x] Supports modal close actions (close button, backdrop click, and `Esc` key).
    - [x] Preserves listing page context while modal is open/closed.

- [x] **Backend Support for Listing (if missing):**
    - [x] Added/confirmed endpoint to fetch all videos (`GET /videos`).
    - [x] Response includes fields needed by listing UI and modal playback.
    - [x] API errors continue using standardized error response shape.

- [x] **UX/Polish:**
    - [x] Improved visual consistency (spacing, typography, cards, interaction states).
    - [x] Added responsive behavior for desktop and mobile.
    - [x] Kept accessibility basics: semantic headings, keyboard close for modal, aria labels.

- [x] **Checkpoint Testing:**
    - [x] Verified default route opens video listing page.
    - [x] Verified upload page can upload and auto-play once processing completes.
    - [x] Verified listing loads existing videos.
    - [x] Verified clicking a list item opens modal and plays video.
    - [x] Verified modal close interactions and return to listing context.
