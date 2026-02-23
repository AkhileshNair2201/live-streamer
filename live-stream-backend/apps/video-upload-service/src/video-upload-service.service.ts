import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { StorageService } from './storage.service';
import { Video, VideoStatus } from './video.entity';
import { VideoJobPublisherService } from './video-job-publisher.service';

@Injectable()
export class VideoUploadServiceService {
  constructor(
    @InjectRepository(Video)
    private readonly videosRepository: Repository<Video>,
    private readonly storageService: StorageService,
    private readonly videoJobPublisher: VideoJobPublisherService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async uploadVideo(
    file: Express.Multer.File,
  ): Promise<{ videoId: string; status: VideoStatus; storageKey: string }> {
    if (!file) {
      throw new BadRequestException(
        'No file provided. Use multipart/form-data with field name "file".',
      );
    }

    const storageKey = this.buildStorageKey(file.originalname);
    await this.storageService.uploadRawVideo(
      storageKey,
      file.buffer,
      file.mimetype,
    );

    const video = this.videosRepository.create({
      originalFileName: file.originalname,
      storageKey,
      status: VideoStatus.PENDING,
      hlsPath: null,
    });
    const saved = await this.videosRepository.save(video);

    await this.videoJobPublisher.publishVideoProcessingJob(saved.id);

    return {
      videoId: saved.id,
      status: saved.status,
      storageKey: saved.storageKey,
    };
  }

  private buildStorageKey(originalName: string): string {
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${randomUUID()}/${Date.now()}-${safeName}`;
  }
}
