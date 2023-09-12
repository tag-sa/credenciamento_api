import { Inject, Injectable, Scope } from '@nestjs/common';
import { CreateAdvertiserDto } from './dto/create-advertiser.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from 'src/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class AdvertisersService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  create(createAdvertiserDto: CreateAdvertiserDto) {
    const userId = this.request['user'].id;

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

  async findAll() {
    const userId = this.request['user'].id;
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
    return await this.prismaService.advertisers.findFirst({
      where: {
        id: id,
      },
    });
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
