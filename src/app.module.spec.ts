import { AppModule } from './app.module';

describe('UsersController', () => {
  let appModule: AppModule;

  beforeAll(async () => {
    appModule = new AppModule();
  });

  it('should be defined', () => {
    expect(appModule).toBeDefined();
  });
});
