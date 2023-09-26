import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FunctionsService } from './functions.service';

describe('FunctionsService', () => {
  let service: FunctionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunctionsService],
      imports: [PrismaModule],
    }).compile();

    service = module.get<FunctionsService>(FunctionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
