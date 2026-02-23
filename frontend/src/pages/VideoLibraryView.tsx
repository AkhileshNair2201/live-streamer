import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import ReactPlayer from 'react-player';

type VideoSummary = {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | string;
  hlsPath: string | null;
  storageKey: string;
  originalFileName: string;
  createdAt?: string;
  updatedAt?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

function formatDate(value?: string): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function VideoLibraryView() {
  const [videos, setVideos] = useState<VideoSummary[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedPlaybackUrl = useMemo(() => {
    if (!selectedVideo?.hlsPath) {
      return null;
    }

    const fileName = selectedVideo.hlsPath.split('/').pop() ?? 'index.m3u8';
    return `${API_BASE_URL}/hls/${selectedVideo.id}/${fileName}`;
  }, [selectedVideo]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get<VideoSummary[]>(`${API_BASE_URL}/videos`);
        setVideos(Array.isArray(response.data) ? response.data : []);
      } catch {
        setError('Failed to load videos. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    void fetchVideos();
  }, []);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedVideo(null);
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => {
      window.removeEventListener('keydown', onEscape);
    };
  }, []);

  return (
    <main className="page-shell">
      <section className="surface-card">
        <div className="page-head split-head">
          <div>
            <p className="eyebrow">Phase 7 Library</p>
            <h1>Stored Videos</h1>
            <p>Select a row to open the in-page modal player.</p>
          </div>
          <a className="nav-link" href="/upload">
            Upload new video
          </a>
        </div>

        {loading && <p className="muted-text">Loading video library...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && videos.length === 0 && (
          <p className="muted-text">No videos found yet. Upload one to get started.</p>
        )}

        {!loading && !error && videos.length > 0 && (
          <div className="library-grid" role="list">
            {videos.map((video) => (
              <button
                key={video.id}
                type="button"
                className="video-tile"
                role="listitem"
                aria-label={`Open video ${video.id}`}
                onClick={() => setSelectedVideo(video)}
              >
                <div className="tile-head">
                  <span className={`status-pill status-${video.status.toLowerCase()}`}>
                    {video.status}
                  </span>
                </div>
                <p className="tile-title">{video.originalFileName || 'Unnamed Video'}</p>
                <p className="tile-meta">
                  <code>{video.id}</code>
                </p>
                <p className="tile-meta">Created: {formatDate(video.createdAt)}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedVideo && (
        <div
          className="modal-backdrop"
          role="button"
          tabIndex={0}
          aria-label="Close player modal"
          onClick={() => setSelectedVideo(null)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              setSelectedVideo(null);
            }
          }}
        >
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label="Video playback modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <h2>{selectedVideo.originalFileName || 'Video Preview'}</h2>
              <button
                type="button"
                className="modal-close"
                aria-label="Close modal"
                onClick={() => setSelectedVideo(null)}
              >
                Close
              </button>
            </div>

            <p className="muted-text">
              Video ID: <code>{selectedVideo.id}</code>
            </p>
            <p className="muted-text">Status: {selectedVideo.status}</p>

            {selectedVideo.status !== 'COMPLETED' && (
              <p className="muted-text">
                This video is not ready to stream yet. Current status: {selectedVideo.status}.
              </p>
            )}

            {selectedVideo.status === 'COMPLETED' && selectedPlaybackUrl && (
              <div className="player-wrap">
                <ReactPlayer src={selectedPlaybackUrl} controls width="100%" height="100%" />
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
