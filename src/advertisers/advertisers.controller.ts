import * as aws from '@aws-sdk/client-ses'
import { Body, Controller, Delete, Get, InternalServerErrorException, NotFoundException, Param, Post, Put, Req, UseGuards, UsePipes } from '@nestjs/common'
import { md5 } from 'md5js'
import moment from 'moment'
import * as nodemailer from 'nodemailer'
import { AuthGuard } from 'src/auth/auth.guard'
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe'
import { PrismaService } from 'src/prisma.service'
import { User } from 'src/users/entities/user.entity'
import { AdvertisersService } from './advertisers.service'
import { CreateAdvertiserDto } from './dto/create-advertiser.dto'
import { CreatePlaceDto } from './dto/create-place.dto'
import { AdvertiserInviteDto } from './dto/send-invitation.dto'

@Controller('advertisers')
export class AdvertisersController {
  constructor(
    private readonly advertisersService: AdvertisersService,
    private readonly prismaService: PrismaService
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new JoiValidationPipe(CreateAdvertiserDto.createCatSchema))
  async create(@Req() req, @Body() createAdvertiserDto: CreateAdvertiserDto) {
    const userId = req['user'].id
    return {
      data: await this.advertisersService.create(createAdvertiserDto, userId)
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Req() req) {
    const userId = req['user'].id
    return { data: await this.advertisersService.findAll(userId) }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    const userId = req['user'].id
    const checkUserHasAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: +id
      }
    })

    if (!checkUserHasAdvertiser) {
      throw new NotFoundException('Advertiser not found')
    }

    const adv = await this.advertisersService.findOne(+id)

    return { data: adv }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(CreateAdvertiserDto.createCatSchema))
    updateAdvertiserDto: CreateAdvertiserDto,
    @Req() req
  ) {
    const userId = req['user'].id

    const checkAdvertiser = await this.prismaService.advertisers.findFirst({
      where: {
        id: +id
      }
    })

    if (!checkAdvertiser) {
      throw new NotFoundException('Advertiser not found')
    }

    const checkUserOwnership = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: +id
      }
    })

    if (!checkUserOwnership) {
      throw new NotFoundException('Advertiser not found')
    }

    return {
      data: await this.advertisersService.update(+id, updateAdvertiserDto)
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const userId = req['user'].id

    const checkAdvertiser = await this.prismaService.advertisers.findFirst({
      where: {
        id: +id
      }
    })

    if (!checkAdvertiser) {
      throw new NotFoundException('Advertiser not found')
    }

    const checkUserOwnership = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: +id
      }
    })

    if (!checkUserOwnership) {
      throw new NotFoundException('Advertiser not found')
    }

    return await this.advertisersService.remove(+id)
  }

  @UseGuards(AuthGuard)
  @Get('/:id/places')
  async getPlaces(@Req() req, @Param('id') id: string) {
    const userId = req['user'].id

    const checkUserOwnership = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: +id
      }
    })

    if (!checkUserOwnership) {
      throw new NotFoundException('Advertiser not found')
    }

    const places = await this.prismaService.places.findMany({
      where: {
        advertiser_id: +id
      }
    })

    return { data: places }
  }
  @UseGuards(AuthGuard)
  @Get('/:id/people')
  async getPeople(@Req() req, @Param('id') id: string) {
    const userId = req['user'].id

    const checkUserOwnership = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: +id
      }
    })

    if (!checkUserOwnership) {
      throw new NotFoundException('Advertiser not found')
    }

    const people = await this.advertisersService.getPeople(+id)

    return { data: people }
  }

  @UseGuards(AuthGuard)
  @Post('/:advertiserId/places')
  async createPlace(@Req() req, @Body(new JoiValidationPipe(CreatePlaceDto.createSchema)) body) {
    const userId = req['user'].id
    const advertiserId = +req.params.advertiserId

    const checkUserOwnership = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: advertiserId
      }
    })

    if (!checkUserOwnership) {
      throw new NotFoundException('Advertiser not found')
    }

    const place = await this.prismaService.places.create({
      data: {
        ...body,
        advertiser_id: advertiserId
      }
    })

    return { data: place }
  }

  @UseGuards(AuthGuard)
  @Delete('/:advertiserId/places/:id')
  async removePlace(@Req() req, @Param('id') id: string) {
    const userId = req['user'].id

    const checkPlace = await this.prismaService.places.findFirst({
      where: {
        id: +id
      }
    })

    if (!checkPlace) {
      throw new NotFoundException('Place not found')
    }

    const checkUserOwnership = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: checkPlace.advertiser_id
      }
    })

    if (!checkUserOwnership) {
      throw new NotFoundException('Place not found')
    }

    return await this.prismaService.places.delete({
      where: {
        id: +id
      }
    })
  }

  @Post(':id/invite')
  @UseGuards(AuthGuard)
  async invite(@Param('id') id: string, @Req() req: Request & { user: User }, @Body(new JoiValidationPipe(AdvertiserInviteDto.validationSchema)) body: AdvertiserInviteDto) {
    const checkUserOwnership = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: req['user'].id,
        advertiser_id: +id
      }
    })

    if (!checkUserOwnership) {
      throw new NotFoundException('Advertiser not found')
    }

    const advertiser = await this.prismaService.advertisers.findFirstOrThrow({
      where: {
        id: +id
      }
    })

    const ses = new aws.SES({
      apiVersion: '2010-12-01',
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_IAM_SES_USER_ACCESS_KEY,
        secretAccessKey: process.env.AWS_IAM_SES_USER_SECRET_ACCESS_KEY
      }
    })

    const transport = nodemailer.createTransport({
      SES: { ses, aws }
    })

    try {
      let invId = null

      const checkHasInvite = await this.prismaService.usersAdvertisesInvites.findFirst({
        where: {
          email: body.email,
          advertiser_id: +id
        }
      })

      if (checkHasInvite) {
        invId = checkHasInvite.id
      } else {
        const saveInvite = await this.prismaService.usersAdvertisesInvites.create({
          data: {
            email: body.email,
            advertiser_id: +id,
            expires: moment().add(1, 'days').toDate()
          }
        })

        invId = saveInvite.id
      }

      var to = body.email
      var subject = 'Convite para anunciante'
      const code = md5(invId.toString(), 32) + '-' + md5(moment().toDate().toDateString(), 32)
      var htmlMessage = `
        <p>Olá, você foi convidado para administrar o anunciante ${advertiser.name}. Para aceitar o convite, clique no link abaixo:</p>
        <p><a href="https://tagsa.com.br/advertiser-invite/${code}">https://tagsa.com.br/advertiser-invite/${code}</a></p>
      `

      let info = await transport.sendMail({
        from: process.env.EMAIL_NOT_REPLY,
        to: to,
        subject: subject,
        html: htmlMessage
      })

      return {
        data: info
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  @Delete(':id/remove-user/:type')
  @UseGuards(AuthGuard)
  async removeInvite(@Param('id') id: string, @Param('type') type: 'invite' | 'user', @Req() req: Request & { user: User }) {
    if (type == 'user') {
      const checkUserOwnership = await this.prismaService.usersAdvertises.findFirst({
        where: {
          user_id: req['user'].id,
          advertiser_id: +id
        }
      })

      if (!checkUserOwnership) {
        throw new NotFoundException('Advertiser not found')
      }

      await this.prismaService.usersAdvertises.delete({
        where: {
          id: +id
        }
      })
    }

    if (type === 'invite') {
      await this.prismaService.usersAdvertisesInvites.delete({
        where: {
          id: +id
        }
      })
    }

    return 'ok'
  }
}
