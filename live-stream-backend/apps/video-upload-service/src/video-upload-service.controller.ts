import { Controller, Get } from '@nestjs/common';
import { VideoUploadServiceService } from './video-upload-service.service';

@Controller()
export class VideoUploadServiceController {
  constructor(private readonly videoUploadServiceService: VideoUploadServiceService) {}

  @Get()
  getHello(): string {
    return this.videoUploadServiceService.getHello();
  }
}
