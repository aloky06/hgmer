import { Test, TestingModule } from '@nestjs/testing';
import { PanditsController } from './pandits.controller';

describe('PanditsController', () => {
  let controller: PanditsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PanditsController],
    }).compile();

    controller = module.get<PanditsController>(PanditsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
