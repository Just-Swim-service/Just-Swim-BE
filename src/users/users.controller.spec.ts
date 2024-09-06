import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { KakaoAuthGuard } from 'src/auth/guard/kakao.guard';
import { Request, Response } from 'express';
import { NaverAuthGuard } from 'src/auth/guard/naver.guard';
import { GoogleAuthGuard } from 'src/auth/guard/google.guard';
import { CustomerService } from 'src/customer/customer.service';
import { InstructorService } from 'src/instructor/instructor.service';
import { ResponseService } from 'src/common/response/reponse.service';
import { WithdrawalReasonDto } from 'src/withdrawal-reason/dto/withdrawal-reason.dto';
import { MockUsersRepository } from './users.service.spec';
import { WithdrawalReason } from 'src/withdrawal-reason/entity/withdrawal-reason.entity';
import { EditUserDto } from './dto/edit-user.dto';

class MockKakaoAuthGuard {
  canActivate = jest.fn().mockReturnValue(true);
}
class MockNaverAuthGuard {
  canActivate = jest.fn().mockReturnValue(true);
}
class MockGoogleAuthGuard {
  canActivate = jest.fn().mockReturnValue(true);
}

class MockUsersService {
  findUserByEmail = jest.fn();
  findUserByPk = jest.fn();
  selectUserType = jest.fn();
  editUserProfile = jest.fn();
  logout = jest.fn();
  withdrawUser = jest.fn();
}

class MockAuthService {
  validateUser = jest.fn();
  createUser = jest.fn();
  getToken = jest.fn();
}

class MockCustomerService {
  createCustomer = jest.fn();
}

class MockInstructorService {
  createInstructor = jest.fn();
}

class MockResponseService {
  success = jest.fn();
  error = jest.fn();
  unauthorized = jest.fn();
  notFound = jest.fn();
  conflict = jest.fn();
  forbidden = jest.fn();
  internalServerError = jest.fn();
}

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: MockUsersService;
  let authService: MockAuthService;
  let customerService: MockCustomerService;
  let instructorService: MockInstructorService;
  let responseService: MockResponseService;

  const mockUser = new MockUsersRepository().mockUser;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useClass: MockUsersService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: CustomerService, useClass: MockCustomerService },
        { provide: InstructorService, useClass: MockInstructorService },
        { provide: KakaoAuthGuard, useClass: MockKakaoAuthGuard },
        { provide: NaverAuthGuard, useClass: MockNaverAuthGuard },
        { provide: GoogleAuthGuard, useClass: MockGoogleAuthGuard },
        { provide: ResponseService, useClass: MockResponseService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService, MockUsersService>(UsersService);
    authService = module.get<AuthService, MockAuthService>(AuthService);
    customerService = module.get<CustomerService, MockCustomerService>(
      CustomerService,
    );
    instructorService = module.get<InstructorService, MockInstructorService>(
      InstructorService,
    );
    responseService = module.get<ResponseService, MockResponseService>(
      ResponseService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('kakaoCallback', () => {
    it('kakao 소셜 로그인 callback', async () => {
      const req: Partial<Request> = {
        user: {
          provider: 'kakao',
          username: '홍길동',
          _json: {
            kakao_account: {
              email: 'test@daum.net',
              birthyear: '1995',
              birthday: '0913',
              phone_number: '+82 010-1234-5678',
            },
            properties: {
              profile_image: null,
            },
          },
        },
        headers: {
          host: 'localhost:3000',
        },
      };

      const res: Partial<Response> = {
        redirect: jest.fn(),
      };

      authService.validateUser.mockResolvedValue(null);
      authService.createUser.mockResolvedValue({ userId: 1 });
      authService.getToken.mockResolvedValue('accessToken');

      await controller.kakaoCallback(req as Request, res as Response);

      expect(authService.validateUser).toHaveBeenCalled();
      expect(authService.createUser).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        `${process.env.SELECT_USERTYPE_REDIRECT_URI}/?token=accessToken`,
      );
    });
  });

  describe('naverCallback', () => {
    it('naver 소셜 로그인 callback', async () => {
      const req: Partial<Request> = {
        user: {
          provider: 'naver',
          name: '홍길동',
          email: 'test@naver.com',
          profileImage: null,
          birthYear: '1995',
          birthday: '09-13',
          mobile: '010-1234-5678',
        },
        headers: {
          host: 'localhost:3000',
        },
      };

      const res: Partial<Response> = {
        redirect: jest.fn(),
      };

      authService.validateUser.mockResolvedValue(null);
      authService.createUser.mockResolvedValue({ userId: 1 });
      authService.getToken.mockResolvedValue('accessToken');

      await controller.naverCallback(req as Request, res as Response);

      expect(authService.validateUser).toHaveBeenCalled();
      expect(authService.createUser).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        `${process.env.SELECT_USERTYPE_REDIRECT_URI}/?token=accessToken`,
      );
    });
  });

  describe('googleCallback', () => {
    it('google 소셜 로그인 callback', async () => {
      const req: Partial<Request> = {
        user: {
          provider: 'google',
          _json: {
            name: '홍길동',
            email: 'test@google.com',
            picture: null,
          },
        },
        headers: {
          host: 'localhost:3000',
        },
      };

      const res: Partial<Response> = {
        redirect: jest.fn(),
      };

      authService.validateUser.mockResolvedValue(null);
      authService.createUser.mockResolvedValue({ userId: 1 });
      authService.getToken.mockResolvedValue('accessToken');

      await controller.googleCallback(req as Request, res as Response);

      expect(authService.validateUser).toHaveBeenCalled();
      expect(authService.createUser).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        `${process.env.SELECT_USERTYPE_REDIRECT_URI}/?token=accessToken`,
      );
    });
  });

  describe('selectUserType', () => {
    it('userType이 지정 될 경우 success return', async () => {
      const req: Partial<Request> = {
        params: {
          userType: 'customer',
        },
      };

      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      usersService.findUserByPk.mockResolvedValue({ userType: null });

      await controller.selectUserType(
        req.params.userType as any,
        res as Response,
      );

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        'userType 지정 완료',
      );
    });
  });

  describe('findUserProfile', () => {
    it('user 프로필 return', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockUserProfile = {
        email: 'test@example.com',
        userType: 'customer',
        name: '홍길동',
        profileImage: 'testImage.jpg',
        birth: '1995.09.13',
        phoneNumber: '010-1234-1234',
      };

      usersService.findUserByPk.mockResolvedValue(mockUserProfile);

      await controller.findUserProfile(res as Response);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '프로필 조회 성공',
        mockUserProfile,
      );
    });
  });

  describe('editUserProfile', () => {
    it('user 프로필 수정을 진행', async () => {
      const userId = 1;
      const editUserDto: EditUserDto = {
        name: '홍길동',
        profileImage: 'new_profile_image_url',
        birth: '1990.01.01',
        phoneNumber: '010-1234-5678',
      };

      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      usersService.editUserProfile.mockResolvedValue(true);

      await controller.editUserProfile(editUserDto, res as Response);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '프로필 수정 완료',
      );
    });
  });

  describe('logout', () => {
    it('clearcookie를 통해 로그아웃 처리', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
          },
        },
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.logout(res as Response);

      expect(res.clearCookie).toHaveBeenCalledWith('authorization');
      expect(responseService.success).toHaveBeenCalledWith(res, 'logout 완료');
    });
  });

  describe('withdrawUser', () => {
    it('회원 탈퇴 처리', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
          },
        },
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

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

      await controller.withdrawUser(res as Response, withdrawalReasonDto);

      expect(res.clearCookie).toHaveBeenCalledWith('authorization');
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '회원 탈퇴 완료',
      );
    });
  });
});
