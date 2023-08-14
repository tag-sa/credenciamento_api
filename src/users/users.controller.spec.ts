import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('UsersController', () => {
  let app: INestApplication;
  let controller: UsersController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
      imports: [PrismaModule],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it(`/GET users`, async () => {
    const data = await request(app.getHttpServer()).get('/users');

    expect(data.status).toBe(200);
    expect(data.body.length).toBeGreaterThan(0);
  });
});
