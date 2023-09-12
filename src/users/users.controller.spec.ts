import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';
import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { faker } from '@faker-js/faker';
import { GenderType } from '@prisma/client';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let app: INestApplication;
  let controller: UsersController;
  let bearerToken = null;

  const createUser: UserDto = {
    name: faker.person.fullName(),
    nickname: faker.person.fullName().split(' ')[0],
    email: faker.internet.email(),
    document: generateRandomDocument(),
    rg: (Math.random() + 1).toString(36).substring(7),
    rg_emitted_by: faker.location.state(),
    password: 'qwert123',
    gender: Object.values(GenderType).sort(() => Math.random() - 0.5)[0],
    birthdate: faker.date.past(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
      imports: [PrismaModule, AuthModule],
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

    expect(data.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should return bad request from empty login payload', async () => {
    const data = await request(app.getHttpServer()).post('/users/login');

    expect(data.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should return bad request from login with empty email payload', async () => {
    const data = await request(app.getHttpServer()).post('/users/login').send({
      password: 'password',
    });

    expect(data.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should return bad request from login with empty password payload', async () => {
    const data = await request(app.getHttpServer()).post('/users/login').send({
      email: 'email',
    });

    expect(data.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should return unauthorized from login with wrong email', async () => {
    const data = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'email@cda.com.br', password: 'senfha' })
      .set('Content-Type', 'application/json');

    expect(data.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should return bad request from create user', async () => {
    const data = await request(app.getHttpServer()).post('/users');

    expect(data.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should create and update a user without nickname', async () => {
    const nicknameLessUser: UserDto = {
      name: faker.person.fullName(),
      nickname: '',
      email: faker.internet.email(),
      document: generateRandomDocument(),
      rg: (Math.random() + 1).toString(36).substring(7),
      rg_emitted_by: faker.location.state(),
      password: 'qwert123',
      gender: Object.values(GenderType).sort(() => Math.random() - 0.5)[0],
      birthdate: faker.date.past(),
    };

    const data = await request(app.getHttpServer())
      .post('/users')
      .send({
        ...nicknameLessUser,
        address: {
          zip: '12345678',
          address: 'Rua Teste',
          neighborhood: 'Bairro Teste',
          city: 'Cidade Teste',
          state: 'Estado Teste',
          number: '123',
          complement: 'Complemento Teste',
          type: 'res',
        },
      })
      .set('Content-Type', 'application/json');

    nicknameLessUser.id = data.body.id;

    const loginData = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: nicknameLessUser.email,
        password: nicknameLessUser.password,
      })
      .set('Content-Type', 'application/json');

    const bearerToken = loginData.body.data.access_token;

    const update = await request(app.getHttpServer())
      .put(`/users/${nicknameLessUser.id}`)
      .send({
        nickname: faker.person.fullName().split(' ')[0],
      })
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.CREATED);
    expect(update.status).toBe(HttpStatus.OK);
  });
  it('should create a user', async () => {
    const data = await request(app.getHttpServer())
      .post('/users')
      .send({
        ...createUser,
        address: {
          zip: '12345678',
          address: 'Rua Teste',
          neighborhood: 'Bairro Teste',
          city: 'Cidade Teste',
          state: 'Estado Teste',
          number: '123',
          complement: 'Complemento Teste',
          type: 'res',
        },
      })
      .set('Content-Type', 'application/json');

    createUser.id = data.body.id;

    expect(data.status).toBe(HttpStatus.CREATED);
  });

  it('should return unauthorized from login with wrong password', async () => {
    const data = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: createUser.email, password: '12345567' })
      .set('Content-Type', 'application/json');

    expect(data.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should login user', async () => {
    const data = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: createUser.email, password: createUser.password })
      .set('Content-Type', 'application/json');
    bearerToken = data.body.data.access_token;

    expect(data.status).toBe(HttpStatus.OK);
    expect(data.body.data.access_token).toBeDefined();
  });

  it(`/GET users`, async () => {
    const data = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.OK);
    expect(data.body.length).toBeGreaterThan(0);
  });

  it('should get `me` data', async () => {
    const data = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(data.status).toBe(HttpStatus.OK);
    expect(data.body.id).toBe(createUser.id);
  });

  it('should return email duplicated from updated user', async () => {
    const usersList = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${bearerToken}`);

    const emailDuplicated = usersList.body.find(
      (user: User) => user.email !== createUser.email,
    );

    const data = await request(app.getHttpServer())
      .put(`/users/${createUser.id}`)
      .send({
        email: emailDuplicated.email,
      })
      .set('Authorization', `Bearer ${bearerToken}`)
      .set('Content-Type', 'application/json');

    expect(data.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should return cpf duplicated from updated user', async () => {
    const usersList = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${bearerToken}`);

    const randomUser = usersList.body.find((user: User) => {
      if (user.cpf) {
        return user.cpf !== createUser.document;
      }

      if (user.cnpj) {
        return user.cnpj !== createUser.document;
      }
    });

    const data = await request(app.getHttpServer())
      .put(`/users/${createUser.id}`)
      .send({
        document: randomUser.cpf ? randomUser.cpf : randomUser.cnpj,
      })
      .set('Authorization', `Bearer ${bearerToken}`)
      .set('Content-Type', 'application/json');

    expect(data.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should update user', async () => {
    const data = await request(app.getHttpServer())
      .put(`/users/${createUser.id}`)
      .send({
        name: 'Teste',
        password: '12345687979',
        cpf: (Math.random() + 1).toString(36).substring(6),
        email: faker.internet.email(),
      })
      .set('Authorization', `Bearer ${bearerToken}`)
      .set('Content-Type', 'application/json');

    expect(data.status).toBe(HttpStatus.OK);
    expect(data.body.name).toBe('Teste');
  });

  afterAll(async () => {
    await app.close();
  });
});

function generateRandomDocument() {
  if (Math.random() < 0.5) {
    return generateCPF();
  } else {
    return generateCNPJ();
  }
}

function generateCPF() {
  const randomDigits = () => Math.floor(Math.random() * 10);

  const cpfArray = new Array(9).fill(null).map(randomDigits);

  const firstVerifier =
    cpfArray.reduce((acc, digit, index) => acc + digit * (10 - index), 0) % 11;
  cpfArray.push(firstVerifier < 2 ? 0 : 11 - firstVerifier);

  const secondVerifier =
    cpfArray.reduce((acc, digit, index) => acc + digit * (11 - index), 0) % 11;
  cpfArray.push(secondVerifier < 2 ? 0 : 11 - secondVerifier);

  return cpfArray.join('');
}

function generateCNPJ() {
  const randomDigits = () => Math.floor(Math.random() * 10);

  const cnpjArray = new Array(12).fill(null).map(randomDigits);

  cnpjArray.push(calculateCNPJVerifier(cnpjArray, 5));
  cnpjArray.push(calculateCNPJVerifier(cnpjArray, 6));

  return cnpjArray.join('');
}

function calculateCNPJVerifier(array, multiplier) {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += array[i] * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}
