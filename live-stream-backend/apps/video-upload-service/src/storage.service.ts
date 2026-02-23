import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  private readonly bucket = process.env.MINIO_RAW_BUCKET ?? 'videos-raw';

  private readonly s3Client = new S3Client({
    region: process.env.MINIO_REGION ?? 'us-east-1',
    endpoint: process.env.MINIO_ENDPOINT ?? 'http://localhost:9000',
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
      secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
    },
  });

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
