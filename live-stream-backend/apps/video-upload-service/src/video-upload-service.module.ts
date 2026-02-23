import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoUploadServiceController } from './video-upload-service.controller';
import { VideoUploadServiceService } from './video-upload-service.service';
import { Video } from './video.entity';
import { StorageService } from './storage.service';
import { VideoJobPublisherService } from './video-job-publisher.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '5434')),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'live_stream'),
        entities: [Video],
        synchronize: true,
      }),
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
