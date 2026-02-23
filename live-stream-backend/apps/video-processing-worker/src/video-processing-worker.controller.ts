import { Controller, Get } from '@nestjs/common';
import { VideoProcessingWorkerService } from './video-processing-worker.service';

@Controller()
export class VideoProcessingWorkerController {
  constructor(
    private readonly videoProcessingWorkerService: VideoProcessingWorkerService,
  ) {}

  @Get()
  getHello(): string {
    return this.videoProcessingWorkerService.getHello();
  }
}
