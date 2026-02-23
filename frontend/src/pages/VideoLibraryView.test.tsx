import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import VideoLibraryView from './VideoLibraryView';

vi.mock('axios');
vi.mock('react-player', () => ({
  default: ({ src }: { src: string }) => <div data-testid="player">{src}</div>,
}));

const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
};

describe('VideoLibraryView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads videos and opens modal player', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'video-1',
          status: 'COMPLETED',
          hlsPath: 'video-1/index.m3u8',
          storageKey: 'key',
          originalFileName: 'sample.mp4',
          createdAt: '2026-02-24T01:00:00.000Z',
          updatedAt: '2026-02-24T01:05:00.000Z',
        },
      ],
    });

    render(<VideoLibraryView />);

    expect(await screen.findByText('sample.mp4')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('listitem', { name: /open video video-1/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('player')).toHaveTextContent(
        'http://localhost:3001/hls/video-1/index.m3u8',
      );
    });
  });
});
