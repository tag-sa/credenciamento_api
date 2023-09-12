import { Test, TestingModule } from '@nestjs/testing';
import { AdvertisersService } from './advertisers.service';
import { PrismaService } from 'src/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';

describe('AdvertisersService', () => {
  let service: AdvertisersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdvertisersService, PrismaService],
      imports: [PrismaModule],
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    service = await app.resolve<AdvertisersService>(AdvertisersService);
    prismaService = await app.resolve<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });
});
