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
import { HttpStatus } from '@nestjs/common';
import { EditUserDto } from './dto/editUser.dto';

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

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: MockUsersService;
  let authService: MockAuthService;
  let customerService: MockCustomerService;
  let instructorService: MockInstructorService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useClass: MockUsersService,
        },
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
        {
          provide: CustomerService,
          useClass: MockCustomerService,
        },
        {
          provide: InstructorService,
          useClass: MockInstructorService,
        },
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
    usersService = module.get<UsersService, MockUsersService>(UsersService);
    authService = module.get<AuthService, MockAuthService>(AuthService);
    customerService = module.get<CustomerService, MockCustomerService>(
      CustomerService,
    );
    instructorService = module.get<InstructorService, MockInstructorService>(
      InstructorService,
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
        process.env.SELECT_USERTYPE_REDIRECT_URI,
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
        process.env.SELECT_USERTYPE_REDIRECT_URI,
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
        process.env.SELECT_USERTYPE_REDIRECT_URI,
      );
    });
  });

  describe('selectUserType', () => {
    it('유효하지 않은 userType 지정했을 시 bad request return', async () => {
      const req: Partial<Request> = {
        params: {
          userType: 'invalidType',
        },
      };

      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.selectUserType(req.params.userType, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: 'userType을 지정해주세요.',
      });
    });

    it('userType을 이미 지정 했을 경우 not acceptable return', async () => {
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

      usersService.findUserByPk.mockResolvedValue({ userType: 'customer' });

      await controller.selectUserType(req.params.userType, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_ACCEPTABLE);
      expect(res.json).toHaveBeenCalledWith({
        message: '계정에 타입이 이미 지정되어 있습니다.',
      });
    });

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

      await controller.selectUserType(req.params.userType, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ message: 'userType 지정 완료' });
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

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockUserProfile);
    });

    it('user 프로필 조회 실패 시 not found return', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      usersService.findUserByPk.mockResolvedValue(null);

      await controller.findUserProfile(res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: 'user 정보를 찾을 수 없습니다.',
      });
    });
  });

  describe('editUserProfile', () => {
    it('프로필 수정이 정상적으로 진행되지 않을 경우 bad request return', async () => {
      const req: Partial<Request> = { body: { ediUserDto: EditUserDto } };

      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      usersService.editUserProfile.mockResolvedValue({ affected: 0 });

      await controller.editUserProfile(req.body, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: '프로필을 수정할 수 없습니다.',
      });
    });

    it('프로필 수정이 정상적으로 진행 된 경우 success return', async () => {
      const req: Partial<Request> = { body: { ediUserDto: EditUserDto } };

      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      usersService.editUserProfile.mockResolvedValue({ affected: 1 });

      await controller.editUserProfile(req.body, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ message: '프로필 수정 완료' });
    });
  });
});
