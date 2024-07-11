import { Test, TestingModule } from '@nestjs/testing';
import { Lecture } from './entity/lecture.entity';
import { LectureRepository } from './lecture.repository';
import { LectureService } from './lecture.service';
import { MemberRepository } from 'src/member/member.repository';
import { MockMemberRepository } from 'src/member/member.service.spec';
import { AwsService } from 'src/common/aws/aws.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { MockUsersRepository } from 'src/users/users.service.spec';
import * as QRCode from 'qrcode';

const mockUser = new MockUsersRepository().mockUser;

export class MockLectureRepository {
  readonly mockLecture: Lecture = {
    lectureId: 1,
    user: mockUser,
    lectureTitle: '아침 5반',
    lectureContent: '이 강의는 고급자를 대상으로 합니다. 응용을 다룹니다.',
    lectureTime: '12:00-14:00',
    lectureDays: '화목',
    lectureLocation: '강동구 실내 수영장',
    lectureColor: '#F1554C',
    lectureQRCode: 'QR 코드',
    lectureEndDate: '2024.05.31',
    lectureCreatedAt: new Date(),
    lectureUpdatedAt: new Date(),
    lectureDeletedAt: null,
    member: [],
    feedbackTarget: [],
  };
}

describe('LectureService', () => {
  let service: LectureService;
  let lectureRepository: LectureRepository;
  let memberRepository: MemberRepository;
  let awsService: AwsService;

  const mockLecture = new MockLectureRepository().mockLecture;
  const mockMember = new MockMemberRepository().mockMember;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LectureService,
        {
          provide: AwsService,
          useValue: {
            uploadImageToS3: jest.fn(),
            deleteImageFromS3: jest.fn(),
            uploadQRCodeToS3: jest.fn(),
          },
        },
        {
          provide: LectureRepository,
          useValue: {
            getLectures: jest.fn().mockResolvedValue(mockLecture),
            getLecturesByInstructor: jest.fn().mockResolvedValue(mockLecture),
            getAllLecturesByInstructor: jest
              .fn()
              .mockResolvedValue(mockLecture),
            getLectureByPk: jest.fn().mockResolvedValue(mockLecture),
            updateLecture: jest.fn().mockResolvedValue(mockLecture),
            softDeleteLecture: jest.fn().mockResolvedValue(mockLecture),
            createLecture: jest.fn().mockResolvedValue(mockLecture),
            saveQRCode: jest.fn(),
          },
        },
        {
          provide: MemberRepository,
          useValue: {
            insertMemberFromQR: jest.fn().mockResolvedValue(mockMember),
            getAllMembersByLectureId: jest.fn().mockResolvedValue([mockMember]),
          },
        },
      ],
    }).compile();

    service = module.get<LectureService>(LectureService);
    lectureRepository = module.get<LectureRepository>(LectureRepository);
    memberRepository = module.get<MemberRepository>(MemberRepository);
    awsService = module.get<AwsService>(AwsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLectures', () => {
    it('모든 lecture를 return', async () => {
      (lectureRepository.getLectures as jest.Mock).mockResolvedValue([
        { mockLecture },
      ]);

      const result = await service.getLectures();

      expect(result).toEqual([{ mockLecture }]);
    });
  });

  describe('getLecturesByInstructor', () => {
    it('userId에 해당하는 삭제 또는 지난 lecture를 제외하고 lecture를 조회하여 return', async () => {
      const userId = 1;
      (
        lectureRepository.getLecturesByInstructor as jest.Mock
      ).mockResolvedValue(mockLecture);

      const result = await service.getLecturesByInstructor(userId);

      expect(result).toEqual(mockLecture);
    });
  });

  describe('getAllLecturesByInstructor', () => {
    it('userId에 해당하는 모든 lecture를 조회하여 return', async () => {
      const userId = 1;
      (
        lectureRepository.getAllLecturesByInstructor as jest.Mock
      ).mockResolvedValue(mockLecture);

      const result = await service.getAllLecturesByInstructor(userId);

      expect(result).toEqual(mockLecture);
    });
  });

  describe('getLectureByPk', () => {
    it('lectureId에 해당하는 lecture의 상세한 정보를 return', async () => {
      const userId = 1;
      const lectureId = 1;

      const result = await service.getLectureByPk(userId, lectureId);

      expect(result).toEqual({
        lecture: mockLecture,
        lectureMembers: [mockMember],
      });
      expect(lectureRepository.getLectureByPk).toHaveBeenCalledWith(lectureId);
      expect(memberRepository.getAllMembersByLectureId).toHaveBeenCalledWith(
        lectureId,
      );
    });

    it('lectureId에 해당하는 lecture가 존재하지 않으면 NotFoundException을 throw', async () => {
      const userId = 1;
      const lectureId = 999;

      (lectureRepository.getLectureByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.getLectureByPk(userId, lectureId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('강의 접근 권한이 없으면 UnauthorizedException을 throw', async () => {
      const userId = 999;
      const lectureId = 1;

      (lectureRepository.getLectureByPk as jest.Mock).mockResolvedValue(
        mockLecture,
      );
      (
        memberRepository.getAllMembersByLectureId as jest.Mock
      ).mockResolvedValue([]);

      await expect(service.getLectureByPk(userId, lectureId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('updateLecture', () => {
    it('lectureId에 해당하는 lecture를 수정하고 updateResult를 return', async () => {
      const userId = 1;
      const lectureId = 1;
      const editLectureDto = {
        lectureTitle: '아침 3반',
        lectureContent: '이 강의는 고급자를 대상으로 합니다. 응용을 다룹니다.',
        lectureTime: '12:00-14:00',
        lectureDays: '화목',
        lectureLocation: '고양체육관',
        lectureColor: '#F1547C',
        lectureQRCode: 'QR 코드',
        lectureEndDate: '2024.05.31',
      };
      await service.updateLecture(userId, lectureId, editLectureDto);
      expect(lectureRepository.updateLecture).toHaveBeenCalledWith(
        lectureId,
        editLectureDto,
      );
    });
  });

  describe('softDeleteLecture', () => {
    it('lectureId에 해당하는 lecture를 softDelete하고 updateResult를 return', async () => {
      const userId = 1;
      const lectureId = 1;

      await service.softDeleteLecture(userId, lectureId);
      expect(lectureRepository.softDeleteLecture).toHaveBeenCalledWith(
        lectureId,
      );
    });
  });

  describe('createLecture', () => {
    it('instructor에 의해 새로운 lecture를 생성하고 newLecture를 return', async () => {
      const userId = 1;
      const lectureDto = {
        lectureTitle: '아침 3반',
        lectureContent: '이 강의는 고급자를 대상으로 합니다. 응용을 다룹니다.',
        lectureTime: '12:00-14:00',
        lectureDays: '화목',
        lectureLocation: '고양체육관',
        lectureColor: '#F1547C',
        lectureQRCode: 'QR 코드',
        lectureEndDate: '2024.05.31',
      };
      const newLecture: Lecture = {
        user: mockUser,
        lectureId: 2,
        ...lectureDto,
        lectureCreatedAt: new Date(),
        lectureUpdatedAt: new Date(),
        lectureDeletedAt: null,
        member: [],
        feedbackTarget: [],
      };
      const mockQRCode = `${newLecture.lectureId}`;
      jest.spyOn(QRCode, 'toDataURL').mockResolvedValue(mockQRCode as never);
      (lectureRepository.createLecture as jest.Mock).mockResolvedValue(
        newLecture,
      );

      const result = await service.createLecture(userId, lectureDto);

      expect(result).toEqual(newLecture);
      expect(lectureRepository.createLecture).toHaveBeenCalledWith(
        userId,
        lectureDto,
      );
      expect(QRCode.toDataURL).toHaveBeenCalledWith(`${newLecture.lectureId}`);
      expect(awsService.uploadQRCodeToS3).toHaveBeenCalledWith(
        newLecture.lectureId,
        expect.any(String),
      );
    });
  });
});
