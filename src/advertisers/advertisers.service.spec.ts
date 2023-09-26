import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from 'src/events/events.service';
import { PrismaService } from 'src/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AdvertisersService } from './advertisers.service';

describe('AdvertisersService', () => {
  let service: AdvertisersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdvertisersService, PrismaService, EventsService],
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
