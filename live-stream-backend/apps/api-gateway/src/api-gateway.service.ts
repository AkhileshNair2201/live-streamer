import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import FormData from 'form-data';

@Injectable()
export class ApiGatewayService {
  constructor(private readonly configService: ConfigService) {}

  private get uploadServiceUrl(): string {
    return this.configService.get<string>(
      'VIDEO_UPLOAD_SERVICE_URL',
      'http://localhost:3002',
    );
  }

  getHello(): string {
    return 'Hello World!';
  }

  async proxyUpload(file: Express.Multer.File): Promise<unknown> {
    if (!file) {
      throw new BadRequestException(
        'No file provided. Use multipart/form-data with field name "file".',
      );
    }

    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
      knownLength: file.size,
    });

    try {
      const response = await axios.post(
        `${this.uploadServiceUrl}/upload`,
        formData,
        {
          headers: formData.getHeaders(),
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        },
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new BadGatewayException(error.response.data);
      }

      throw new BadGatewayException(
        'Failed to proxy upload to video-upload-service',
      );
    }
  }
}
