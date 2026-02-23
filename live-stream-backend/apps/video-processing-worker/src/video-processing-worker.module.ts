import { Module } from '@nestjs/common';
import { VideoProcessingWorkerController } from './video-processing-worker.controller';
import { VideoProcessingWorkerService } from './video-processing-worker.service';

@Module({
  imports: [],
  controllers: [VideoProcessingWorkerController],
  providers: [VideoProcessingWorkerService],
})
export class VideoProcessingWorkerModule {}
