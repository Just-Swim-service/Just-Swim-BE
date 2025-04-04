import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { Users } from './entity/users.entity';
import { CustomerRepository } from 'src/customer/customer.repository';
import { InstructorRepository } from 'src/instructor/instructor.repository';
import { MockCustomerRepository } from 'src/customer/customer.service.spec';
import { MockInstructorRepository } from 'src/instructor/instructor.service.spec';
import { NotFoundException } from '@nestjs/common';
import { AwsService } from 'src/common/aws/aws.service';
import { UserType } from './enum/user-type.enum';
import { WithdrawalReason } from 'src/withdrawal-reason/entity/withdrawal-reason.entity';
import { WithdrawalReasonDto } from 'src/withdrawal-reason/dto/withdrawal-reason.dto';
import {
  mockUser,
  MockUsersRepository,
} from 'src/common/mocks/mock-user.repository';

const mockCustomer = new MockCustomerRepository().mockCustomer;
const mockInstructor = new MockInstructorRepository().mockInstructor;

describe('UsersService', () => {
  let usersService: UsersService;
  let awsService: AwsService;
  let usersRepository: UsersRepository;
  let customerRepository: CustomerRepository;
  let instructorRepository: InstructorRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: AwsService,
          useValue: {
            uploadImageToS3: jest.fn(),
            deleteImageFromS3: jest.fn(),
          },
        },
        {
          provide: UsersRepository,
          useValue: MockUsersRepository,
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

    usersService = module.get<UsersService>(UsersService);
    awsService = module.get<AwsService>(AwsService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    customerRepository = module.get<CustomerRepository>(CustomerRepository);
    instructorRepository =
      module.get<InstructorRepository>(InstructorRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('findUserByEmail', () => {
    it('email, provider가 맞는 user가 있으면 return', async () => {
      const email = 'test@example.com';
      const provider = 'test_provider';
      (usersRepository.findUserByEmail as jest.Mock).mockResolvedValue(
        mockUser,
      );

      const result = await usersService.findUserByEmail(email, provider);

      expect(result).toEqual(mockUser);
    });

    it('email, provider와 맞는 user가 없으면 NotFoundException throw', async () => {
      const email = 'nonexistent@example.com';
      const provider = 'nonexistent_provider';
      (usersRepository.findUserByEmail as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await usersService.findUserByEmail(email, provider);

      expect(result).toBeUndefined();
    });
  });

  describe('createUser', () => {
    it('data에 맞춰서 newUser 생성', async () => {
      const userData = {
        email: 'newuser@example.com',
        profileImage: 'profile_image_url',
        name: 'New User',
        provider: 'test_provider',
        userType: UserType.Customer,
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
        withdrawalReason: [],
      };
      (usersRepository.createUser as jest.Mock).mockResolvedValue(newUser);

      const result = await usersService.createUser(userData);

      expect(result).toEqual(newUser);
    });
  });

  describe('findUserByPk', () => {
    it('userId에 맞는 user return', async () => {
      const userId = 1;
      (usersRepository.findUserByPk as jest.Mock).mockResolvedValue(mockUser);

      const result = await usersService.findUserByPk(userId);

      expect(result).toEqual(mockUser);
    });

    it('userId에 맞는 user가 없으면 undefined return', async () => {
      const userId = 10;
      (usersRepository.findUserByPk as jest.Mock).mockResolvedValue(undefined);

      await expect(usersService.findUserByPk(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('selectUserType', () => {
    it('userType이 null인 경우, Customer로 설정하고 createCustomer 호출', async () => {
      const userId = 1;
      const userType = UserType.Customer;
      mockUser.userType = null;
      (usersRepository.findUserByPk as jest.Mock).mockResolvedValue(mockUser);

      await usersService.selectUserType(userId, userType);

      expect(usersRepository.selectUserType).toHaveBeenCalledWith(
        userId,
        userType,
      );
      expect(customerRepository.createCustomer).toHaveBeenCalledWith(userId);
      expect(instructorRepository.createInstructor).not.toHaveBeenCalled();
    });

    it('userType이 null인 경우, Instructor로 설정하고 createInstructor 호출', async () => {
      const userId = 1;
      const userType = UserType.Instructor;
      mockUser.userType = null;
      (usersRepository.findUserByPk as jest.Mock).mockResolvedValue(mockUser);

      await usersService.selectUserType(userId, userType);

      expect(usersRepository.selectUserType).toHaveBeenCalledWith(
        userId,
        userType,
      );
      expect(instructorRepository.createInstructor).toHaveBeenCalledWith(
        userId,
      );
      expect(customerRepository.createCustomer).not.toHaveBeenCalled();
    });

    it('userType이 이미 존재하는 경우, NotAcceptableException throw', async () => {
      const userId = 1;
      mockUser.userType = UserType.Customer;
      (usersRepository.findUserByPk as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        usersService.selectUserType(userId, UserType.Instructor),
      ).rejects.toThrow('계정에 타입이 이미 지정되어 있습니다.');

      expect(usersRepository.selectUserType).not.toHaveBeenCalled();
      expect(customerRepository.createCustomer).not.toHaveBeenCalled();
      expect(instructorRepository.createInstructor).not.toHaveBeenCalled();
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

      jest.spyOn(usersRepository, 'findUserByPk').mockResolvedValue(mockUser);
      jest.spyOn(usersRepository, 'editUserProfile').mockResolvedValue();
      jest
        .spyOn(awsService, 'uploadImageToS3')
        .mockResolvedValue('new_profile_image_url');
      jest.spyOn(awsService, 'deleteImageFromS3').mockResolvedValue();

      await usersService.editUserProfile(userId, editUserDto);

      expect(usersRepository.findUserByPk).toHaveBeenCalledWith(userId);

      if (mockUser.profileImage) {
        expect(awsService.deleteImageFromS3).toHaveBeenCalledWith(
          'old_profile_image_url',
        );
      }

      expect(usersRepository.editUserProfile).toHaveBeenCalledWith(
        userId,
        editUserDto,
      );
    });
  });

  describe('withdrawUser', () => {
    it('userId에 해당하는 user를 탈퇴', async () => {
      const userId = 1;

      const withdrawalReason: WithdrawalReason = {
        withdrawalReasonId: 1,
        withdrawalReasonContent: '기능이 유용하지 않아요.',
        user: mockUser,
        withdrawalReasonCreatedAt: new Date(),
        withdrawalReasonUpdatedAt: new Date(),
      };
      const withdrawalReasonDto: WithdrawalReasonDto = {
        withdrawalReasonContent: withdrawalReason.withdrawalReasonContent,
      };
      jest.spyOn(usersRepository, 'withdrawUser').mockResolvedValue();

      await usersService.withdrawUser(userId, withdrawalReasonDto);

      expect(usersRepository.withdrawUser).toHaveBeenCalledWith(
        userId,
        withdrawalReasonDto,
      );
    });
  });
});
