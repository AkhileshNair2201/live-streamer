import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import UploadView from './pages/UploadView';
import PlayerView from './pages/PlayerView';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadView />} />
      <Route path="/watch/:videoId" element={<PlayerView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
