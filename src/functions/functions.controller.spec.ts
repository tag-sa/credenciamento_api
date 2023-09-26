import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import request from 'supertest';
import { FunctionsController } from './functions.controller';
import { FunctionsService } from './functions.service';

describe('FunctionsController', () => {
  let controller: FunctionsController;
  let app: INestApplication;
  let bearerToken = null;

  beforeEach(async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FunctionsController],
      providers: [FunctionsService],
      imports: [PrismaModule, AuthModule],
    }).compile();

    controller = module.get<FunctionsController>(FunctionsController);
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

  it('should return unauthorized', async () => {
    const { status } = await request(app.getHttpServer()).get('/functions');

    expect(status).toBe(401);
  });
  it('should return a list of functions', async () => {
    const { status, body } = await request(app.getHttpServer())
      .get('/functions')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(status).toBe(200);
    expect(body).toHaveProperty('data');
  });
});
