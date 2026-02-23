import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from './storage.service';
import { Video, VideoStatus } from './video.entity';
import { VideoJobPublisherService } from './video-job-publisher.service';
import { VideoUploadServiceService } from './video-upload-service.service';

describe('VideoUploadServiceService', () => {
  let service: VideoUploadServiceService;

  const repositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const storageMock = {
    uploadRawVideo: jest.fn(),
  };

  const jobPublisherMock = {
    publishVideoProcessingJob: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoUploadServiceService,
        {
          provide: getRepositoryToken(Video),
          useValue: repositoryMock as Partial<Repository<Video>>,
        },
        {
          provide: StorageService,
          useValue: storageMock,
        },
        {
          provide: VideoJobPublisherService,
          useValue: jobPublisherMock,
        },
      ],
    }).compile();

    service = module.get<VideoUploadServiceService>(VideoUploadServiceService);
  });

  it('throws when file is missing', async () => {
    await expect(
      service.uploadVideo(undefined as unknown as Express.Multer.File),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates pending video and publishes job', async () => {
    const file = {
      originalname: 'test.mp4',
      buffer: Buffer.from('video'),
      mimetype: 'video/mp4',
    } as Express.Multer.File;

    repositoryMock.create.mockImplementation((input: Partial<Video>) => ({
      id: 'video-1',
      ...input,
    }));
    repositoryMock.save.mockResolvedValue({
      id: 'video-1',
      status: VideoStatus.PENDING,
      storageKey: 'some-storage-key',
    });

    const result = await service.uploadVideo(file);

    expect(storageMock.uploadRawVideo).toHaveBeenCalled();
    expect(repositoryMock.create).toHaveBeenCalled();
    expect(repositoryMock.save).toHaveBeenCalled();
    expect(jobPublisherMock.publishVideoProcessingJob).toHaveBeenCalledWith(
      'video-1',
    );
    expect(result.videoId).toBe('video-1');
    expect(result.status).toBe(VideoStatus.PENDING);
  });
});
