import { NestFactory } from '@nestjs/core';
import { VideoProcessingWorkerModule } from './video-processing-worker.module';

async function bootstrap() {
  const app = await NestFactory.create(VideoProcessingWorkerModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
