import { Test, TestingModule } from '@nestjs/testing';
import { CicloController } from './ciclo.controller';
import { CicloService } from './ciclo.service';

describe('CicloController', () => {
  let controller: CicloController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CicloController],
      providers: [CicloService],
    }).compile();

    controller = module.get<CicloController>(CicloController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
