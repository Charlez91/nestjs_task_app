import { Test, TestingModule } from '@nestjs/testing';
import { Src\task\Gateway } from './src\task\.gateway';

describe('Src\task\Gateway', () => {
  let gateway: Src\task\Gateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Src\task\Gateway],
    }).compile();

    gateway = module.get<Src\task\Gateway>(Src\task\Gateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
