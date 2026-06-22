import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Successfully connected to database');
    } catch (error) {
      console.error('Failed to connect to database on startup:', error);
      // We don't throw here, so NestJS still boots up. 
      // Individual API calls will fail gracefully later if DB is unreachable.
    }
  }
}
