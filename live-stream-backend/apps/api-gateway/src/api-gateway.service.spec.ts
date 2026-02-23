import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ApiGatewayService } from './api-gateway.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiGatewayService', () => {
  let service: ApiGatewayService;

  beforeEach(() => {
    jest.clearAllMocks();

    const configService = {
      get: jest.fn((key: string, defaultValue: string) => {
        if (key === 'VIDEO_UPLOAD_SERVICE_URL') {
          return 'http://upload-service:3002';
        }
        return defaultValue;
      }),
    } as unknown as ConfigService;

    service = new ApiGatewayService(configService);
  });

  it('throws when upload file is missing', async () => {
    await expect(
      service.proxyUpload(undefined as unknown as Express.Multer.File),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns data from status proxy endpoint', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { id: 'video-1', status: 'PENDING', hlsPath: null },
    });

    const result = await service.getVideoStatus('video-1');

    expect(mockedAxios.get.mock.calls[0]).toEqual([
      'http://upload-service:3002/videos/video-1',
    ]);
    expect(result).toEqual({
      id: 'video-1',
      status: 'PENDING',
      hlsPath: null,
    });
  });

  it('returns data from list videos proxy endpoint', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        { id: 'video-2', status: 'COMPLETED', hlsPath: 'video-2/index.m3u8' },
      ],
    });

    const result = await service.getVideos();

    expect(mockedAxios.get.mock.calls[0]).toEqual([
      'http://upload-service:3002/videos',
    ]);
    expect(result).toEqual([
      { id: 'video-2', status: 'COMPLETED', hlsPath: 'video-2/index.m3u8' },
    ]);
  });
});
