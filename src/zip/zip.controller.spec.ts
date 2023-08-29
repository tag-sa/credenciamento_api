import { Test, TestingModule } from '@nestjs/testing';
import { ZipController } from './zip.controller';
import { HttpModule } from '@nestjs/axios';

describe('CepController', () => {
  let controller: ZipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZipController],
      providers: [],
      imports: [HttpModule],
    }).compile();

    controller = module.get<ZipController>(ZipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
