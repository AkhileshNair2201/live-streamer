import 'dotenv/config';
import { AllExceptionsFilter } from '../../common/http-exception.filter';
import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });
  const port = Number(process.env.API_GATEWAY_PORT ?? 3001);
  await app.listen(port);
}
void bootstrap();
