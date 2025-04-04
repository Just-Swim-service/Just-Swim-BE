import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { UsersService } from 'src/users/users.service';
import { Response } from 'express';
import { ResponseService } from 'src/common/response/reponse.service';
import { mockMember } from 'src/common/mocks/mock-member.repository';

class MockMemberService {
  insertMemberFromQR = jest.fn();
  getAllMembersByFeedback = jest.fn();
  getMemberInfo = jest.fn();
}

class MockUsersService {
  findUserByEmail = jest.fn();
  createUser = jest.fn();
  findUserByPk = jest.fn();
  selectUserType = jest.fn();
  editUserProfile = jest.fn();
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

describe('MemberController', () => {
  let controller: MemberController;
  let memberService: MockMemberService;
  let usersService: MockUsersService;
  let responseService: MockResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        { provide: MemberService, useClass: MockMemberService },
        { provide: UsersService, useClass: MockUsersService },
        { provide: ResponseService, useClass: MockResponseService },
      ],
    }).compile();

    controller = module.get<MemberController>(MemberController);
    memberService = module.get<MemberService, MockMemberService>(MemberService);
    usersService = module.get<UsersService, MockUsersService>(UsersService);
    responseService = module.get<ResponseService, MockResponseService>(
      ResponseService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('insertMemberFromQR', () => {
    it('user가 없으면 /signup으로 리디렉션', async () => {
      const res: Partial<Response> = {
        locals: {},
        redirect: jest.fn(),
      };

      await controller.insertMemberFromQR(1, res as Response);
      expect(res.redirect).toHaveBeenCalledWith('/signup');
    });

    it('userType이 null이면 SELECT_USERTYPE_REDIRECT_URI로 리디렉션', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: null,
          },
        },
        redirect: jest.fn(),
      };

      await controller.insertMemberFromQR(1, res as Response);
      expect(res.redirect).toHaveBeenCalledWith(
        process.env.SELECT_USERTYPE_REDIRECT_URI,
      );
    });

    it('userType이 customer가 아니면 unauthorized 호출', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: 'instructor',
          },
        },
      };

      await controller.insertMemberFromQR(1, res as Response);

      expect(responseService.unauthorized).toHaveBeenCalledWith(
        res,
        '수강생으로 가입하지 않을 경우 수강에 제한이 있습니다.',
      );
    });

    it('userType이 customer일 경우 insertMemberFromQR 호출 및 HOME_REDIRECT_URI로 리디렉션', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: 'customer',
          },
        },
        redirect: jest.fn(),
      };

      await controller.insertMemberFromQR(1, res as Response);

      expect(memberService.insertMemberFromQR).toHaveBeenCalledWith(1, 1);
      expect(res.redirect).toHaveBeenCalledWith(process.env.HOME_REDIRECT_URI);
    });

    it('에러 발생 시 500 상태코드와 /error로 리디렉션', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: 'customer',
          },
        },
        status: jest.fn().mockReturnThis(),
        redirect: jest.fn(),
      };

      memberService.insertMemberFromQR.mockRejectedValue(
        new Error('Test Error'),
      );

      await controller.insertMemberFromQR(1, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.redirect).toHaveBeenCalledWith('/error');
    });
  });

  describe('getAllMembersByFeedback', () => {
    it('userType이 instructor가 아니면 unauthorized 호출', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: 'customer',
          },
        },
      };

      await controller.getAllMembersByFeedback(res as Response);

      expect(responseService.unauthorized).toHaveBeenCalledWith(
        res,
        '수강생 조회 권한이 없습니다.',
      );
    });

    it('userType이 instructor면 수강생 리스트 반환', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: 'instructor',
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      memberService.getAllMembersByFeedback.mockResolvedValue([mockMember]);

      await controller.getAllMembersByFeedback(res as Response);

      expect(memberService.getAllMembersByFeedback).toHaveBeenCalledWith(1);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '수강생 조회 성공',
        [mockMember],
      );
    });
  });

  describe('getMemberInfo', () => {
    it('memberInfo 반환', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 99, // instructorUserId
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      memberService.getMemberInfo.mockResolvedValue(mockMember);

      await controller.getMemberInfo(res as Response, 1); // 1 = memberUserId

      expect(memberService.getMemberInfo).toHaveBeenCalledWith(1, 99);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '수강생 정보 조회 성공',
        mockMember,
      );
    });
  });
});
