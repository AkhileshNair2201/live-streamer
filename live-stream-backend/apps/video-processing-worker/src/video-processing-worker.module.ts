import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoProcessingWorkerController } from './video-processing-worker.controller';
import { VideoProcessingWorkerService } from './video-processing-worker.service';
import { Video } from './video.entity';

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
  controllers: [VideoProcessingWorkerController],
  providers: [VideoProcessingWorkerService],
})
export class VideoProcessingWorkerModule {}
