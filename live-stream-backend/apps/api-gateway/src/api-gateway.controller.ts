import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApiGatewayService } from './api-gateway.service';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get()
  getHello(): string {
    return this.apiGatewayService.getHello();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File): Promise<unknown> {
    return this.apiGatewayService.proxyUpload(file);
  }

  @Get('videos/:id')
  getVideo(@Param('id') id: string): Promise<unknown> {
    return this.apiGatewayService.getVideoStatus(id);
  }

  @Get('hls/:videoId/:fileName')
  async getHlsFile(
    @Param('videoId') videoId: string,
    @Param('fileName') fileName: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { stream, contentType } = await this.apiGatewayService.getHlsFile(
      videoId,
      fileName,
    );
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache');
    return new StreamableFile(stream);
  }
}
