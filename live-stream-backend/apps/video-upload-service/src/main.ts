import 'dotenv/config';
import { AllExceptionsFilter } from '../../common/http-exception.filter';
import { NestFactory } from '@nestjs/core';
import { VideoUploadServiceModule } from './video-upload-service.module';

async function bootstrap() {
  const app = await NestFactory.create(VideoUploadServiceModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  const port = Number(process.env.VIDEO_UPLOAD_SERVICE_PORT ?? 3002);
  await app.listen(port);
}
void bootstrap();
