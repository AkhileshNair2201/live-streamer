import { Test, TestingModule } from '@nestjs/testing';
import { VideoProcessingWorkerController } from './video-processing-worker.controller';
import { VideoProcessingWorkerService } from './video-processing-worker.service';

describe('VideoProcessingWorkerController', () => {
  let videoProcessingWorkerController: VideoProcessingWorkerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [VideoProcessingWorkerController],
      providers: [
        {
          provide: VideoProcessingWorkerService,
          useValue: {
            getHello: () => 'Hello World!',
          },
        },
      ],
    }).compile();

    videoProcessingWorkerController = app.get<VideoProcessingWorkerController>(
      VideoProcessingWorkerController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(videoProcessingWorkerController.getHello()).toBe('Hello World!');
    });
  });
});
