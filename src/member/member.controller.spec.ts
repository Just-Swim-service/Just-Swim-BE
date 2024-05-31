import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import { MockMemberRepository } from './member.service.spec';
import { MemberService } from './member.service';
import { UsersService } from 'src/users/users.service';
import { Response } from 'express';

class MockMemberService {
  insertMemberFromQR = jest.fn();
  checkCustomer = jest.fn();
  getAllMembersByInstructor = jest.fn();
  getAllMembersByFeedback = jest.fn();
}

class MockUsersService {
  findUserByEmail = jest.fn();
  createUser = jest.fn();
  findUserByPk = jest.fn();
  selectUserType = jest.fn();
  editUserProfile = jest.fn();
}

const mockMember = new MockMemberRepository().mockMember;

describe('MemberController', () => {
  let controller: MemberController;
  let memberService: MockMemberService;
  let usersService: MockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        { provide: MemberService, useClass: MockMemberService },
        { provide: UsersService, useClass: MockUsersService },
      ],
    }).compile();

    controller = module.get<MemberController>(MemberController);
    memberService = module.get<MemberService, MockMemberService>(MemberService);
    usersService = module.get<UsersService, MockUsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('insertMemberFromQR', () => {
    it('QR 코드를 통한 회원 등록', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
          },
        },
        redirect: jest.fn(),
      };
      usersService.findUserByPk.mockResolvedValue(undefined);

      await controller.insertMemberFromQR(1, res as Response);

      expect(res.redirect).toHaveBeenCalledWith('/signup');
    });
  });

  it('사용자 타입이 null일 때 타입 선택 페이지로 리디렉션해야 합니다', async () => {
    const res: Partial<Response> = {
      locals: {
        user: {
          userId: 1,
        },
      },
      redirect: jest.fn(),
    };

    usersService.findUserByPk.mockResolvedValue({ userType: null });

    await controller.insertMemberFromQR(1, res as Response);

    expect(res.redirect).toHaveBeenCalledWith(
      process.env.SELECT_USERTYPE_REDIRECT_URI,
    );
  });

  it('사용자 타입이 customer가 아닐 때 401 상태 코드와 메시지를 반환해야 합니다', async () => {
    const res: Partial<Response> = {
      locals: {
        user: {
          userId: 1,
        },
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    usersService.findUserByPk.mockResolvedValue({ userType: 'instructor' });

    await controller.insertMemberFromQR(1, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: '수강생으로 가입하지 않을 경우 수강에 제한이 있습니다.',
    });
  });

  it('사용자 타입이 customer일 때 회원을 등록하고 강의 페이지로 리디렉션해야 합니다', async () => {
    const res: Partial<Response> = {
      locals: {
        user: {
          userId: 1,
        },
      },
      redirect: jest.fn(),
    };

    usersService.findUserByPk.mockResolvedValue({ userType: 'customer' });

    await controller.insertMemberFromQR(1, res as Response);

    expect(memberService.insertMemberFromQR).toHaveBeenCalledWith(1, 1);
    expect(res.redirect).toHaveBeenCalledWith(`/api/lecture/1`);
  });

  it('예기치 않은 오류 발생 시 /error 페이지로 리디렉션해야 합니다', async () => {
    const res: Partial<Response> = {
      locals: {
        user: {
          userId: 1,
        },
      },
      status: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
    };

    usersService.findUserByPk.mockRejectedValue(new Error('Test Error'));

    await controller.insertMemberFromQR(1, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.redirect).toHaveBeenCalledWith('/error');
  });

  describe('getAllMembersByFeedback', () => {
    it('사용자 타입이 instructor일 때 모든 멤버 정보를 return', async () => {
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
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockMember]);
    });
  });
});
