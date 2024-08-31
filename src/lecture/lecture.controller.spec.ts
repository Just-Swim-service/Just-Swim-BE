import { Test, TestingModule } from '@nestjs/testing';
import { LectureController } from './lecture.controller';
import { LectureService } from './lecture.service';
import { Request, Response } from 'express';
import { MockLectureRepository } from './lecture.service.spec';
import { EditLectureDto } from './dto/edit-lecture.dto';
import { LectureDto } from './dto/lecture.dto';
import { MemberService } from 'src/member/member.service';
import { MockMemberRepository } from 'src/member/member.service.spec';
import { ResponseService } from 'src/common/response/reponse.service';

class MockLectureService {
  getLectures = jest.fn();
  getScheduleLecturesByInstructor = jest.fn();
  getAllLecturesByInstructor = jest.fn();
  getScheduleLecturesByCustomer = jest.fn();
  getAllLecturesByCustomer = jest.fn();
  getLectureByPk = jest.fn();
  updateLecture = jest.fn();
  softDeleteLecture = jest.fn();
  createLecture = jest.fn();
}

class MockMemberService {
  getAllMembersByLectureId = jest.fn();
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

const mockLecture = new MockLectureRepository().mockLecture;
const mockMember = new MockMemberRepository().mockMember;

describe('LectureController', () => {
  let controller: LectureController;
  let lectureService: MockLectureService;
  let memberService: MockMemberService;
  let responseService: MockResponseService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LectureController],
      providers: [
        { provide: LectureService, useClass: MockLectureService },
        { provide: MemberService, useClass: MockMemberService },
        { provide: ResponseService, useClass: MockResponseService },
      ],
    }).compile();

    controller = module.get<LectureController>(LectureController);
    lectureService = module.get<LectureService, MockLectureService>(
      LectureService,
    );
    memberService = module.get<MemberService, MockMemberService>(MemberService);
    responseService = module.get<ResponseService, MockResponseService>(
      ResponseService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLecturesForSchedule', () => {
    it('instructor에 schedule에 해당하는 모든 lecture를 return (삭제 또는 만료된 lecture는 제외된다.)', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: 'instructor',
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      lectureService.getScheduleLecturesByInstructor.mockResolvedValue([
        mockLecture,
      ]);

      await controller.getLecturesForSchedule(res as Response);

      expect(
        lectureService.getScheduleLecturesByInstructor,
      ).toHaveBeenCalledWith(1);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '스케줄에 해당하는 강의 조회 성공',
        [mockLecture],
      );
    });

    it('customer에 schedule에 해당하는 모든 lecture를 return (삭제 또는 만료된 lecture는 제외된다.)', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 2,
            userType: 'customer',
          },
        },
      } as any;

      lectureService.getScheduleLecturesByCustomer.mockResolvedValue([
        mockLecture,
      ]);

      await controller.getLecturesForSchedule(res as Response);

      expect(lectureService.getScheduleLecturesByCustomer).toHaveBeenCalledWith(
        2,
      );
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '스케줄에 해당하는 강의 조회 성공',
        [mockLecture],
      );
    });
  });

  describe('getAllLectures', () => {
    it('instructor가 가지고 있는 모든 lecture를 return', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: 'instructor',
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      lectureService.getAllLecturesByInstructor.mockResolvedValue([
        mockLecture,
      ]);

      await controller.getAllLectures(res as Response);

      expect(lectureService.getAllLecturesByInstructor).toHaveBeenCalledWith(1);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '강의 전체 조회 성공',
        [mockLecture],
      );
    });

    it('customer가 가지고 있는 모든 lecture를 return', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 2,
            userType: 'customer',
          },
        },
      } as any;

      lectureService.getAllLecturesByCustomer.mockResolvedValue([mockLecture]);

      await controller.getAllLectures(res as Response);

      expect(lectureService.getAllLecturesByCustomer).toHaveBeenCalledWith(2);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '강의 전체 조회 성공',
        [mockLecture],
      );
    });
  });

  describe('getLectureDetail', () => {
    it('lectureId에 해당하는 lecture의 상세 정보를 조회하여 return', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: 'instructor',
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const lectureId = 1;

      lectureService.getLectureByPk.mockResolvedValue([mockLecture]);

      await controller.getLectureDetail(res as Response, lectureId);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '강의 상세 조회 성공',
        [mockLecture],
      );
    });
  });

  describe('updateLecture', () => {
    it('lectureId에 해당하는 lecture를 edit이 완료될 경우 success return', async () => {
      const req: Partial<Request> = {
        body: { editLectureDto: EditLectureDto },
      } as any;

      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: 'instructor',
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const lectureId = 1;

      lectureService.updateLecture.mockResolvedValue({ affected: 1 });

      await controller.updateLecture(res as Response, lectureId, req.body);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '강의 수정 성공',
      );
    });
  });

  describe('softDeleteLecture', () => {
    it('lectureId에 해당하는 lecture를 DeletedAt을 update해서 success return', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: 'instructor',
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const lectureId = 1;

      lectureService.softDeleteLecture.mockResolvedValue(true);

      await controller.softDeleteLecture(res as Response, lectureId);

      expect(lectureService.softDeleteLecture).toHaveBeenCalledWith(
        1,
        lectureId,
      );
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '강의 삭제 성공',
      );
    });
  });

  describe('createLecture', () => {
    it('instructor면 강의를 생성할 수 있다.', async () => {
      const req: Partial<Request> = {
        body: { lectureDto: LectureDto },
      };

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

      lectureService.createLecture.mockResolvedValue(mockLecture);

      await controller.createLecture(res as Response, req.body);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '강의 생성 성공',
        { lectureId: mockLecture.lectureId },
      );
    });
  });

  describe('getAllMemberByInstructor', () => {
    it('instructor가 개설한 강의 목록에 참여한 수강생 list를 조회', async () => {
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

      const lectureId = 1;

      memberService.getAllMembersByLectureId.mockResolvedValue([mockMember]);

      await controller.getAllMemberByInstructor(res as Response, lectureId);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '강의에 해당하는 수강생 목록 조회 성공',
        [mockMember],
      );
    });
  });
});
