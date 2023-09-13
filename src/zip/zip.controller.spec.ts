import { Test, TestingModule } from '@nestjs/testing';
import { ZipController } from './zip.controller';
import { HttpModule } from '@nestjs/axios';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('CepController', () => {
  let controller: ZipController;

  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZipController],
      providers: [],
      imports: [HttpModule],
    }).compile();

    controller = module.get<ZipController>(ZipController);
    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(app).toBeDefined();
  });

  it('should return a valid address', async () => {
    const data = await request(app.getHttpServer()).get('/zip/01001000');

    expect(data.status).toBe(200);

    expect(data.body.data.address).toBeDefined();
  });

  it('should return a not found', async () => {
    const data = await request(app.getHttpServer()).get('/zip/00000000');

    expect(data.status).toBe(404);
  });

  it('should return a bad request', async () => {
    const data = await request(app.getHttpServer()).get('/zip/01');
    expect(data.status).toBe(400);
  });
  it('should return a bad request from non numeric zip', async () => {
    const data = await request(app.getHttpServer()).get('/zip/80250abc');
    expect(data.status).toBe(400);
  });
});
