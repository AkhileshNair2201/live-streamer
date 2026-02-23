import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoUploadServiceController } from './video-upload-service.controller';
import { VideoUploadServiceService } from './video-upload-service.service';
import { Video } from './video.entity';
import { StorageService } from './storage.service';
import { VideoJobPublisherService } from './video-job-publisher.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5434),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'live_stream',
      entities: [Video],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Video]),
  ],
  controllers: [VideoUploadServiceController],
  providers: [
    VideoUploadServiceService,
    StorageService,
    VideoJobPublisherService,
  ],
})
export class VideoUploadServiceModule {}
