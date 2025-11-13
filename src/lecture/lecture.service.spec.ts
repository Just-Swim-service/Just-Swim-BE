import { Test, TestingModule } from '@nestjs/testing';
import { Lecture } from './entity/lecture.entity';
import { LectureRepository } from './lecture.repository';
import { LectureService } from './lecture.service';
import { MemberRepository } from 'src/member/member.repository';
import { AwsService } from 'src/common/aws/aws.service';
import { UsersService } from 'src/users/users.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import {
  mockMember,
  MockMemberRepository,
} from 'src/common/mocks/mock-member.repository';
import {
  mockLecture,
  MockLectureRepository,
} from 'src/common/mocks/mock-lecture.repository';
import { mockUser } from 'src/common/mocks/mock-user.repository';

describe('LectureService', () => {
  let service: LectureService;
  let lectureRepository: LectureRepository;
  let memberRepository: MemberRepository;
  let awsService: AwsService;
  let usersService: UsersService;

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
          useValue: MockLectureRepository,
        },
        {
          provide: MemberRepository,
          useValue: MockMemberRepository,
        },
        {
          provide: UsersService,
          useValue: {
            findUserByPk: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LectureService>(LectureService);
    lectureRepository = module.get<LectureRepository>(LectureRepository);
    memberRepository = module.get<MemberRepository>(MemberRepository);
    awsService = module.get<AwsService>(AwsService);
    usersService = module.get<UsersService>(UsersService);
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

  describe('getScheduleLecturesByInstructor', () => {
    it('userId에 해당하는 삭제 또는 지난 lecture를 제외하고 lecture를 조회하여 return', async () => {
      const userId = 1;
      (
        lectureRepository.getScheduleLecturesByInstructor as jest.Mock
      ).mockResolvedValue([mockLecture]);

      const result = await service.getScheduleLecturesByInstructor(userId);

      expect(result).toEqual([
        expect.objectContaining({
          lectureId: mockLecture.lectureId,
          lectureTitle: mockLecture.lectureTitle,
          lectureContent: mockLecture.lectureContent,
          lectureTime: mockLecture.lectureTime,
          lectureDays: mockLecture.lectureDays,
          lectureLocation: mockLecture.lectureLocation,
          lectureColor: mockLecture.lectureColor,
          lectureQRCode: mockLecture.lectureQRCode,
          lectureEndDate: mockLecture.lectureEndDate,
          lectureCreatedAt: mockLecture.lectureCreatedAt,
          members: [],
        }),
      ]);
    });
  });

  describe('getAllLecturesByInstructor', () => {
    it('userId에 해당하는 모든 lecture를 조회하여 return', async () => {
      const userId = 1;
      (
        lectureRepository.getAllLecturesByInstructor as jest.Mock
      ).mockResolvedValue([mockLecture]);

      const result = await service.getAllLecturesByInstructor(userId);

      expect(result).toEqual([
        expect.objectContaining({
          lectureId: mockLecture.lectureId,
          lectureTitle: mockLecture.lectureTitle,
          lectureContent: mockLecture.lectureContent,
          lectureTime: mockLecture.lectureTime,
          lectureDays: mockLecture.lectureDays,
          lectureLocation: mockLecture.lectureLocation,
          lectureColor: mockLecture.lectureColor,
          lectureQRCode: mockLecture.lectureQRCode,
          lectureEndDate: mockLecture.lectureEndDate,
          members: [],
        }),
      ]);
    });
  });

  describe('getScheduleLecturesByCustomer', () => {
    it('userId에 해당하는 삭제 또는 지난 lecture를 제외하고 lecture를 조회하여 return', async () => {
      const userId = 1;
      (
        lectureRepository.getScheduleLecturesByCustomer as jest.Mock
      ).mockResolvedValue([mockLecture]);

      const result = await service.getScheduleLecturesByCustomer(userId);

      expect(result).toEqual([
        expect.objectContaining({
          lectureId: mockLecture.lectureId,
          lectureTitle: mockLecture.lectureTitle,
          lectureContent: mockLecture.lectureContent,
          lectureTime: mockLecture.lectureTime,
          lectureDays: mockLecture.lectureDays,
          lectureLocation: mockLecture.lectureLocation,
          lectureColor: mockLecture.lectureColor,
          lectureQRCode: mockLecture.lectureQRCode,
          lectureEndDate: mockLecture.lectureEndDate,
          lectureCreatedAt: mockLecture.lectureCreatedAt,
          instructor: {
            instructorName: undefined,
            instructorProfileImage: undefined,
          },
        }),
      ]);
    });
  });

  describe('getAllLecturesByCustomer', () => {
    it('userId에 해당하는 모든 lecture를 조회하여 return', async () => {
      const userId = 1;
      (
        lectureRepository.getAllLecturesByCustomer as jest.Mock
      ).mockResolvedValue([mockLecture]);

      const result = await service.getAllLecturesByCustomer(userId);

      expect(result).toEqual([
        expect.objectContaining({
          lectureId: mockLecture.lectureId,
          lectureTitle: mockLecture.lectureTitle,
          lectureContent: mockLecture.lectureContent,
          lectureTime: mockLecture.lectureTime,
          lectureDays: mockLecture.lectureDays,
          lectureLocation: mockLecture.lectureLocation,
          lectureColor: mockLecture.lectureColor,
          lectureQRCode: mockLecture.lectureQRCode,
          lectureEndDate: mockLecture.lectureEndDate,
          instructor: {
            name: undefined,
            profileImage: undefined,
          },
        }),
      ]);
    });
  });

  describe('getLectureByPk', () => {
    it('lectureId에 해당하는 lecture의 상세한 정보를 return', async () => {
      const userId = 1;
      const lectureId = 1;

      // Mock data for the lecture
      const mockLectureData = [
        {
          lectureId: 1,
          lectureTitle: 'Sample Lecture',
          lectureContent: 'Sample Content',
          lectureTime: '10:00-12:00',
          lectureDays: '월수금',
          lectureLocation: 'Sample Location',
          lectureColor: '#FFFFFF',
          lectureQRCode: 'sample_qr_code',
          lectureEndDate: '2024.12.31',
          instructorName: 'Sample Instructor',
          instructorProfileImage: 'instructor_image_url',
          memberUserId: 2,
          memberProfileImage: 'member_image_url',
        },
      ];

      jest
        .spyOn(lectureRepository, 'getLectureByPk')
        .mockResolvedValue(mockLectureData);

      const result = await service.getLectureByPk(userId, lectureId);

      // Expected lecture object
      const expectedLecture = {
        lectureId: 1,
        lectureTitle: 'Sample Lecture',
        lectureContent: 'Sample Content',
        lectureTime: '10:00-12:00',
        lectureDays: '월수금',
        lectureLocation: 'Sample Location',
        lectureColor: '#FFFFFF',
        lectureQRCode: 'sample_qr_code',
        lectureEndDate: '2024.12.31',
        instructor: {
          instructorName: 'Sample Instructor',
          instructorProfileImage: 'instructor_image_url',
        },
        members: [
          {
            userId: 2,
            profileImage: 'member_image_url',
          },
        ],
      };

      expect(result).toEqual(expectedLecture);
      expect(lectureRepository.getLectureByPk).toHaveBeenCalledWith(
        lectureId,
        userId,
      );
    });

    it('lectureId에 해당하는 lecture가 존재하지 않으면 NotFoundException을 throw', async () => {
      const userId = 1;
      const lectureId = 999;

      (lectureRepository.getLectureByPk as jest.Mock).mockResolvedValue([]);

      await expect(service.getLectureByPk(userId, lectureId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('강의 접근 권한이 없으면 ForbiddenException을 throw', async () => {
      const userId = 999;
      const lectureId = 1;

      (lectureRepository.getLectureByPk as jest.Mock).mockResolvedValue([
        { lectureId: null },
      ]);

      await expect(service.getLectureByPk(userId, lectureId)).rejects.toThrow(
        ForbiddenException,
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
      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        `${process.env.SERVER_QR_CHECK_URI}?lectureId=${newLecture.lectureId}`,
      );
      expect(awsService.uploadQRCodeToS3).toHaveBeenCalledWith(
        newLecture.lectureId,
        expect.any(String),
      );
    });
  });

  describe('checkLectureAccess', () => {
    it('강사가 자신의 강의에 접근할 수 있어야 함', async () => {
      const userId = 1;
      const lectureId = 1;
      const mockUser = { userId: 1, userType: 'instructor' };
      const mockLecture = { lectureId: 1, user: { userId: 1 } };

      (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);
      (lectureRepository.getLectureForAuth as jest.Mock).mockResolvedValue(
        mockLecture,
      );

      const result = await service.checkLectureAccess(userId, lectureId);

      expect(result).toBe(true);
      expect(usersService.findUserByPk).toHaveBeenCalledWith(userId);
      expect(lectureRepository.getLectureForAuth).toHaveBeenCalledWith(
        lectureId,
      );
    });

    it('강사가 다른 사람의 강의에 접근할 수 없어야 함', async () => {
      const userId = 1;
      const lectureId = 1;
      const mockUser = { userId: 1, userType: 'instructor' };
      const mockLecture = { lectureId: 1, user: { userId: 2 } };

      (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);
      (lectureRepository.getLectureForAuth as jest.Mock).mockResolvedValue(
        mockLecture,
      );

      const result = await service.checkLectureAccess(userId, lectureId);

      expect(result).toBe(false);
    });

    it('수강생이 등록된 강의에 접근할 수 있어야 함', async () => {
      const userId = 1;
      const lectureId = 1;
      const mockUser = { userId: 1, userType: 'customer' };

      (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);
      (memberRepository.checkMemberExists as jest.Mock).mockResolvedValue(true);

      const result = await service.checkLectureAccess(userId, lectureId);

      expect(result).toBe(true);
      expect(memberRepository.checkMemberExists).toHaveBeenCalledWith(
        userId,
        lectureId,
      );
    });

    it('수강생이 등록되지 않은 강의에 접근할 수 없어야 함', async () => {
      const userId = 1;
      const lectureId = 1;
      const mockUser = { userId: 1, userType: 'customer' };

      (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);
      (memberRepository.checkMemberExists as jest.Mock).mockResolvedValue(
        false,
      );

      const result = await service.checkLectureAccess(userId, lectureId);

      expect(result).toBe(false);
    });

    it('사용자가 존재하지 않으면 false를 반환해야 함', async () => {
      const userId = 1;
      const lectureId = 1;

      (usersService.findUserByPk as jest.Mock).mockResolvedValue(null);

      const result = await service.checkLectureAccess(userId, lectureId);

      expect(result).toBe(false);
    });
  });

  describe('getLecturePreview', () => {
    it('강의 미리보기 정보를 성공적으로 조회', async () => {
      const lectureId = 1;
      const mockLectureData = {
        lectureId: 1,
        lectureTitle: '수영 강습',
        lectureContent: '초급 수영 강습입니다',
        lectureTime: '14:00',
        lectureDays: '월,수,금',
        lectureLocation: '강남 수영장',
        lectureEndDate: '2025-12-31',
        lectureDeletedAt: null,
        user: { userId: 1 },
      };

      const mockInstructor = {
        userId: 1,
        name: '김강사',
        profileImage: 'https://example.com/profile.jpg',
      };

      (lectureRepository.getLectureForAuth as jest.Mock).mockResolvedValue(
        mockLectureData,
      );
      (usersService.findUserByPk as jest.Mock).mockResolvedValue(
        mockInstructor,
      );

      const result = await service.getLecturePreview(lectureId);

      expect(result).toEqual({
        lectureId: mockLectureData.lectureId,
        lectureTitle: mockLectureData.lectureTitle,
        lectureContent: mockLectureData.lectureContent,
        lectureTime: mockLectureData.lectureTime,
        lectureDays: mockLectureData.lectureDays,
        lectureLocation: mockLectureData.lectureLocation,
        lectureEndDate: mockLectureData.lectureEndDate,
        instructorName: mockInstructor.name,
        instructorProfileImage: mockInstructor.profileImage,
      });
    });

    it('존재하지 않는 강의는 NotFoundException을 throw', async () => {
      const lectureId = 999;

      (lectureRepository.getLectureForAuth as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.getLecturePreview(lectureId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getLecturePreview(lectureId)).rejects.toThrow(
        '존재하지 않는 강의입니다.',
      );
    });

    it('삭제된 강의는 BadRequestException을 throw', async () => {
      const lectureId = 1;
      const mockDeletedLecture = {
        lectureId: 1,
        lectureDeletedAt: new Date(),
      };

      (lectureRepository.getLectureForAuth as jest.Mock).mockResolvedValue(
        mockDeletedLecture,
      );

      await expect(service.getLecturePreview(lectureId)).rejects.toThrow(
        '삭제된 강의입니다.',
      );
    });

    it('종료된 강의는 BadRequestException을 throw', async () => {
      const lectureId = 1;
      const mockEndedLecture = {
        lectureId: 1,
        lectureDeletedAt: null,
        lectureEndDate: '2020-01-01', // 과거 날짜
        user: { userId: 1 },
      };

      (lectureRepository.getLectureForAuth as jest.Mock).mockResolvedValue(
        mockEndedLecture,
      );

      await expect(service.getLecturePreview(lectureId)).rejects.toThrow(
        '종료된 강의입니다.',
      );
    });

    it('강사 정보가 없으면 NotFoundException을 throw', async () => {
      const lectureId = 1;
      const mockLectureData = {
        lectureId: 1,
        lectureTitle: '수영 강습',
        lectureDeletedAt: null,
        lectureEndDate: '2025-12-31',
        user: { userId: 999 },
      };

      (lectureRepository.getLectureForAuth as jest.Mock).mockResolvedValue(
        mockLectureData,
      );
      (usersService.findUserByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.getLecturePreview(lectureId)).rejects.toThrow(
        '강사 정보를 찾을 수 없습니다.',
      );
    });
  });
});
