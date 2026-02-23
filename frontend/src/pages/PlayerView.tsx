import axios from 'axios';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { useParams } from 'react-router-dom';

type VideoStatusResponse = {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | string;
  hlsPath: string | null;
  storageKey: string;
  originalFileName: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export default function PlayerView() {
  const { videoId } = useParams();
  const missingVideoId = !videoId;
  const [videoStatus, setVideoStatus] = useState<VideoStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (missingVideoId) {
      return;
    }

    let active = true;
    let timer: number | null = null;

    const fetchStatus = async () => {
      try {
        const response = await axios.get<VideoStatusResponse>(`${API_BASE_URL}/videos/${videoId}`);
        if (!active) {
          return;
        }

        setVideoStatus(response.data);

        if (response.data.status !== 'COMPLETED') {
          timer = window.setTimeout(fetchStatus, 4000);
        }
      } catch {
        if (active) {
          setError('Failed to fetch video status.');
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
  }, [videoId, missingVideoId]);

  let playbackUrl: string | null = null;
  if (videoStatus?.id && videoStatus?.hlsPath) {
    if (
      videoStatus.hlsPath.startsWith('http://') ||
      videoStatus.hlsPath.startsWith('https://')
    ) {
      playbackUrl = videoStatus.hlsPath;
    } else {
      const fileName = videoStatus.hlsPath.split('/').pop() ?? 'index.m3u8';
      playbackUrl = `${API_BASE_URL}/hls/${videoStatus.id}/${fileName}`;
    }
  }

  return (
    <main className="page-shell">
      <section className="upload-card">
        <h1>Player</h1>
        <p>
          Video ID: <code>{videoId}</code>
        </p>

        {missingVideoId && <p className="error-text">Missing videoId in URL.</p>}

        {error && <p className="error-text">{error}</p>}

        {!error && videoStatus?.status !== 'COMPLETED' && (
          <p>Video is processing. Current status: {videoStatus?.status ?? 'PENDING'}.</p>
        )}

        {!missingVideoId && !error && videoStatus?.status === 'COMPLETED' && playbackUrl && (
          <>
            <p>HLS URL:</p>
            <p>
              <code>{playbackUrl}</code>
            </p>
            <div className="player-wrap">
              <ReactPlayer
                src={playbackUrl}
                controls
                width="100%"
                height="100%"
              />
            </div>
          </>
        )}

        {!error && videoStatus?.status === 'FAILED' && (
          <p className="error-text">Video processing failed. Please upload again.</p>
        )}
      </section>
    </main>
  );
}
