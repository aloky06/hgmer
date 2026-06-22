import { Module } from '@nestjs/common';
import { PanditsService } from './pandits.service';
import { PanditsController } from './pandits.controller';

@Module({
  providers: [PanditsService],
  controllers: [PanditsController]
})
export class PanditsModule {}
