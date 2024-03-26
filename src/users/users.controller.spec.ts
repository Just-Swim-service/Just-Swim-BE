import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { KakaoAuthGuard } from 'src/auth/guard/kakao.guard';
import { Request, Response } from 'express';
import { UsersRepository } from './users.repository';
import { Users } from './entity/users.entity';
import { NaverAuthGuard } from 'src/auth/guard/naver.guard';
import { GoogleAuthGuard } from 'src/auth/guard/google.guard';
import { CustomerService } from 'src/customer/customer.service';
import { InstructorService } from 'src/instructor/instructor.service';
import { CustomerRepository } from 'src/customer/customer.repository';
import { MockCustomerRepository } from 'src/customer/customer.controller.spec';
import { InstructorRepository } from 'src/instructor/instructor.repository';
import { MockInstructorRepository } from 'src/instructor/instructor.controller.spec';

class MockKakaoAuthGuard {
  canActivate = jest.fn().mockReturnValue(true);
}
class MockNaverAuthGuard {
  canActivate = jest.fn().mockReturnValue(true);
}
class MockGoogleAuthGuard {
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
      customer: [],
      instructor: [],
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
      customer: [],
      instructor: [],
    },
  ];
}

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let authService: AuthService;
  let customerService: CustomerService;
  let instructorService: InstructorService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        AuthService,
        CustomerService,
        InstructorService,
        { provide: UsersRepository, useClass: MockUsersRepository },
        { provide: CustomerRepository, useClass: MockCustomerRepository },
        { provide: InstructorRepository, useClass: MockInstructorRepository },
        {
          provide: KakaoAuthGuard,
          useClass: MockKakaoAuthGuard,
        },
        {
          provide: NaverAuthGuard,
          useClass: MockNaverAuthGuard,
        },
        {
          provide: GoogleAuthGuard,
          useClass: MockGoogleAuthGuard,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
    customerService = module.get<CustomerService>(CustomerService);
    instructorService = module.get<InstructorService>(InstructorService);
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

  // describe('kakaoCallback', () => {
  //   it('should handle Kakao login callback', async () => {
  //     const req: Partial<Request> = {
  //       user: {
  //         profile: {
  //           provider: 'kakao',
  //           username: '홍길동',
  //           _json: {
  //             kakao_account: {
  //               email: 'test@daum.net',
  //             },
  //             properties: {
  //               profile_image: null,
  //             },
  //           },
  //         },
  //       },
  //     };

  //     const res: Partial<Response> = {
  //       redirect: jest.fn(),
  //     };

  //     await controller.kakaoCallback(req as Request, res as Response, {});

  //     expect(authService.validateUser).toHaveBeenCalled();
  //     expect(authService.getToken).toHaveBeenCalled();
  //     expect(authService.createUser).toHaveBeenCalled();
  //     expect(res.redirect).toHaveBeenCalled();
  //   });
  // });

  // describe('naverCallback', () => {
  //   it('should handle naver login callback', async () => {
  //     const req: Partial<Request> = {
  //       user: {
  //         profile: {
  //           provider: 'naver',
  //           name: '홍길동',
  //           email: 'test@naver.com',
  //           profileImage: null,
  //         },
  //       },
  //     };

  //     const res: Partial<Response> = {
  //       redirect: jest.fn(),
  //     };

  //     await controller.naverCallback(req as Request, res as Response, {});

  //     expect(authService.validateUser).toHaveBeenCalled();
  //     expect(authService.getToken).toHaveBeenCalled();
  //     expect(authService.createUser).toHaveBeenCalled();
  //     expect(res.redirect).toHaveBeenCalled();
  //   });
  // });

  // describe('googleCallback', () => {
  //   it('should handle naver login callback', async () => {
  //     const req: Partial<Request> = {
  //       user: {
  //         profile: {
  //           provider: 'google',
  //           _json: {
  //             name: '홍길동',
  //             email: 'test@google.com',
  //             picture: null,
  //           },
  //         },
  //       },
  //     };

  //     const res: Partial<Response> = {
  //       redirect: jest.fn(),
  //     };

  //     await controller.kakaoCallback(req as Request, res as Response, {});

  //     expect(authService.validateUser).toHaveBeenCalled();
  //     expect(authService.getToken).toHaveBeenCalled();
  //     expect(authService.createUser).toHaveBeenCalled();
  //     expect(res.redirect).toHaveBeenCalled();
  //   });
  // });
});
