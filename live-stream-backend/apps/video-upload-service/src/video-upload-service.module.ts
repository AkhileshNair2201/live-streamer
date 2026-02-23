import { Module } from '@nestjs/common';
import { VideoUploadServiceController } from './video-upload-service.controller';
import { VideoUploadServiceService } from './video-upload-service.service';

@Module({
  imports: [],
  controllers: [VideoUploadServiceController],
  providers: [VideoUploadServiceService],
})
export class VideoUploadServiceModule {}
