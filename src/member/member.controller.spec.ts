import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { UsersService } from 'src/users/users.service';
import { Response } from 'express';
import { ResponseService } from 'src/common/response/response.service';
import { mockMember } from 'src/common/mocks/mock-member.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MyLogger } from 'src/common/logger/logger.service';

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
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-secret'),
          },
        },
        {
          provide: MyLogger,
          useValue: {
            error: jest.fn(),
          },
        },
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
      const redirectMock = jest.fn();

      const res: Partial<Response> = {
        locals: {},
        redirect: redirectMock,
      };

      await controller.insertMemberFromQR(1, res as Response);

      expect(responseService.unauthorized).toHaveBeenCalledWith(
        res,
        '로그인 후 사용해주세요.',
      );
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
      expect(responseService.unauthorized).toHaveBeenCalledWith(
        res,
        'userType 선택 후 사용해주세요.',
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
            name: 'nickname',
            userType: 'customer',
          },
        },
        redirect: jest.fn(),
      };

      await controller.insertMemberFromQR(1, res as Response);

      expect(memberService.insertMemberFromQR).toHaveBeenCalledWith(
        1,
        'nickname',
        1,
      );
      expect(res.redirect).toHaveBeenCalledWith(process.env.HOME_REDIRECT_URI);
    });

    it('에러 발생 시 internalServerError 호출', async () => {
      const res = {
        locals: { user: { userId: 1, userType: 'customer' } },
      } as Partial<Response> as Response;

      memberService.insertMemberFromQR.mockRejectedValue(
        new Error('Test Error'),
      );

      await controller.insertMemberFromQR(1, res);

      expect(responseService.internalServerError).toHaveBeenCalledWith(
        res,
        '회원 등록 중 오류 발생',
      );
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
