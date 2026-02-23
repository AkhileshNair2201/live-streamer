import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { VideoProcessingWorkerModule } from './video-processing-worker.module';

async function bootstrap() {
  const app = await NestFactory.create(VideoProcessingWorkerModule);
  const port = Number(process.env.VIDEO_PROCESSING_WORKER_PORT ?? 3003);
  await app.listen(port);
}
void bootstrap();
