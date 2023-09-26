import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { EventsService } from 'src/events/events.service';
import { PrismaService } from 'src/prisma.service';
import { CreateAdvertiserDto } from './dto/create-advertiser.dto';

@Injectable()
export class AdvertisersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventService: EventsService,
  ) {}

  create(createAdvertiserDto: CreateAdvertiserDto, userId: number) {
    const save = this.prismaService.advertisers.create({
      data: {
        name: createAdvertiserDto.name,
        url: createAdvertiserDto.url,
        about: createAdvertiserDto.about,
        UsersAdvertises: {
          create: {
            user_id: userId,
          },
        },
      },
    });

    return save;
  }

  async findAll(userId: number) {
    const advertisers = [];

    const getUserAdvertisers =
      await this.prismaService.usersAdvertises.findMany({
        where: {
          user_id: userId,
        },
        select: {
          advertiser_id: true,
        },
      });

    for (const advertiser of getUserAdvertisers) {
      const getAdvertiser = await this.prismaService.advertisers.findFirst({
        where: {
          id: advertiser.advertiser_id,
        },
      });

      advertisers.push(getAdvertiser);
    }

    return advertisers;
  }

  async findOne(id: number) {
    const advertiser: any = await this.prismaService.advertisers.findFirst({
      where: {
        id: id,
      },
    });

    const pastEvents = await this.prismaService.events.findMany({
      where: {
        advertiser_id: advertiser.id,
        date_end: {
          lt: moment().toDate(),
        },
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

    const events = await this.prismaService.events.findMany({
      where: {
        advertiser_id: advertiser.id,
        date_end: {
          gt: moment().toDate(),
        },
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

    if (events.length) {
      events.map((event: any) => {
        event = this.eventService.eventCost(event);

        return event;
      });
    }

    if (pastEvents.length) {
      for (let event of pastEvents) {
        event = await this.eventService.eventCost(event);
      }
    }

    advertiser.events = events;
    advertiser.pastEvents = pastEvents;

    return advertiser;
  }

  update(id: number, updateAdvertiserDto: CreateAdvertiserDto) {
    const update = this.prismaService.advertisers.update({
      where: {
        id: id,
      },
      data: {
        name: updateAdvertiserDto.name,
        url: updateAdvertiserDto.url,
        about: updateAdvertiserDto.about,
      },
    });

    return update;
  }

  remove(id: number) {
    return this.prismaService.advertisers.delete({
      where: {
        id: id,
      },
    });
  }
}
