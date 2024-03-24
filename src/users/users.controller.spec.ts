import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { KakaoAuthGuard } from 'src/auth/guard/kakao.guard';
import { Response } from 'express';
import { UsersRepository } from './users.repository';
import { Users } from './entity/users.entity';

class MockKakaoAuthGuard {
  canActivate = jest.fn().mockReturnValue(true);
}

export class MockUsersRepository {
  private readonly users: Users[] = [
    {
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
    },
    {
      userId: 2,
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
    },
  ];
}

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let authService: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        AuthService,
        { provide: UsersRepository, useClass: MockUsersRepository },
        {
          provide: KakaoAuthGuard,
          useClass: MockKakaoAuthGuard,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('selectUserType', () => {
    it.each`
      userType        | expectedStatus | expectedMessage
      ${'customer'}   | ${200}         | ${'userType 저장 완료'}
      ${'instructor'} | ${200}         | ${'userType 저장 완료'}
      ${''}           | ${400}         | ${'userType을 지정해주세요'}
    `(
      'should return $expectedMessage message when userType is $userType',
      async ({ userType, expectedStatus, expectedMessage }) => {
        const res: Partial<Response> = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };

        await controller.selectUserType(userType, res as Response, {});

        expect(res.status).toHaveBeenCalledWith(expectedStatus);
        expect(res.json).toHaveBeenCalledWith({ message: expectedMessage });
      },
    );
  });
});
