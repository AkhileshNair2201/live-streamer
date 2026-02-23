import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { execFile } from 'child_process';
import { Channel, ChannelModel, ConsumeMessage, connect } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream, promises as fs } from 'fs';
import { tmpdir } from 'os';
import { basename, join } from 'path';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Readable } from 'stream';
import { promisify } from 'util';
import { Repository } from 'typeorm';
import { Video, VideoStatus } from './video.entity';

const execFileAsync = promisify(execFile);

@Injectable()
export class VideoProcessingWorkerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(VideoProcessingWorkerService.name);

  private readonly rabbitmqUrl: string;

  private readonly queueName: string;

  private readonly rawBucket: string;

  private readonly processedBucket: string;

  private readonly minioEndpoint: string;

  private readonly s3Client: S3Client;

  private rabbitConnection: ChannelModel | null = null;

  private rabbitChannel: Channel | null = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Video)
    private readonly videosRepository: Repository<Video>,
  ) {
    this.rabbitmqUrl = this.configService.get<string>(
      'RABBITMQ_URL',
      'amqp://localhost:5672',
    );
    this.queueName = this.configService.get<string>(
      'VIDEO_PROCESSING_QUEUE',
      'video_processing_queue',
    );
    this.rawBucket = this.configService.get<string>(
      'MINIO_RAW_BUCKET',
      'videos-raw',
    );
    this.processedBucket = this.configService.get<string>(
      'MINIO_PROCESSED_BUCKET',
      'videos-processed',
    );
    this.minioEndpoint = this.configService.get<string>(
      'MINIO_ENDPOINT',
      'http://localhost:9000',
    );

    this.s3Client = new S3Client({
      region: this.configService.get<string>('MINIO_REGION', 'us-east-1'),
      endpoint: this.minioEndpoint,
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

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    await this.startConsumer();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.rabbitChannel) {
      await this.rabbitChannel.close();
      this.rabbitChannel = null;
    }

    if (this.rabbitConnection) {
      await this.rabbitConnection.close();
      this.rabbitConnection = null;
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  private async startConsumer(): Promise<void> {
    const connection: ChannelModel = await connect(this.rabbitmqUrl);
    const channel: Channel = await connection.createChannel();

    this.rabbitConnection = connection;
    this.rabbitChannel = channel;

    await channel.assertQueue(this.queueName, { durable: true });
    await channel.prefetch(1);

    await channel.consume(this.queueName, (message) => {
      void this.handleMessage(message);
    });

    this.logger.log(`Listening for jobs on queue "${this.queueName}"`);
  }

  private async handleMessage(message: ConsumeMessage | null): Promise<void> {
    if (!message || !this.rabbitChannel) {
      return;
    }

    const videoId = this.parseVideoIdFromPayload(message.content.toString());
    if (!videoId) {
      this.logger.warn('Job missing videoId; dropping message');
      this.rabbitChannel.nack(message, false, false);
      return;
    }

    try {
      await this.processVideo(videoId);
      this.rabbitChannel.ack(message);
    } catch (error) {
      this.logger.error(`Failed processing video ${videoId}`, error);
      await this.markFailed(videoId);
      this.rabbitChannel.nack(message, false, false);
    }
  }

  private parseVideoIdFromPayload(payload: string): string | null {
    try {
      const parsed: unknown = JSON.parse(payload);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'videoId' in parsed &&
        typeof parsed.videoId === 'string' &&
        parsed.videoId.length > 0
      ) {
        return parsed.videoId;
      }

      return null;
    } catch {
      return null;
    }
  }

  private async processVideo(videoId: string): Promise<void> {
    const video = await this.videosRepository.findOne({
      where: { id: videoId },
    });
    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    await this.ensureBucket(this.processedBucket);

    const workDir = await fs.mkdtemp(
      join(tmpdir(), `video-worker-${videoId}-`),
    );
    const inputPath = join(workDir, basename(video.storageKey));
    const outputDir = join(workDir, 'hls');
    const outputPlaylist = join(outputDir, 'index.m3u8');

    try {
      await fs.mkdir(outputDir, { recursive: true });
      await this.downloadRawVideo(video.storageKey, inputPath);
      await this.generateHls(inputPath, outputPlaylist);
      await this.uploadProcessedOutput(videoId, outputDir);

      video.status = VideoStatus.COMPLETED;
      video.hlsPath = `${videoId}/index.m3u8`;
      await this.videosRepository.save(video);
    } finally {
      await fs.rm(workDir, { recursive: true, force: true });
    }
  }

  private async markFailed(videoId: string): Promise<void> {
    const video = await this.videosRepository.findOne({
      where: { id: videoId },
    });
    if (!video) {
      return;
    }

    video.status = VideoStatus.FAILED;
    await this.videosRepository.save(video);
  }

  private async ensureBucket(bucketName: string): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch {
      await this.s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      this.logger.log(`Created missing bucket "${bucketName}"`);
    }
  }

  private async downloadRawVideo(
    storageKey: string,
    destinationPath: string,
  ): Promise<void> {
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.rawBucket,
        Key: storageKey,
      }),
    );

    const body = response.Body;
    if (!body) {
      throw new Error(`Unable to download ${storageKey}: empty body`);
    }

    await fs.writeFile(destinationPath, await this.streamToBuffer(body));
  }

  private async streamToBuffer(
    body: Readable | ReadableStream | Blob | Uint8Array,
  ): Promise<Buffer> {
    if (body instanceof Uint8Array) {
      return Buffer.from(body);
    }

    if (body instanceof Blob) {
      return Buffer.from(await body.arrayBuffer());
    }

    const nodeStream = body as Readable;
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      nodeStream.on('data', (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      nodeStream.on('end', () => resolve());
      nodeStream.on('error', (error) => reject(error));
    });

    return Buffer.concat(chunks);
  }

  private async generateHls(
    inputPath: string,
    outputPlaylist: string,
  ): Promise<void> {
    await execFileAsync('ffmpeg', [
      '-y',
      '-i',
      inputPath,
      '-codec:v',
      'libx264',
      '-codec:a',
      'aac',
      '-hls_time',
      '6',
      '-hls_playlist_type',
      'vod',
      '-hls_segment_filename',
      outputPlaylist.replace('index.m3u8', 'segment_%03d.ts'),
      outputPlaylist,
    ]);
  }

  private async uploadProcessedOutput(
    videoId: string,
    outputDir: string,
  ): Promise<void> {
    const outputFiles = await fs.readdir(outputDir);

    for (const fileName of outputFiles) {
      const filePath = join(outputDir, fileName);
      const key = `${videoId}/${fileName}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.processedBucket,
          Key: key,
          Body: createReadStream(filePath),
          ContentType: fileName.endsWith('.m3u8')
            ? 'application/vnd.apple.mpegurl'
            : 'video/mp2t',
        }),
      );
    }
  }
}
