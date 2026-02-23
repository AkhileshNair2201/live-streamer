import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import UploadView from './UploadView';

vi.mock('axios');
vi.mock('react-player', () => ({
  default: ({ src }: { src: string }) => <div data-testid="player">{src}</div>,
}));

const mockedAxios = axios as unknown as {
  post: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
};

describe('UploadView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads file and auto-renders player after completion', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: {
        videoId: 'video-123',
        status: 'PENDING',
        storageKey: 'storage-key',
      },
    });
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: {
        id: 'video-123',
        status: 'COMPLETED',
        hlsPath: 'video-123/index.m3u8',
        storageKey: 'storage-key',
        originalFileName: 'video.mp4',
      },
    });

    render(<UploadView />);

    const input = screen.getByLabelText(/video file/i) as HTMLInputElement;
    const file = new File(['dummy'], 'video.mp4', { type: 'video/mp4' });
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /upload/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3001/videos/video-123',
      );
      expect(screen.getByTestId('player')).toHaveTextContent(
        'http://localhost:3001/hls/video-123/index.m3u8',
      );
    });
  });
});
