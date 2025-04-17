import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Lecture } from './entity/lecture.entity';
import { LectureRepository } from './lecture.repository';
import { EditLectureDto } from './dto/edit-lecture.dto';
import { CreateLectureDto } from './dto/create-lecture.dto';
import * as QRCode from 'qrcode';
import { AwsService } from 'src/common/aws/aws.service';
import { InstructorLectureDto } from './dto/instructor-lecture.dto';
import { CustomerLectureDto } from './dto/customer-lecture.dto';
import { LectureDetailDto } from './dto/lecture-detail.dto';

@Injectable()
export class LectureService {
  constructor(
    private readonly awsService: AwsService,
    private readonly lectureRepository: LectureRepository,
  ) {}

  /* 강의 전체 조회 */
  async getLectures(): Promise<Lecture[]> {
    return await this.lectureRepository.getLectures();
  }

  /* 스케줄 - 강사용 강의 조회 (lectureDeletedAt is null) */
  async getScheduleLecturesByInstructor(
    userId: number,
  ): Promise<InstructorLectureDto[]> {
    const lectures =
      await this.lectureRepository.getScheduleLecturesByInstructor(userId);

    // 강의를 lectureId 기준으로 그룹화하여 member 정보를 배열로 정리
    const groupedLectures = lectures.reduce((acc, lecture) => {
      // 이미 acc에 같은 lectureId를 가진 강의가 있는지 확인
      let existingLecture = acc.find((l) => l.lectureId === lecture.lectureId);

      if (!existingLecture) {
        // 강의가 없다면 새로운 강의 객체 생성
        existingLecture = {
          lectureId: lecture.lectureId,
          lectureTitle: lecture.lectureTitle,
          lectureContent: lecture.lectureContent,
          lectureTime: lecture.lectureTime,
          lectureDays: lecture.lectureDays,
          lectureLocation: lecture.lectureLocation,
          lectureColor: lecture.lectureColor,
          lectureQRCode: lecture.lectureQRCode,
          lectureEndDate: lecture.lectureEndDate,
          members: [], // 멤버 초기화
        };
        acc.push(existingLecture); // 새로운 강의 추가
      }

      // 멤버 정보가 존재하면 추가
      if (lecture.memberUserId) {
        existingLecture.members.push({
          userId: lecture.memberUserId,
          name: lecture.memberName,
          profileImage: lecture.memberProfileImage,
        });
      }

      return acc;
    }, []);

    return groupedLectures;
  }

  /* 강사 모든 강의 조회 */
  async getAllLecturesByInstructor(
    userId: number,
  ): Promise<InstructorLectureDto[]> {
    const lectureDatas =
      await this.lectureRepository.getAllLecturesByInstructor(userId);

    // lectureId를 기준으로 강의를 그룹화하고 member와 instructor 정보를 정리
    const lectures = lectureDatas.reduce((acc, lecture) => {
      // 기존 강의가 있는지 확인
      let existingLecture = acc.find(
        (l: any) => l.lectureId === lecture.lectureId,
      );

      if (!existingLecture) {
        // 기존 강의가 없으면 새로운 강의 추가
        existingLecture = {
          lectureId: lecture.lectureId,
          lectureTitle: lecture.lectureTitle,
          lectureContent: lecture.lectureContent,
          lectureTime: lecture.lectureTime,
          lectureDays: lecture.lectureDays,
          lectureLocation: lecture.lectureLocation,
          lectureColor: lecture.lectureColor,
          lectureQRCode: lecture.lectureQRCode,
          lectureEndDate: lecture.lectureEndDate,
          members: [],
          instructor: {},
        };
        acc.push(existingLecture);
      }

      // 멤버 정보 추가
      if (lecture.userId) {
        existingLecture.members.push({
          userId: lecture.userId,
          name: lecture.name,
          profileImage: lecture.profileImage,
        });
      }

      // 강사 정보 추가
      if (
        !existingLecture.instructor.instructorName &&
        lecture.instructorName
      ) {
        existingLecture.instructor = {
          instructorName: lecture.instructorName,
          instructorProfileImage: lecture.instructorProfileImage,
        };
      }

      return acc;
    }, []);

    return lectures;
  }

  /* 스케줄 - 수강생 본인이 들어가 있는 강의 조회 */
  async getScheduleLecturesByCustomer(
    userId: number,
  ): Promise<CustomerLectureDto[]> {
    const lectureDatas =
      await this.lectureRepository.getScheduleLecturesByCustomer(userId);

    // 강사 정보를 객체로 묶어서 반환
    const lectures = lectureDatas.map((lecture) => ({
      lectureId: lecture.lectureId,
      lectureTitle: lecture.lectureTitle,
      lectureContent: lecture.lectureContent,
      lectureTime: lecture.lectureTime,
      lectureDays: lecture.lectureDays,
      lectureLocation: lecture.lectureLocation,
      lectureColor: lecture.lectureColor,
      lectureQRCode: lecture.lectureQRCode,
      lectureEndDate: lecture.lectureEndDate,
      instructor: {
        instructorName: lecture.name,
        instructorProfileImage: lecture.profileImage,
      },
    }));

    return lectures;
  }

  /* 수강생 모든 강의 조회 */
  async getAllLecturesByCustomer(
    userId: number,
  ): Promise<CustomerLectureDto[]> {
    const lectureDatas =
      await this.lectureRepository.getAllLecturesByCustomer(userId);

    // 강사 정보를 객체로 묶어서 반환
    const lectures = lectureDatas.map((lecture) => ({
      lectureId: lecture.lectureId,
      lectureTitle: lecture.lectureTitle,
      lectureContent: lecture.lectureContent,
      lectureTime: lecture.lectureTime,
      lectureDays: lecture.lectureDays,
      lectureLocation: lecture.lectureLocation,
      lectureColor: lecture.lectureColor,
      lectureQRCode: lecture.lectureQRCode,
      lectureEndDate: lecture.lectureEndDate,
      instructor: {
        instructorName: lecture.name,
        instructorProfileImage: lecture.profileImage,
      },
    }));

    return lectures;
  }

  /* 강의 상세 조회 */
  async getLectureByPk(
    userId: number,
    lectureId: number,
  ): Promise<LectureDetailDto> {
    const lectureData = await this.lectureRepository.getLectureByPk(
      lectureId,
      userId,
    );
    if (!lectureData[0]) {
      throw new NotFoundException('존재하지 않는 강좌입니다.');
    }
    if (lectureData[0].lectureId === null) {
      throw new ForbiddenException('강의 접근 권한이 없습니다.');
    }

    // 중복 강의 정보를 제거하고 멤버 정보를 그룹화
    const lecture = lectureData.reduce((acc, current) => {
      const existingLecture = acc.find(
        (l) => l.lectureId === current.lectureId,
      );

      if (!existingLecture) {
        // 기존에 해당 강의가 없으면 새롭게 추가
        acc.push({
          lectureId: current.lectureId,
          lectureTitle: current.lectureTitle,
          lectureContent: current.lectureContent,
          lectureTime: current.lectureTime,
          lectureDays: current.lectureDays,
          lectureLocation: current.lectureLocation,
          lectureColor: current.lectureColor,
          lectureQRCode: current.lectureQRCode,
          lectureEndDate: current.lectureEndDate,
          instructor: {
            instructorName: current.instructorName,
            instructorProfileImage: current.instructorProfileImage,
          },
          members: current.memberUserId
            ? [
                {
                  userId: current.memberUserId,
                  name: current.memberName,
                  profileImage: current.memberProfileImage,
                },
              ]
            : [],
        });
      } else {
        // 기존 강의가 있으면 멤버 추가 (중복 멤버는 제외)
        if (
          current.memberUserId &&
          !existingLecture.members.some(
            (m) => m.userId === current.memberUserId,
          )
        ) {
          existingLecture.members.push({
            userId: current.memberUserId,
            name: current.memberName,
            profileImage: current.memberProfileImage,
          });
        }
      }
      return acc;
    }, []);
    return lecture[0];
  }

  // 강의 수정
  async updateLecture(
    userId: number,
    lectureId: number,
    editLectureDto: EditLectureDto,
  ): Promise<void> {
    const lecture = await this.lectureRepository.getLectureForAuth(lectureId);
    if (lecture.user.userId !== userId) {
      throw new ForbiddenException('이 강의를 수정할 수 있는 권한이 없습니다.');
    }

    await this.lectureRepository.updateLecture(lectureId, editLectureDto);
  }

  // 강의 삭제(softDelete)
  async softDeleteLecture(userId: number, lectureId: number): Promise<void> {
    const lecture = await this.lectureRepository.getLectureForAuth(lectureId);
    if (lecture.user.userId !== userId) {
      throw new ForbiddenException('이 강의를 삭제할 수 있는 권한이 없습니다.');
    }

    await this.lectureRepository.softDeleteLecture(lectureId);
  }

  // 강의 생성
  async createLecture(
    userId: number,
    createLectureDto: CreateLectureDto,
  ): Promise<Lecture> {
    const newLecture = await this.lectureRepository.createLecture(
      userId,
      createLectureDto,
    );

    // QR 생성
    try {
      const qrCodeData = await QRCode.toDataURL(
        `${process.env.SERVER_QR_CHECK_URI}?lectureId=${newLecture.lectureId}`,
      );
      const lectureQRCode = await this.awsService.uploadQRCodeToS3(
        newLecture.lectureId,
        qrCodeData,
      );

      await this.saveQRCode(newLecture.lectureId, lectureQRCode);
    } catch (error) {
      throw new InternalServerErrorException('QR 코드 생성에 실패했습니다.');
    }

    return newLecture;
  }

  // 강의 QR 코드 생성
  async saveQRCode(lectureId: number, lectureQRCode: string): Promise<void> {
    await this.lectureRepository.saveQRCode(lectureId, lectureQRCode);
  }
}
