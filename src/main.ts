import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true, // Allow requests from Next.js on localhost or network IP
    credentials: true,
  });
  
  // Serve static files from the 'uploads' directory
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
