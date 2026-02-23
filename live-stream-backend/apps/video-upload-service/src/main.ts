import { NestFactory } from '@nestjs/core';
import { VideoUploadServiceModule } from './video-upload-service.module';

async function bootstrap() {
  const app = await NestFactory.create(VideoUploadServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
