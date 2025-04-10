import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { CustomerService } from 'src/customer/customer.service';
import { InstructorService } from 'src/instructor/instructor.service';
import { ResponseService } from 'src/common/response/reponse.service';
import { Request, Response } from 'express';
import { WithdrawalReasonDto } from 'src/withdrawal-reason/dto/ceate-withdrawal-reason.dto';
import { EditUserDto } from './dto/edit-user.dto';

// Mock Services
const mockUsersService = {
  findUserByEmail: jest.fn(),
  findUserByPk: jest.fn(),
  selectUserType: jest.fn(),
  editUserProfile: jest.fn(),
  logout: jest.fn(),
  withdrawUser: jest.fn(),
};

const mockAuthService = {
  validateUser: jest.fn(),
  createUser: jest.fn(),
  getToken: jest.fn(),
};

const mockResponseService = {
  success: jest.fn(),
  error: jest.fn(),
  unauthorized: jest.fn(),
  notFound: jest.fn(),
  conflict: jest.fn(),
  forbidden: jest.fn(),
  internalServerError: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CustomerService, useValue: {} },
        { provide: InstructorService, useValue: {} },
        { provide: ResponseService, useValue: mockResponseService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('editUserProfile', () => {
    it('user 프로필 수정', async () => {
      const editUserDto: EditUserDto = {
        name: '홍길동',
        profileImage: 'new_profile_image_url',
        birth: '1990.01.01',
        phoneNumber: '010-1234-5678',
      };

      const res: Partial<Response> = {
        locals: { user: { userId: 1 } },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockUsersService.editUserProfile.mockResolvedValue(true);

      await controller.editUserProfile(editUserDto, res as Response);

      expect(mockResponseService.success).toHaveBeenCalledWith(
        res,
        '프로필 수정 완료',
      );
    });
  });

  describe('logout', () => {
    it('clearcookie를 통해 로그아웃', async () => {
      const res: Partial<Response> = {
        locals: { user: { userId: 1 } },
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.logout(res as Response);

      expect(res.clearCookie).toHaveBeenCalledWith('authorization');
      expect(mockResponseService.success).toHaveBeenCalledWith(
        res,
        'logout 완료',
      );
    });
  });

  describe('withdrawUser', () => {
    it('회원 탈퇴 처리', async () => {
      const withdrawalReasonDto: WithdrawalReasonDto = {
        withdrawalReasonContent: '기능이 유용하지 않아요.',
      };

      const res: Partial<Response> = {
        locals: { user: { userId: 1 } },
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.withdrawUser(res as Response, withdrawalReasonDto);

      expect(res.clearCookie).toHaveBeenCalledWith('authorization');
      expect(mockResponseService.success).toHaveBeenCalledWith(
        res,
        '회원 탈퇴 완료',
      );
    });
  });
});
