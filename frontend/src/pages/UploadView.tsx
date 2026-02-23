import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import ReactPlayer from 'react-player';

type UploadResponse = {
  videoId: string;
  status: string;
  storageKey: string;
};

type VideoStatusResponse = {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | string;
  hlsPath: string | null;
  storageKey: string;
  originalFileName: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export default function UploadView() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatusResponse | null>(
    null,
  );

  const progressLabel = useMemo(() => `${Math.min(100, Math.max(0, Math.round(progress)))}%`, [progress]);

  useEffect(() => {
    if (!activeVideoId) {
      return;
    }

    let active = true;
    let timer: number | null = null;

    const fetchStatus = async () => {
      try {
        const response = await axios.get<VideoStatusResponse>(
          `${API_BASE_URL}/videos/${activeVideoId}`,
        );
        if (!active) {
          return;
        }

        setVideoStatus(response.data);

        if (
          response.data.status !== 'COMPLETED' &&
          response.data.status !== 'FAILED'
        ) {
          timer = window.setTimeout(fetchStatus, 4000);
        }
      } catch {
        if (active) {
          setError('Failed to fetch uploaded video status.');
        }
      }
    };

    void fetchStatus();

    return () => {
      active = false;
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [activeVideoId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError('Please select a video file first.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);
    setActiveVideoId(null);
    setVideoStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<UploadResponse>(`${API_BASE_URL}/upload`, formData, {
        onUploadProgress: (uploadEvent) => {
          const total = uploadEvent.total ?? file.size;
          if (total > 0) {
            setProgress((uploadEvent.loaded / total) * 100);
          }
        },
      });

      const videoId = response.data?.videoId;
      if (!videoId) {
        setError('Upload succeeded but no videoId was returned by the backend.');
        setIsUploading(false);
        return;
      }

      setActiveVideoId(videoId);
      setIsUploading(false);
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError)) {
        const message =
          typeof caughtError.response?.data === 'string'
            ? caughtError.response.data
            : caughtError.response?.data?.message;
        setError(message ?? `Upload failed with status ${caughtError.response?.status ?? 'unknown'}.`);
      } else {
        setError('Upload failed. Please check backend services and try again.');
      }
      setIsUploading(false);
    }
  }

  let playbackUrl: string | null = null;
  if (videoStatus?.id && videoStatus?.hlsPath) {
    const fileName = videoStatus.hlsPath.split('/').pop() ?? 'index.m3u8';
    playbackUrl = `${API_BASE_URL}/hls/${videoStatus.id}/${fileName}`;
  }

  return (
    <main className="page-shell">
      <section className="surface-card">
        <div className="page-head">
          <p className="eyebrow">Phase 7 Upload Flow</p>
          <h1>Upload and Auto-Play</h1>
          <p>Upload a video and stay on this page while processing completes.</p>
          <a className="nav-link" href="/">
            Go to library
          </a>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <label htmlFor="videoFile" className="file-label">
            Video file
          </label>
          <input
            id="videoFile"
            type="file"
            accept="video/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            disabled={isUploading}
          />

          <button type="submit" disabled={isUploading || !file}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>

        {isUploading && (
          <div className="progress-wrap" aria-live="polite">
            <div className="progress-text">Upload progress: {progressLabel}</div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: progressLabel }} />
            </div>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        {activeVideoId && (
          <p className="muted-text">
            Current video ID: <code>{activeVideoId}</code>
          </p>
        )}

        {!error && videoStatus?.status === 'PENDING' && (
          <p className="muted-text">Processing in progress. This page will auto-refresh the status.</p>
        )}

        {!error && videoStatus?.status === 'FAILED' && (
          <p className="error-text">Processing failed. Please upload again.</p>
        )}

        {!error && videoStatus?.status === 'COMPLETED' && playbackUrl && (
          <div className="player-block">
            <p className="muted-text">
              Stream ready: <code>{playbackUrl}</code>
            </p>
            <div className="player-wrap">
              <ReactPlayer src={playbackUrl} controls width="100%" height="100%" />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
