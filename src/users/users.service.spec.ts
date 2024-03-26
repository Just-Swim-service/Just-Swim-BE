import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { Users } from './entity/users.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findUserByEmail: jest.fn(),
            createUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUserByEmail', () => {
    it('should return a user when a user with the specified email and provider exists', async () => {
      const email = 'test@example.com';
      const provider = 'test_provider';
      const user: Users = {
        userId: 1,
        email,
        provider,
        name: '홍길동',
        birth: null,
        profileImage: null,
        phoneNumber: null,
        userType: 'customer',
        userCreatedAt: new Date(),
        userUpdatedAt: new Date(),
        userDeletedAt: null,
        customer: [],
        instructor: [],
      };
      (repository.findUserByEmail as jest.Mock).mockResolvedValue(user);

      const result = await service.findUserByEmail(email, provider);

      expect(result).toEqual(user);
    });

    it('should return undefined when no user with the specified email and provider exists', async () => {
      const email = 'nonexistent@example.com';
      const provider = 'nonexistent_provider';
      (repository.findUserByEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await service.findUserByEmail(email, provider);

      expect(result).toBeUndefined();
    });
  });

  describe('createUser', () => {
    it('should create a new user with the provided data', async () => {
      const userData = {
        email: 'newuser@example.com',
        profileImage: 'profile_image_url',
        name: 'New User',
        provider: 'test_provider',
        userType: 'customer',
      };
      const newUser: Users = {
        userId: 2,
        ...userData,
        birth: null,
        phoneNumber: null,
        userCreatedAt: new Date(),
        userUpdatedAt: new Date(),
        userDeletedAt: null,
        customer: [],
        instructor: [],
      };
      (repository.createUser as jest.Mock).mockResolvedValue(newUser);

      const result = await service.createUser(userData);

      expect(result).toEqual(newUser);
    });
  });
});
