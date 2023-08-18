import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { faker } from '@faker-js/faker';
import { GenderType } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UserDto } from './dto/user.dto';

describe('UsersService', () => {
  let userService: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
      imports: [PrismaModule],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  it('should return an array of users', async () => {
    const getUsers = await userService.findAll();

    expect(getUsers.length).toBeGreaterThanOrEqual(0);
  });

  it('should create a user', async () => {
    const createUserDto: UserDto = {
      name: faker.person.fullName(),
      nickname: faker.person.fullName().split(' ')[0],
      email: faker.internet.email(),
      cpf: (Math.random() + 1).toString(36).substring(6),
      rg: (Math.random() + 1).toString(36).substring(7),
      rg_emitted_by: faker.location.state(),
      password: faker.internet.password({ length: 8 }),
      gender: Object.values(GenderType).sort(() => Math.random() - 0.5)[0],
      birthdate: faker.date.past(),
      status: ['a', 'i', 'b'].sort(() => Math.random() - 0.5)[0],
      root: [true, false].sort(() => Math.random() - 0.5)[0],
    };

    const save = await userService.create(createUserDto);

    expect(save).toHaveProperty('id');
  });

  it('should save user session', async () => {
    const user = await prismaService.users.findFirst();
    const fakeRandomToken = faker.string.uuid();
    const save = await userService.saveUserSession(
      user.id,
      fakeRandomToken,
      '127.0.0.1',
    );

    expect(save).toBeTruthy();
  });

  it('should find user by email', async () => {
    const user = await prismaService.users.findFirst();
    const find = await userService.findByEmail(user.email);

    expect(find).toHaveProperty('id');
  });
});
