import { NestFactory } from '@nestjs/core';
import { VideoProcessingWorkerModule } from './video-processing-worker.module';

async function bootstrap() {
  const app = await NestFactory.create(VideoProcessingWorkerModule);
  const port = Number(process.env.PORT ?? 3003);
  await app.listen(port);
}
void bootstrap();
