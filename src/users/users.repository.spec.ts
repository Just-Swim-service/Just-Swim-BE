import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entity/users.entity';
import { CreateUsersDto } from './dto/create-users.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { UserType } from './enum/user-type.enum';
import { CreateWithdrawalReasonDto } from 'src/withdrawal-reason/dto/ceate-withdrawal-reason.dto';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let repo: jest.Mocked<Repository<Users>>;

  const mockRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getRepositoryToken(Users),
          useValue: mockRepo,
        },
      ],
    }).compile();

    usersRepository = module.get<UsersRepository>(UsersRepository);
    repo = module.get(getRepositoryToken(Users));
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

  it('should find user by primary key', async () => {
    repo.findOne.mockResolvedValue({ userId: 1 } as Users);

    const result = await usersRepository.findUserByPk(1);
    expect(result).toEqual({ userId: 1 });
    expect(repo.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
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
    expect(repo.update).toHaveBeenCalledWith({ userId: 1 }, dto);
  });

  it('should withdraw user', async () => {
    const dto: CreateWithdrawalReasonDto = {
      withdrawalReasonContent: '더 이상 사용하지 않음',
    };

    const mockTransaction = jest.fn(async (callback: any) => {
      return await callback({
        update: jest.fn(),
        insert: jest.fn(),
      });
    });

    repo.manager.transaction = mockTransaction;

    await usersRepository.withdrawUser(1, dto);
    expect(mockTransaction).toHaveBeenCalled();
  });
});
