import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { EventsService } from 'src/events/events.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import request from 'supertest';
import { AdvertisersController } from './advertisers.controller';
import { AdvertisersService } from './advertisers.service';

describe('AdvertisersController', () => {
  let controller: AdvertisersController;
  let app: INestApplication;
  let bearerToken = null;
  let advertiserId = null;
  let placeId = null;

  beforeEach(async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvertisersController],
      providers: [AdvertisersService, EventsService],
      imports: [PrismaModule, AuthModule],
    }).compile();

    controller = module.get<AdvertisersController>(AdvertisersController);
    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login user', async () => {
    const data = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'junior@tagsa.com.br', password: 'qwert123' })
      .set('Content-Type', 'application/json');

    bearerToken = data.body.data.access_token;

    expect(data.status).toBe(HttpStatus.OK);
    expect(data.body.data.access_token).toBeDefined();
  });

  it('should return unauthorized from create advertiser without token', async () => {
    const data = await request(app.getHttpServer()).post('/advertisers');

    expect(data.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should return bad request from create advertiser', async () => {
    const data = await request(app.getHttpServer())
      .post('/advertisers')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should create a advertiser', async () => {
    const data = await request(app.getHttpServer())
      .post('/advertisers')
      .send({
        name: faker.company.name(),
      })
      .set('Authorization', `Bearer ${bearerToken}`);

    advertiserId = data.body.data.id;

    expect(data.status).toBe(HttpStatus.CREATED);
  });

  it('should return bad request from update advertiser', async () => {
    const data = await request(app.getHttpServer())
      .put(`/advertisers/${advertiserId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should update a advertiser', async () => {
    const data = await request(app.getHttpServer())
      .put(`/advertisers/${advertiserId}`)
      .send({
        name: faker.company.name(),
        url: faker.internet.url(),
        about: faker.lorem.paragraph().substring(0, 400),
      })
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.OK);
  });

  it('should return not found from update advertiser from other account', async () => {
    const data = await request(app.getHttpServer())
      .put(`/advertisers/1`)
      .send({
        name: faker.company.name(),
      })
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should return not found from update inexistent advertiser', async () => {
    const data = await request(app.getHttpServer())
      .put(`/advertisers/0`)
      .send({
        name: faker.company.name(),
      })
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should return a list of advertisers', async () => {
    const data = await request(app.getHttpServer())
      .get('/advertisers')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.OK);
    expect(data.body.data.length).toBeGreaterThan(0);
  });

  it('should return a advertiser', async () => {
    const data = await request(app.getHttpServer())
      .get(`/advertisers/${advertiserId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.OK);
    expect(data.body.data.id).toBe(advertiserId);
    expect(data.body.data.events).toBeDefined();
    expect(typeof data.body.data.events).toBe('object');
    expect(data.body.data.pastEvents).toBeDefined();
    expect(typeof data.body.data.pastEvents).toBe('object');
  });

  it('should return not found from get inexistent advertiser', async () => {
    const data = await request(app.getHttpServer())
      .get(`/advertisers/0`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should return not found from advertiser from other account', async () => {
    const data = await request(app.getHttpServer())
      .get(`/advertisers/1`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should return not found from delete advertiser from other account', async () => {
    const data = await request(app.getHttpServer())
      .delete(`/advertisers/1`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should return not found from delete inexistent advertiser', async () => {
    const data = await request(app.getHttpServer())
      .delete(`/advertisers/0`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should insert an advertiser place', async () => {
    const data = await request(app.getHttpServer())
      .post(`/advertisers/${advertiserId}/places`)
      .send({
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode(),
        neighborhood: faker.location.county(),
        number: faker.number.int().toString(),
      })
      .set('Authorization', `Bearer ${bearerToken}`);

    placeId = data.body.data.id;

    expect(data.status).toBe(HttpStatus.CREATED);
  });

  it('should return a list of advertiser places', async () => {
    const data = await request(app.getHttpServer())
      .get(`/advertisers/${advertiserId}/places`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.OK);
    expect(data.body.data).toBeDefined();
    expect(typeof data.body.data).toBe('object');
    expect(data.body.data.length).toBeGreaterThan(0);
  });

  it('should delete a advertiser place', async () => {
    const data = await request(app.getHttpServer())
      .delete(`/advertisers/${advertiserId}/places/${placeId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.OK);
  });

  it('should delete a advertiser', async () => {
    const data = await request(app.getHttpServer())
      .delete(`/advertisers/${advertiserId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.OK);
  });

  afterAll(async () => {
    await app.close();
  });
});
