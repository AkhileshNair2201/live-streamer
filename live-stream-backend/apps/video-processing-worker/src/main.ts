import 'dotenv/config';
import { AllExceptionsFilter } from '../../common/http-exception.filter';
import { NestFactory } from '@nestjs/core';
import { VideoProcessingWorkerModule } from './video-processing-worker.module';

async function bootstrap() {
  const app = await NestFactory.create(VideoProcessingWorkerModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  const port = Number(process.env.VIDEO_PROCESSING_WORKER_PORT ?? 3003);
  await app.listen(port);
}
void bootstrap();
