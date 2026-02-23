import 'dotenv/config';
import { AllExceptionsFilter } from '../../common/http-exception.filter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  const port = Number(process.env.LIVE_STREAM_BACKEND_PORT ?? 3000);
  await app.listen(port);
}
void bootstrap();
