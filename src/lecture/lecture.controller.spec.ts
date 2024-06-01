import { Test, TestingModule } from '@nestjs/testing';
import { LectureController } from './lecture.controller';
import { LectureService } from './lecture.service';
import { Request, Response } from 'express';
import { MockLectureRepository } from './lecture.service.spec';
import { HttpStatus } from '@nestjs/common';
import { EditLectureDto } from './dto/editLecture.dto';
import { LectureDto } from './dto/lecture.dto';
import { MemberService } from 'src/member/member.service';
import { MockMemberRepository } from 'src/member/member.service.spec';

class MockLectureService {
  getLectures = jest.fn();
  getLecturesByInstructor = jest.fn();
  getAllLecturesByInstructor = jest.fn();
  getLectureByPk = jest.fn();
  updateLecture = jest.fn();
  softDeleteLecture = jest.fn();
  createLecture = jest.fn();
}

class MockMemberService {
  getAllMemberByLectureId = jest.fn();
}

const mockLecture = new MockLectureRepository().mockLecture;
const mockMember = new MockMemberRepository().mockMember;

describe('LectureController', () => {
  let controller: LectureController;
  let lectureService: MockLectureService;
  let memberService: MockMemberService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LectureController],
      providers: [
        { provide: LectureService, useClass: MockLectureService },
        { provide: MemberService, useClass: MockMemberService },
      ],
    }).compile();

    controller = module.get<LectureController>(LectureController);
    lectureService = module.get<LectureService, MockLectureService>(
      LectureService,
    );
    memberService = module.get<MemberService, MockMemberService>(MemberService);
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
      };

      lectureService.getLecturesByInstructor.mockResolvedValue(mockLecture);

      await controller.getLecturesForSchedule(res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockLecture);
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
      };

      lectureService.getAllLecturesByInstructor.mockResolvedValue(mockLecture);

      await controller.getLecturesForSchedule(res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockLecture);
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
      };
      const lectureId = 1;

      lectureService.getLectureByPk.mockResolvedValue(mockLecture);

      await controller.getLectureDetail(res as Response, lectureId);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockLecture);
    });
  });

  describe('updateLecture', () => {
    it('lectureId에 해당하는 lecture를 edit이 완료될 경우 success return', async () => {
      const req: Partial<Request> = {
        body: { editLectureDto: EditLectureDto },
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
      const lectureId = 1;

      lectureService.updateLecture.mockResolvedValue({ affected: 1 });

      await controller.updateLecture(res as Response, lectureId, req.body);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ message: '강의 수정 성공' });
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
      };
      const lectureId = 1;

      lectureService.softDeleteLecture.mockResolvedValue({ affected: 1 });

      await controller.softDeleteLecture(res as Response, lectureId);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ message: '강의 삭제 성공' });
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

      lectureService.createLecture.mockResolvedValue(true);

      await controller.createLecture(res as Response, req.body);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ message: '강의 생성 성공' });
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

      memberService.getAllMemberByLectureId.mockResolvedValue([mockMember]);

      await controller.getAllMemberByInstructor(res as Response, lectureId);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith([mockMember]);
    });
  });
});
