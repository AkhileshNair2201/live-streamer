import { Injectable } from '@nestjs/common';
import { connect } from 'amqplib';

@Injectable()
export class VideoJobPublisherService {
  private readonly rabbitmqUrl =
    process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
  private readonly queueName =
    process.env.VIDEO_PROCESSING_QUEUE ?? 'video_processing_queue';

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
