import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const expressApp = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  app.setGlobalPrefix('api');
  await app.init();
}

bootstrap();

export default expressApp;
