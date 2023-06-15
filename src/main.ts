import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port: string = configService.get<string>('PORT') || '3000';
  app.use(bodyParser.json({ limit: '10mb' }));
  await app.listen(port);
}
bootstrap();
