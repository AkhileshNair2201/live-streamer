import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import UploadView from './UploadView';

const navigateMock = vi.fn();
const assignMock = vi.fn();

vi.mock('axios');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const mockedAxios = axios as unknown as {
  post: ReturnType<typeof vi.fn>;
};

describe('UploadView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { pathname: '/', assign: assignMock },
      writable: true,
    });
  });

  it('uploads file and navigates to watch page', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: {
        videoId: 'video-123',
        status: 'PENDING',
        storageKey: 'storage-key',
      },
    });

    render(<UploadView />);

    const input = screen.getByLabelText(/video file/i) as HTMLInputElement;
    const file = new File(['dummy'], 'video.mp4', { type: 'video/mp4' });
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /upload/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/watch/video-123');
    });
  });
});
