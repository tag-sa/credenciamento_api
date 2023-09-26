import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService],
      imports: [PrismaModule],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return event cost zero without sending any team', async () => {
    const mockEventCost = {
      total_executed: 0,
      total_preview: 0,
      total_by_answers: 0,
    };

    const event = await prismaService.events.findFirst({
      orderBy: {
        id: 'desc',
      },
    });

    const data = await service.eventCost(event);

    expect(data.total_preview).toEqual(mockEventCost.total_preview);
  });
  it('should return event cost', async () => {
    const mockEventCost = {
      total_executed: 0,
      total_preview: 500,
      total_by_answers: 0,
    };

    const event = await prismaService.events.findFirst({
      orderBy: {
        id: 'desc',
      },
      include: {
        teams: {
          include: {
            teamsUsers: {
              include: {
                function: true,
              },
            },
          },
        },
      },
    });

    const data = await service.eventCost(event);

    console.log(data);

    expect(data.total_preview).toEqual(mockEventCost.total_preview);
  });
});
