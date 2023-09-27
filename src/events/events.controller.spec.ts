import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AdvertisersModule } from 'src/advertisers/advertisers.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import request from 'supertest';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
  let controller: EventsController;
  let app: INestApplication;
  let bearerToken = null;
  let advertiserId = null;
  let placeId = null;
  let eventId = null;
  let teamId = null;

  beforeEach(async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [EventsService],
      imports: [PrismaModule, AuthModule, AdvertisersModule],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login user', async () => {
    const data = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'junior@codelogics.com.br', password: '1234567' })
      .set('Content-Type', 'application/json');

    bearerToken = data.body.data.access_token;

    expect(data.status).toBe(HttpStatus.OK);
    expect(data.body.data.access_token).toBeDefined();
  });

  it('should return a list of advertisers', async () => {
    const data = await request(app.getHttpServer())
      .get('/advertisers')
      .set('Authorization', `Bearer ${bearerToken}`);

    advertiserId = data.body.data[0].id;

    expect(data.status).toBe(HttpStatus.OK);
    expect(data.body.data.length).toBeGreaterThan(0);
  });

  it('should return a list of places', async () => {
    const data = await request(app.getHttpServer())
      .get(`/advertisers/${advertiserId}/places`)
      .set('Authorization', `Bearer ${bearerToken}`);

    placeId = data.body.data[0].id;

    expect(data.status).toBe(HttpStatus.OK);
    expect(data.body.data.length).toBeGreaterThan(0);
  });

  it('should return unauthorized from create event without token', async () => {
    const data = await request(app.getHttpServer())
      .post(`/events`)
      .send({
        name: 'Evento de teste',
      })
      .set('Content-Type', 'application/json');

    expect(data.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should return bad request from create event without body', async () => {
    const data = await request(app.getHttpServer())
      .post(`/events`)
      .set('Authorization', `Bearer ${bearerToken}`)
      .set('Content-Type', 'application/json');

    expect(data.status).toBe(HttpStatus.BAD_REQUEST);
  });
  it('should return bad request from create event without name', async () => {
    const data = await request(app.getHttpServer())
      .post(`/events`)
      .send({
        date_start: '2021-08-01',
        date_end: '2021-08-01',
        status: 'ACTIVE',
        place_id: placeId,
        advertiser_id: advertiserId,
      })
      .set('Authorization', `Bearer ${bearerToken}`)
      .set('Content-Type', 'application/json');

    expect(data.status).toBe(HttpStatus.BAD_REQUEST);
  });
  it('should return bad request from create event with invalid date_start', async () => {
    const data = await request(app.getHttpServer())
      .post(`/events`)
      .send({
        name: 'Evento de teste',
        date_start: '2021-15-01 00:00:00',
        date_end: '2021-08-01 00:00:00',
        status: 'a',
        place_id: placeId,
        advertiser_id: advertiserId,
      })
      .set('Authorization', `Bearer ${bearerToken}`)
      .set('Content-Type', 'application/json');

    expect(data.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should return bad request from create event with invalid date_start from time', async () => {
    const data = await request(app.getHttpServer())
      .post(`/events`)
      .send({
        name: 'Evento de teste',
        date_start: '2021-08-01 25:90:00',
        date_end: '2021-08-01 00:00:00',
        status: 'a',
        place_id: placeId,
        advertiser_id: advertiserId,
      })
      .set('Authorization', `Bearer ${bearerToken}`)
      .set('Content-Type', 'application/json');

    expect(data.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should return bad request from create event with invalid date_end from time', async () => {
    const data = await request(app.getHttpServer())
      .post(`/events`)
      .send({
        name: 'Evento de teste',
        date_start: '2021-08-01 00:00:00',
        date_end: '2021-08-01 25:90:00',
        status: 'a',
        place_id: placeId,
        advertiser_id: advertiserId,
      })
      .set('Authorization', `Bearer ${bearerToken}`)
      .set('Content-Type', 'application/json');

    expect(data.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should return bad request from create event with invalid date_end', async () => {
    const data = await request(app.getHttpServer())
      .post(`/events`)
      .send({
        name: 'Evento de teste',
        date_start: '2021-08-01 00:00:00',
        date_end: '2021-15-01 00:00:00',
        status: 'a',
        place_id: placeId,
        advertiser_id: advertiserId,
      })
      .set('Authorization', `Bearer ${bearerToken}`)
      .set('Content-Type', 'application/json');

    expect(data.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should create a event', async () => {
    const data = await request(app.getHttpServer())
      .post(`/events`)
      .send({
        name: 'Evento de teste',
        date_start: '2021-08-01 00:00:00',
        date_end: '2021-08-01 00:00:00',
        status: 'a',
        place_id: placeId,
        advertiser_id: advertiserId,
      })
      .set('Authorization', `Bearer ${bearerToken}`)
      .set('Content-Type', 'application/json');

    eventId = data.body.data.id;

    expect(data.status).toBe(HttpStatus.CREATED);
  });

  it('should create a event team', async () => {
    const toSave = {
      name: faker.company.name(),
      status: 'a',
      date_start: '2021-08-01 00:00:00',
      date_end: '2021-08-01 00:00:00',
      quantity: 10,
      functions_id: 1,
    };

    const data = await request(app.getHttpServer())
      .post(`/events/${eventId}/teams`)
      .send(toSave)
      .set('Authorization', `Bearer ${bearerToken}`)
      .set('Content-Type', 'application/json');

    teamId = data.body.data.id;

    expect(data.status).toBe(HttpStatus.CREATED);
    expect(data.body.data.id).toBeDefined();
    expect(data.body.data.teamsUsers).toBeDefined();
    expect(data.body.data.teamsUsers.length).toBe(toSave.quantity);

    Array.from({ length: toSave.quantity }).map((_, index) => {
      expect(data.body.data.teamsUsers[index].user_id).toBeNull();
      expect(data.body.data.teamsUsers[index].function_id).toBe(
        toSave.functions_id,
      );
      expect(data.body.data.teamsUsers[index].confirmed).toBe('a');
    });
  });

  it('should return the created event with event costs preview', async () => {
    const data = await request(app.getHttpServer())
      .get(`/events/${eventId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.OK);
    expect(data.body.data.total_preview).toBeDefined();
    expect(data.body.data.total_preview).toBeGreaterThan(0);
    expect(data.body.data.total_executed).toBeDefined();
    expect(data.body.data.total_executed).toBe(0);
    expect(data.body.data.total_by_answers).toBeDefined();
    expect(data.body.data.total_by_answers).toBe(0);
  });

  it('should return a team with team costs preview', async () => {
    const data = await request(app.getHttpServer())
      .get(`/events/${eventId}/teams/${teamId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.OK);
    expect(data.body.data.total_preview).toBeDefined();
    expect(data.body.data.total_preview).toBeGreaterThan(0);
    expect(data.body.data.total_executed).toBeDefined();
    expect(data.body.data.total_executed).toBe(0);
    expect(data.body.data.total_by_answers).toBeDefined();
    expect(data.body.data.total_by_answers).toBe(0);
  });

  it('should return unauthorized from create event team without token', async () => {
    const data = await request(app.getHttpServer()).post(
      `/events/${eventId}/teams`,
    );

    expect(data.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should return bad request from create event team without body', async () => {
    const data = await request(app.getHttpServer())
      .post(`/events/${eventId}/teams`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should return a list of users available for a team', async () => {
    const data = await request(app.getHttpServer())
      .get(`/events/${eventId}/teams/${teamId}/available-users`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.OK);
    expect(data.body.data.length).toBeGreaterThan(0);
  });
});
