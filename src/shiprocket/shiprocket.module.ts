import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ShiprocketService } from './shiprocket.service';
import { ShiprocketController } from './shiprocket.controller';

@Module({
  imports: [
    CacheModule.register(),
  ],
  providers: [ShiprocketService],
  controllers: [ShiprocketController],
  exports: [ShiprocketService],
})
export class ShiprocketModule {}
