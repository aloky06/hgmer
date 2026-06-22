import { Test, TestingModule } from '@nestjs/testing';
import { PanditsService } from './pandits.service';

describe('PanditsService', () => {
  let service: PanditsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PanditsService],
    }).compile();

    service = module.get<PanditsService>(PanditsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
