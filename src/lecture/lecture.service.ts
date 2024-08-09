import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Lecture } from './entity/lecture.entity';
import { LectureRepository } from './lecture.repository';
import { EditLectureDto } from './dto/editLecture.dto';
import { LectureDto } from './dto/lecture.dto';
import * as QRCode from 'qrcode';
import { AwsService } from 'src/common/aws/aws.service';

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
  async getScheduleLecturesByInstructor(userId: number): Promise<Lecture[]> {
    return await this.lectureRepository.getScheduleLecturesByInstructor(userId);
  }

  /* 강사 모든 강의 조회 */
  async getAllLecturesByInstructor(userId: number): Promise<Lecture[]> {
    return await this.lectureRepository.getAllLecturesByInstructor(userId);
  }

  /* 스케줄 - 수강생 본인이 들어가 있는 강의 조회 */
  async getScheduleLecturesByCustomer(userId: number): Promise<Lecture[]> {
    return await this.lectureRepository.getScheduleLecturesByCustomer(userId);
  }

  /* 수강생 모든 강의 조회 */
  async getAllLecturesByCustomer(userId: number): Promise<Lecture[]> {
    return await this.lectureRepository.getAllLecturesByCustomer(userId);
  }

  /* 강의 상세 조회 */
  async getLectureByPk(userId: number, lectureId: number) {
    const lecture = await this.lectureRepository.getLectureByPk(
      lectureId,
      userId,
    );
    if (!lecture[0]) {
      throw new NotFoundException('존재하지 않는 강좌입니다.');
    }
    if (lecture[0].lectureId === null) {
      throw new UnauthorizedException('강의 접근 권한이 없습니다.');
    }
    return lecture;
  }

  // 강의 수정
  async updateLecture(
    userId: number,
    lectureId: number,
    editLectureDto: EditLectureDto,
  ): Promise<void> {
    const lecture = await this.lectureRepository.getLectureForAuth(lectureId);
    if (lecture.userId !== userId) {
      throw new UnauthorizedException('강의 수정 권한이 없습니다.');
    }

    await this.lectureRepository.updateLecture(lectureId, editLectureDto);
  }

  // 강의 삭제(softDelete)
  async softDeleteLecture(userId: number, lectureId: number): Promise<void> {
    const lecture = await this.lectureRepository.getLectureForAuth(lectureId);
    if (lecture.userId !== userId) {
      throw new UnauthorizedException('강의 수정 권한이 없습니다.');
    }

    await this.lectureRepository.softDeleteLecture(lectureId);
  }

  // 강의 생성
  async createLecture(
    userId: number,
    lectureDto: LectureDto,
  ): Promise<Lecture> {
    const newLecture = await this.lectureRepository.createLecture(
      userId,
      lectureDto,
    );

    // QR 생성
    const qrCodeData = await QRCode.toDataURL(
      `${process.env.SERVER_QR_CHECK_URI}?lectureId=${newLecture.lectureId}`,
    );
    const lectureQRCode = await this.awsService.uploadQRCodeToS3(
      newLecture.lectureId,
      qrCodeData,
    );

    await this.saveQRCode(newLecture.lectureId, lectureQRCode);

    return newLecture;
  }

  // 강의 QR 코드 생성
  async saveQRCode(lectureId: number, lectureQRCode: string): Promise<void> {
    await this.lectureRepository.saveQRCode(lectureId, lectureQRCode);
  }
}
