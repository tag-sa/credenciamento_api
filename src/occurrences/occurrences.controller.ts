import * as aws from '@aws-sdk/client-ses'
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import { AuthGuard } from 'src/auth/auth.guard'
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe'
import { CreateEventOccurrenceDto } from './dto/create-event-occurrence.dto'
import { OccurrencesService } from './occurrences.service'

@Controller('occurrences')
export class OccurrencesController {
  constructor(private readonly occurrencesService: OccurrencesService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    return {
      data: await this.occurrencesService.findAll()
    }
  }

  @UseGuards(AuthGuard)
  @Post('eventOccurrences')
  async createEventOccurrence(
    @Body(new JoiValidationPipe(CreateEventOccurrenceDto.createSchema))
    createEventOcurrenceDto: CreateEventOccurrenceDto[]
  ) {
    return {
      data: await this.occurrencesService.createEventOcurrence(createEventOcurrenceDto)
    }
  }

  @Get('test')
  async test() {
    var to = ['junior.lenzi@tagdsa.com.br']
    var subject = 'Teste'
    var message = 'Teste'
    var htmlMessage = '<b>Teste</b>'

    const ses = new aws.SES({
      apiVersion: '2010-12-01',
      region: process.env.AWS_S3_BUCKET_REGION,
      credentials: {
        accessKeyId: 'AKIAZX25TBRUU67LZMFY',
        secretAccessKey: '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'
      }
    })

    const transport = nodemailer.createTransport({
      SES: { ses, aws }
    })

    try {
      let info = await transport.sendMail({
        from: to,
        to: to,
        subject: 'Hello ✔',
        text: 'Hello world?',
        html: '<p>Hello world?</p>'
      })

      return {
        data: info
      }
    } catch (error) {
      return {
        data: error.message
      }
    }
  }
}
