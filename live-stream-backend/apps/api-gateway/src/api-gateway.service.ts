import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';

@Injectable()
export class ApiGatewayService {
  private readonly processedBucket: string;
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.processedBucket = this.configService.get<string>(
      'MINIO_PROCESSED_BUCKET',
      'videos-processed',
    );
    this.s3Client = new S3Client({
      region: this.configService.get<string>('MINIO_REGION', 'us-east-1'),
      endpoint: this.configService.get<string>(
        'MINIO_ENDPOINT',
        'http://localhost:9000',
      ),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.get<string>(
          'MINIO_ACCESS_KEY',
          'minioadmin',
        ),
        secretAccessKey: this.configService.get<string>(
          'MINIO_SECRET_KEY',
          'minioadmin',
        ),
      },
    });
  }

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

  async getVideoStatus(videoId: string): Promise<unknown> {
    try {
      const response = await axios.get(
        `${this.uploadServiceUrl}/videos/${videoId}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new BadGatewayException(error.response.data);
      }

      throw new BadGatewayException(
        'Failed to fetch video status from video-upload-service',
      );
    }
  }

  async getVideos(): Promise<unknown> {
    try {
      const response = await axios.get(`${this.uploadServiceUrl}/videos`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new BadGatewayException(error.response.data);
      }

      throw new BadGatewayException(
        'Failed to fetch videos from video-upload-service',
      );
    }
  }

  async getHlsFile(
    videoId: string,
    fileName: string,
  ): Promise<{
    stream: Readable;
    contentType: string;
  }> {
    const key = `${videoId}/${fileName}`;

    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.processedBucket,
          Key: key,
        }),
      );

      if (!response.Body) {
        throw new NotFoundException(`HLS file not found: ${key}`);
      }

      const stream = await this.toReadable(response.Body);
      return {
        stream,
        contentType:
          response.ContentType ??
          (fileName.endsWith('.m3u8')
            ? 'application/vnd.apple.mpegurl'
            : 'video/mp2t'),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (
        error instanceof Error &&
        'name' in error &&
        error.name === 'NoSuchKey'
      ) {
        throw new NotFoundException(`HLS file not found: ${key}`);
      }

      throw new BadGatewayException('Failed to fetch HLS file from storage');
    }
  }

  private async toReadable(
    body: Readable | ReadableStream | Blob | Uint8Array,
  ): Promise<Readable> {
    if (body instanceof Readable) {
      return body;
    }

    if (body instanceof Uint8Array) {
      return Readable.from(body);
    }

    if (body instanceof Blob) {
      return Readable.from(Buffer.from(await body.arrayBuffer()));
    }

    if (body instanceof ReadableStream) {
      return Readable.fromWeb(
        body as unknown as import('stream/web').ReadableStream,
      );
    }

    throw new BadGatewayException(
      'Unsupported stream type returned by storage',
    );
  }
}
