import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import UploadView from './pages/UploadView';
import VideoLibraryView from './pages/VideoLibraryView';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<VideoLibraryView />} />
      <Route path="/upload" element={<UploadView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
