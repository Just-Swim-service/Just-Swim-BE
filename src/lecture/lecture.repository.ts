import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lecture } from './entity/lecture.entity';
import { EditLectureDto } from './dto/editLecture.dto';
import { LectureDto } from './dto/lecture.dto';

@Injectable()
export class LectureRepository {
  constructor(
    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,
  ) {}

  /* 강의 전제 조회 */
  async getLectures(): Promise<Lecture[]> {
    const result = await this.lectureRepository.query('CALL GET_LECTURE()');
    return result[0];
  }

  /* 스케줄 - 강사용 강의 조회 (lectureDeletedAt is null) */
  async getScheduleLecturesByInstructor(userId: number): Promise<any[]> {
    const result = await this.lectureRepository.query(
      'CALL GET_SCHEDULE_LECTURES_BY_INSTRUCTOR(?)',
      [userId],
    );
    return result[0];
  }

  /* 강사 모든 강의 조회 */
  async getAllLecturesByInstructor(userId: number): Promise<any[]> {
    const result = await this.lectureRepository.query(
      'CALL GET_ALL_LECTURES_INSTRUCTOR(?)',
      [userId],
    );
    return result[0];
  }

  /* 수강생 강의 조회 */
  async getScheduleLecturesByCustomer(userId: number): Promise<any[]> {
    const result = await this.lectureRepository.query(
      'CALL GET_SCHEDULE_LECTURES_BY_CUSTOMER(?)',
      [userId],
    );
    return result[0];
  }

  /* 수강생 모든 강의 조회 */
  async getAllLecturesByCustomer(userId: number): Promise<any[]> {
    const result = await this.lectureRepository.query(
      'CALL GET_ALL_LECTURES_CUSTOMER(?)',
      [userId],
    );
    return result[0];
  }

  /* 강의 상세 조회 */
  async getLectureByPk(lectureId: number, userId: number): Promise<any> {
    const result = await this.lectureRepository.query(
      'CALL GET_LECTURE_BY_PK(?, ?)',
      [lectureId, userId],
    );
    return result[0];
  }

  /* 강의 수정 */
  async updateLecture(
    lectureId: number,
    editLectureDto: EditLectureDto,
  ): Promise<void> {
    const {
      lectureTitle,
      lectureContent,
      lectureTime,
      lectureDays,
      lectureColor,
      lectureQRCode,
      lectureLocation,
      lectureEndDate,
    } = editLectureDto;

    await this.lectureRepository.query(
      'CALL UPDATE_LECTURE(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        lectureId,
        lectureTitle,
        lectureContent,
        lectureTime,
        lectureDays,
        lectureColor,
        lectureQRCode,
        lectureLocation,
        lectureEndDate,
      ],
    );
  }

  /* 강의 삭제(softDelete) */
  async softDeleteLecture(lectureId: number): Promise<void> {
    await this.lectureRepository.query('CALL SOFT_DELETE_LECTURE(?)', [
      lectureId,
    ]);
  }

  /* 강의 생성 */
  async createLecture(
    userId: number,
    lectureDto: LectureDto,
  ): Promise<Lecture> {
    const {
      lectureTitle,
      lectureContent,
      lectureTime,
      lectureDays,
      lectureColor,
      lectureLocation,
      lectureQRCode,
      lectureEndDate,
    } = lectureDto;
    const result = await this.lectureRepository.query(
      'CALL CREATE_LECTURE(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        lectureTitle,
        lectureContent,
        lectureTime,
        lectureDays,
        lectureColor,
        lectureLocation,
        lectureQRCode,
        lectureEndDate,
      ],
    );
    return result[0][0];
  }

  /* 강의 QR 코드 생성 */
  async saveQRCode(lectureId: number, lectureQRCode: string): Promise<void> {
    await this.lectureRepository.query('CALL SAVE_QR_CODE(?, ?)', [
      lectureId,
      lectureQRCode,
    ]);
  }

  /* 강의 권한 확인을 위한 조회 */
  async getLectureForAuth(lectureId: number) {
    const result = await this.lectureRepository.query(
      'CALL GET_LECTURE_FOR_AUTH(?)',
      [lectureId],
    );
    return result[0][0];
  }
}
