import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  const port = Number(process.env.API_GATEWAY_PORT ?? 3001);
  await app.listen(port);
}
void bootstrap();
