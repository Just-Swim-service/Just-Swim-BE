import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { Users } from './entity/users.entity';
import { CustomerRepository } from 'src/customer/customer.repository';
import { InstructorRepository } from 'src/instructor/instructor.repository';
import { MockCustomerRepository } from 'src/customer/customer.service.spec';
import { MockInstructorRepository } from 'src/instructor/instructor.service.spec';
import { NotFoundException } from '@nestjs/common';

export class MockUsersRepository {
  readonly mockUser: Users = {
    userId: 1,
    email: 'test@example.com',
    provider: 'kakao',
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
    member: [],
    lecture: [],
    feedback: [],
    feedbackTarget: [],
  };
}

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: UsersRepository;
  let customerRepository: CustomerRepository;
  let instructorRepository: InstructorRepository;

  const mockUser = new MockUsersRepository().mockUser;
  const mockCustomer = new MockCustomerRepository().mockCustomer;
  const mockInstructor = new MockInstructorRepository().mockInstructor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findUserByEmail: jest.fn().mockResolvedValue(mockUser),
            findUserByPk: jest.fn().mockResolvedValue(mockUser),
            createUser: jest.fn().mockResolvedValue(mockUser),
            selectUserType: jest.fn().mockResolvedValue(mockUser),
            editUserProfile: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: CustomerRepository,
          useValue: {
            createCustomer: jest.fn().mockResolvedValue(mockCustomer),
            findCustomerByUserId: jest.fn().mockResolvedValue(mockCustomer),
          },
        },
        {
          provide: InstructorRepository,
          useValue: {
            createInstructor: jest.fn().mockResolvedValue(mockInstructor),
            findInstructorByUserId: jest.fn().mockResolvedValue(mockInstructor),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    customerRepository = module.get<CustomerRepository>(CustomerRepository);
    instructorRepository =
      module.get<InstructorRepository>(InstructorRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUserByEmail', () => {
    it('email, provider가 맞는 user가 있으면 return', async () => {
      const email = 'test@example.com';
      const provider = 'test_provider';
      (usersRepository.findUserByEmail as jest.Mock).mockResolvedValue(
        mockUser,
      );

      const result = await service.findUserByEmail(email, provider);

      expect(result).toEqual(mockUser);
    });

    it('email, provider와 맞는 user가 없으면 NotFoundException throw', async () => {
      const email = 'nonexistent@example.com';
      const provider = 'nonexistent_provider';
      (usersRepository.findUserByEmail as jest.Mock).mockResolvedValue(
        undefined,
      );

      await expect(service.findUserByEmail(email, provider)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createUser', () => {
    it('data에 맞춰서 newUser 생성', async () => {
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
        member: [],
        lecture: [],
        feedback: [],
        feedbackTarget: [],
      };
      (usersRepository.createUser as jest.Mock).mockResolvedValue(newUser);

      const result = await service.createUser(userData);

      expect(result).toEqual(newUser);
    });
  });

  describe('findUserByPk', () => {
    it('userId에 맞는 user return', async () => {
      const userId = 1;
      (usersRepository.findUserByPk as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findUserByPk(userId);

      expect(result).toEqual(mockUser);
    });

    it('userId에 맞는 user가 없으면 undefined return', async () => {
      const userId = 10;
      (usersRepository.findUserByPk as jest.Mock).mockResolvedValue(undefined);

      await expect(service.findUserByPk(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('selectUserType', () => {
    it('userId에 해당하는 user의 userType을 설정', async () => {
      const userId = 1;
      const userType = 'customer' || 'instructor';
      mockUser.userType = null;
      await service.selectUserType(userId, userType);

      expect(usersRepository.selectUserType).toHaveBeenCalledWith(
        userId,
        userType,
      );
      expect(customerRepository.createCustomer).toHaveBeenCalledWith(userId);
    });
  });

  describe('editUserProfile', () => {
    it('userId에 해당하는 user의 프로필을 수정', async () => {
      const userId = 1;
      const editUserDto = {
        name: '홍길동',
        profileImage: 'new_profile_image_url',
        birth: '1990.01.01',
        phoneNumber: '010-1234-5678',
      };
      await service.editUserProfile(userId, editUserDto);

      expect(usersRepository.editUserProfile).toHaveBeenCalledWith(
        userId,
        editUserDto,
      );
    });
  });
});
