import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaService } from 'src/prisma.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import request from 'supertest'
import { OccurrencesController } from './occurrences.controller'
import { OccurrencesService } from './occurrences.service'

describe('OccurrencesController', () => {
  let controller: OccurrencesController
  let app: INestApplication
  let bearerToken = null
  let prismaService: PrismaService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OccurrencesController],
      providers: [OccurrencesService],
      imports: [PrismaModule, AuthModule]
    }).compile()

    prismaService = module.get<PrismaService>(PrismaService)
    controller = module.get<OccurrencesController>(OccurrencesController)
    app = module.createNestApplication()
    await app.init()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should login user', async () => {
    const data = await request(app.getHttpServer()).post('/users/login').send({ email: 'junior@codelogics.com.br', password: '1234567' }).set('Content-Type', 'application/json')

    bearerToken = data.body.data.access_token

    expect(data.status).toBe(HttpStatus.OK)
    expect(data.body.data.access_token).toBeDefined()
  })

  it('should return unauthorized', async () => {
    const { status } = await request(app.getHttpServer()).get('/occurrences')

    expect(status).toBe(401)
  })

  it('should return a list of occurrences', async () => {
    const { status, body } = await request(app.getHttpServer()).get('/occurrences').set('Authorization', `Bearer ${bearerToken}`)

    expect(status).toBe(200)
    expect(body).toHaveProperty('data')
  })

  it('should create a new occurrence', async () => {
    const getRandomTeamUser = await prismaService.teamsUsers.findFirst({
      where: {
        NOT: {
          user_id: null
        }
      },
      include: {
        team: {
          include: {
            event: true
          }
        }
      }
    })

    const { status, body } = await request(app.getHttpServer())
      .post('/occurrences/eventOccurrences')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send([
        {
          event_id: getRandomTeamUser.team.event.id,
          user_id: getRandomTeamUser.user_id,
          team_user_id: getRandomTeamUser.id,
          occurrence_id: 1,
          observation: ''
        }
      ])
      .set('Content-Type', 'application/json')

    expect(status).toBe(201)
  })
})
