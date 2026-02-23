import { useParams } from 'react-router-dom';

export default function WatchView() {
  const { videoId } = useParams();

  return (
    <main className="page-shell">
      <section className="upload-card">
        <h1>Upload Accepted</h1>
        <p>Video ID: <code>{videoId}</code></p>
        <p>Player view and processing status polling will be implemented in Phase 5.</p>
      </section>
    </main>
  );
}
