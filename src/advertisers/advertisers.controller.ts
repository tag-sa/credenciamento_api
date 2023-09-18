import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Req,
  UseGuards,
  UsePipes,
  NotFoundException,
} from '@nestjs/common';
import { AdvertisersService } from './advertisers.service';
import { CreateAdvertiserDto } from './dto/create-advertiser.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';
import { PrismaService } from 'src/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';

@Controller('advertisers')
export class AdvertisersController {
  constructor(
    private readonly advertisersService: AdvertisersService,
    private readonly prismaService: PrismaService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new JoiValidationPipe(CreateAdvertiserDto.createCatSchema))
  async create(@Body() createAdvertiserDto: CreateAdvertiserDto) {
    return { data: await this.advertisersService.create(createAdvertiserDto) };
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    return { data: await this.advertisersService.findAll() };
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    const userId = req['user'].id;
    const checkUserHasAdvertiser =
      await this.prismaService.usersAdvertises.findFirst({
        where: {
          user_id: userId,
          advertiser_id: +id,
        },
      });

    if (!checkUserHasAdvertiser) {
      throw new NotFoundException('Advertiser not found');
    }

    const adv = await this.advertisersService.findOne(+id);

    return { data: adv };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(CreateAdvertiserDto.createCatSchema))
    updateAdvertiserDto: CreateAdvertiserDto,
    @Req() req,
  ) {
    const userId = req['user'].id;

    const checkAdvertiser = await this.prismaService.advertisers.findFirst({
      where: {
        id: +id,
      },
    });

    if (!checkAdvertiser) {
      throw new NotFoundException('Advertiser not found');
    }

    const checkUserOwnership =
      await this.prismaService.usersAdvertises.findFirst({
        where: {
          user_id: userId,
          advertiser_id: +id,
        },
      });

    if (!checkUserOwnership) {
      throw new NotFoundException('Advertiser not found');
    }

    return {
      data: await this.advertisersService.update(+id, updateAdvertiserDto),
    };
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const userId = req['user'].id;

    const checkAdvertiser = await this.prismaService.advertisers.findFirst({
      where: {
        id: +id,
      },
    });

    if (!checkAdvertiser) {
      throw new NotFoundException('Advertiser not found');
    }

    const checkUserOwnership =
      await this.prismaService.usersAdvertises.findFirst({
        where: {
          user_id: userId,
          advertiser_id: +id,
        },
      });

    if (!checkUserOwnership) {
      throw new NotFoundException('Advertiser not found');
    }

    return await this.advertisersService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Get('/:id/places')
  async getPlaces(@Req() req, @Param('id') id: string) {
    const userId = req['user'].id;

    const checkUserOwnership =
      await this.prismaService.usersAdvertises.findFirst({
        where: {
          user_id: userId,
          advertiser_id: +id,
        },
      });

    if (!checkUserOwnership) {
      throw new NotFoundException('Advertiser not found');
    }

    const places = await this.prismaService.places.findMany({
      where: {
        advertiser_id: +id,
      },
    });

    return { data: places };
  }

  @UseGuards(AuthGuard)
  @Post('/:advertiserId/places')
  async createPlace(
    @Req() req,
    @Body(new JoiValidationPipe(CreatePlaceDto.createSchema)) body,
  ) {
    const userId = req['user'].id;
    const advertiserId = +req.params.advertiserId;

    const checkUserOwnership =
      await this.prismaService.usersAdvertises.findFirst({
        where: {
          user_id: userId,
          advertiser_id: advertiserId,
        },
      });

    if (!checkUserOwnership) {
      throw new NotFoundException('Advertiser not found');
    }

    const place = await this.prismaService.places.create({
      data: {
        ...body,
        advertiser_id: advertiserId,
      },
    });

    return { data: place };
  }

  @UseGuards(AuthGuard)
  @Delete('/:advertiserId/places/:id')
  async removePlace(@Req() req, @Param('id') id: string) {
    const userId = req['user'].id;
    console.log(id);

    const checkPlace = await this.prismaService.places.findFirst({
      where: {
        id: +id,
      },
    });

    if (!checkPlace) {
      throw new NotFoundException('Place not found');
    }

    const checkUserOwnership =
      await this.prismaService.usersAdvertises.findFirst({
        where: {
          user_id: userId,
          advertiser_id: checkPlace.advertiser_id,
        },
      });

    if (!checkUserOwnership) {
      throw new NotFoundException('Place not found');
    }

    return await this.prismaService.places.delete({
      where: {
        id: +id,
      },
    });
  }
}
