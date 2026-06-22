import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express = require('express');
import { join } from 'path';

const expressApp = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.enableCors({
    origin: true, // Allow requests from Next.js on localhost or network IP
    credentials: true,
  });
  
  if (!process.env.VERCEL) {
    // Serve static files from the 'uploads' directory
    app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  }
  
  app.setGlobalPrefix('api');
  await app.init();
  
  // Only listen on a port if NOT on Vercel
  if (!process.env.VERCEL) {
    await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
  }
}

bootstrap();

export default expressApp;
