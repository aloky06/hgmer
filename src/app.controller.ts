import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  
  @Get('health')
  async getHealth(): Promise<any> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "OK", database: "Connected Successfully" };
    } catch (error) {
      return { 
        status: "API is OK, but Database Failed", 
        error_name: error.name,
        error_message: error.message,
        error_code: error.code
      };
    }
  }
}
