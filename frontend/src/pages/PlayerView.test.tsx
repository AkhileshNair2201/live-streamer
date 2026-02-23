import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import PlayerView from './PlayerView';

vi.mock('axios');
vi.mock('react-player', () => ({
  default: ({ src }: { src: string }) => <div data-testid="player">{src}</div>,
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
  return {
    ...actual,
    useParams: () => ({ videoId: 'video-1' }),
  };
});

describe('PlayerView', () => {
  let timeoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    const originalSetTimeout = window.setTimeout;
    timeoutSpy = vi
      .spyOn(window, 'setTimeout')
      .mockImplementation(
        ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
          if (timeout === 4000 && typeof handler === 'function') {
            handler(...args);
            return 0 as unknown as number;
          }
          return originalSetTimeout(handler, timeout, ...args);
        }) as typeof window.setTimeout,
      );
  });

  afterEach(() => {
    timeoutSpy.mockRestore();
  });

  it('polls status and renders player when completed', async () => {
    vi.mocked(axios.get)
      .mockResolvedValueOnce({
        data: {
          id: 'video-1',
          status: 'PENDING',
          hlsPath: null,
          storageKey: 'k',
          originalFileName: 'a.mp4',
        },
      })
      .mockResolvedValueOnce({
        data: {
          id: 'video-1',
          status: 'COMPLETED',
          hlsPath: 'video-1/index.m3u8',
          storageKey: 'k',
          originalFileName: 'a.mp4',
        },
      });

    render(<PlayerView />);

    await waitFor(() => {
      expect(vi.mocked(axios.get)).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('player')).toHaveTextContent(
        'http://localhost:3001/hls/video-1/index.m3u8',
      );
    });
  });
});
