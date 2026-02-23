import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly bucket: string;

  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>(
      'MINIO_RAW_BUCKET',
      'videos-raw',
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

  private bucketReady = false;

  async uploadRawVideo(
    key: string,
    body: Buffer,
    contentType?: string,
  ): Promise<void> {
    await this.ensureBucket();

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  private async ensureBucket(): Promise<void> {
    if (this.bucketReady) {
      return;
    }

    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.s3Client.send(
        new CreateBucketCommand({ Bucket: this.bucket }),
      );
    }

    this.bucketReady = true;
  }
}
