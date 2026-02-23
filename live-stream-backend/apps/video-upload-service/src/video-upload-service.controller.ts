import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoUploadServiceService } from './video-upload-service.service';

@Controller()
export class VideoUploadServiceController {
  constructor(
    private readonly videoUploadServiceService: VideoUploadServiceService,
  ) {}

  @Get()
  getHello(): string {
    return this.videoUploadServiceService.getHello();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ videoId: string; status: string; storageKey: string }> {
    return this.videoUploadServiceService.uploadVideo(file);
  }

  @Get('videos')
  getVideos(): Promise<
    Array<{
      id: string;
      status: string;
      hlsPath: string | null;
      storageKey: string;
      originalFileName: string;
      createdAt: string;
      updatedAt: string;
    }>
  > {
    return this.videoUploadServiceService.getVideos();
  }

  @Get('videos/:id')
  getVideo(@Param('id') id: string): Promise<{
    id: string;
    status: string;
    hlsPath: string | null;
    storageKey: string;
    originalFileName: string;
  }> {
    return this.videoUploadServiceService.getVideoById(id);
  }
}
