import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect } from 'amqplib';

@Injectable()
export class VideoJobPublisherService {
  constructor(private readonly configService: ConfigService) {}

  private get rabbitmqUrl(): string {
    return this.configService.get<string>(
      'RABBITMQ_URL',
      'amqp://localhost:5672',
    );
  }

  private get queueName(): string {
    return this.configService.get<string>(
      'VIDEO_PROCESSING_QUEUE',
      'video_processing_queue',
    );
  }

  async publishVideoProcessingJob(videoId: string): Promise<void> {
    const connection = await connect(this.rabbitmqUrl);

    try {
      const channel = await connection.createChannel();
      await channel.assertQueue(this.queueName, { durable: true });

      channel.sendToQueue(
        this.queueName,
        Buffer.from(JSON.stringify({ videoId })),
        {
          persistent: true,
        },
      );

      await channel.close();
    } finally {
      await connection.close();
    }
  }
}
