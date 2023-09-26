import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { GenderType } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let userService: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
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
      document: generateRandomDocument(),
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
