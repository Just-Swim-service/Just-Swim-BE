import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entity/users.entity';
import { CreateUsersDto } from './dto/create-users.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { UserType } from './enum/user-type.enum';
import { CreateWithdrawalReasonDto } from 'src/withdrawal-reason/dto/ceate-withdrawal-reason.dto';
import { Instructor } from 'src/instructor/entity/instructor.entity';
import { Customer } from 'src/customer/entity/customer.entity';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let repo: jest.Mocked<Repository<Users>>;
  let instructorRepo: jest.Mocked<Repository<Instructor>>;
  let customerRepo: jest.Mocked<Repository<Customer>>;

  const mockRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };

  const mockInstructorRepo = {
    update: jest.fn(),
  };

  const mockCustomerRepo = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getRepositoryToken(Users),
          useValue: mockRepo,
        },
        {
          provide: getRepositoryToken(Instructor),
          useValue: mockInstructorRepo,
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepo,
        },
      ],
    }).compile();

    usersRepository = module.get<UsersRepository>(UsersRepository);
    repo = module.get(getRepositoryToken(Users));
    instructorRepo = module.get(getRepositoryToken(Instructor));
    customerRepo = module.get(getRepositoryToken(Customer));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should find user by email and provider', async () => {
    const expected = { userId: 1 };
    repo.findOne.mockResolvedValue(expected as Users);

    const result = await usersRepository.findUserByEmail(
      'test@example.com',
      'kakao',
    );
    expect(result).toEqual(expected);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { email: 'test@example.com', provider: 'kakao' },
    });
  });

  it('should find user by primary key with relations', async () => {
    const mockUser = {
      userId: 1,
      instructor: [{ workingLocation: '서울시 강남구' }],
      customer: [{ customerNickname: '수영초보' }],
    };
    repo.findOne.mockResolvedValue(mockUser as Users);

    const result = await usersRepository.findUserByPk(1);
    expect(result).toEqual(mockUser);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { userId: 1 },
      relations: ['instructor', 'customer'],
    });
  });

  it('should create a new user', async () => {
    const dto: CreateUsersDto = {
      email: 'test@example.com',
      provider: 'kakao',
      name: '홍길동',
    };

    repo.save.mockResolvedValue({ userId: 1 } as Users);

    const result = await usersRepository.createUser(dto);
    expect(result).toEqual({ userId: 1 });
    expect(repo.save).toHaveBeenCalledWith(dto);
  });

  it('should update user type', async () => {
    await usersRepository.selectUserType(1, UserType.Customer);
    expect(repo.update).toHaveBeenCalledWith(
      { userId: 1 },
      { userType: UserType.Customer },
    );
  });

  it('should edit user profile', async () => {
    const dto: EditUserDto = {
      name: '김철수',
      profileImage: 'new-profile-url',
    };

    await usersRepository.editUserProfile(1, dto);
    expect(repo.update).toHaveBeenCalledWith(
      { userId: 1 },
      {
        name: dto.name,
        profileImage: dto.profileImage,
        birth: dto.birth,
        phoneNumber: dto.phoneNumber,
      },
    );
  });

  it('should edit instructor profile when instructor fields are provided', async () => {
    const dto: EditUserDto = {
      name: '김강사',
      instructorWorkingLocation: '서울시 강남구',
      instructorCareer: '10년 경력',
      instructorIntroduction: '자유형 전문 강사입니다',
    };

    await usersRepository.editInstructorProfile(1, dto);
    expect(instructorRepo.update).toHaveBeenCalledWith(
      { user: { userId: 1 } },
      {
        workingLocation: '서울시 강남구',
        career: '10년 경력',
        introduction: '자유형 전문 강사입니다',
      },
    );
  });

  it('should edit customer profile when customer fields are provided', async () => {
    const dto: EditUserDto = {
      name: '박고객',
      customerNickname: '수영초보',
    };

    await usersRepository.editCustomerProfile(1, dto);
    expect(customerRepo.update).toHaveBeenCalledWith(
      { user: { userId: 1 } },
      { customerNickname: '수영초보' },
    );
  });

  it('should not update instructor when all instructor fields are null', async () => {
    // Mock 초기화
    jest.clearAllMocks();

    const dto: EditUserDto = {
      name: '김강사',
      instructorWorkingLocation: null,
      instructorCareer: null,
      instructorHistory: null,
      instructorIntroduction: null,
      instructorCurriculum: null,
      instructorYoutubeLink: null,
      instructorInstagramLink: null,
      instructorFacebookLink: null,
    };

    await usersRepository.editInstructorProfile(1, dto);
    expect(instructorRepo.update).not.toHaveBeenCalled();
  });

  it('should withdraw user', async () => {
    const dto: CreateWithdrawalReasonDto = {
      withdrawalReasonContent: '더 이상 사용하지 않음',
    };

    const mockInsert = jest.fn();
    const mockUpdate = jest.fn();

    const mockTransaction = jest.fn(async (callback: any) => {
      return await callback({
        insert: mockInsert,
        update: mockUpdate,
      });
    });

    repo.manager.transaction = mockTransaction;

    await usersRepository.withdrawUser(1, dto);
    
    // 트랜잭션이 호출되었는지 확인
    expect(mockTransaction).toHaveBeenCalled();
    
    // WithdrawalReason insert가 먼저 호출되었는지 확인
    expect(mockInsert).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        user: { userId: 1 },
        withdrawalReasonContent: '더 이상 사용하지 않음',
      }),
    );
    
    // Users update가 호출되었는지 확인 (refreshToken null 포함)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.anything(),
      { userId: 1 },
      expect.objectContaining({
        email: null,
        userType: null,
        provider: null,
        name: null,
        profileImage: null,
        birth: null,
        phoneNumber: null,
        refreshToken: null,
        userDeletedAt: expect.any(Date),
      }),
    );
  });
});
