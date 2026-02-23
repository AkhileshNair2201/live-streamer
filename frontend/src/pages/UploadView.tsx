import axios from 'axios';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

type UploadResponse = {
  videoId: string;
  status: string;
  storageKey: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export default function UploadView() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progressLabel = useMemo(() => `${Math.min(100, Math.max(0, Math.round(progress)))}%`, [progress]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError('Please select a video file first.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);

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

      const target = `/watch/${videoId}`;
      navigate(target);

      // Fallback for cases where router navigation is blocked/interrupted.
      window.setTimeout(() => {
        if (window.location.pathname !== target) {
          window.location.assign(target);
        }
      }, 0);
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

  return (
    <main className="page-shell">
      <section className="upload-card">
        <h1>Upload Video</h1>
        <p>Choose a file and send it to the conversion pipeline.</p>

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
      </section>
    </main>
  );
}
