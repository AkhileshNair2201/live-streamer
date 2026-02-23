import { NestFactory } from '@nestjs/core';
import { VideoUploadServiceModule } from './video-upload-service.module';

async function bootstrap() {
  const app = await NestFactory.create(VideoUploadServiceModule);
  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port);
}
bootstrap();
