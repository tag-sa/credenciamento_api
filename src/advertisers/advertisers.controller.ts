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

@Controller('advertisers')
export class AdvertisersController {
  constructor(
    private readonly advertisersService: AdvertisersService,
    private readonly prismaService: PrismaService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new JoiValidationPipe(CreateAdvertiserDto.createCatSchema))
  create(@Body() createAdvertiserDto: CreateAdvertiserDto) {
    return this.advertisersService.create(createAdvertiserDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.advertisersService.findAll();
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

    return this.advertisersService.findOne(+id);
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

    return this.advertisersService.update(+id, updateAdvertiserDto);
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
}
