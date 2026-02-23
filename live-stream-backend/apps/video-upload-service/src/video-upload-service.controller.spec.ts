import { Test, TestingModule } from '@nestjs/testing';
import { VideoUploadServiceController } from './video-upload-service.controller';
import { VideoUploadServiceService } from './video-upload-service.service';

describe('VideoUploadServiceController', () => {
  let videoUploadServiceController: VideoUploadServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [VideoUploadServiceController],
      providers: [VideoUploadServiceService],
    }).compile();

    videoUploadServiceController = app.get<VideoUploadServiceController>(VideoUploadServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(videoUploadServiceController.getHello()).toBe('Hello World!');
    });
  });
});
