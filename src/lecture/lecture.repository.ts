import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
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

  /* 스케줄 - 강사용 강의 조회 */
  async getLecturesByInstructor(userId: number): Promise<Lecture[]> {
    const result = await this.lectureRepository.query(
      'CALL GET_LECTURE_INSTRUCTOR(?)',
      [userId],
    );
    return result[0];
  }

  /* 강사 모든 강의 조회 */
  async getAllLecturesByInstructor(userId: number): Promise<Lecture[]> {
    const result = await this.lectureRepository.query(
      'CALL GET_ALL_LECTURE_INSTRUCTOR(?)',
      [userId],
    );
    return result[0];
  }

  // 회원용 강의 조회
  // async getLecturesByCustomerId(customerId: number): Promise<Lecture[]> {
  //   const result;
  // }

  // 강의 상세 조회
  async getLectureById(lectureId: number): Promise<Lecture> {
    const result = await this.lectureRepository.query(
      'CALL GET_LECTURE_ID(?)',
      [lectureId],
    );
    return result[0][0];
  }

  // 강의 수정
  async updateLecture(
    lectureId: number,
    editLectureDto: EditLectureDto,
  ): Promise<UpdateResult> {
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

    return await this.lectureRepository.query(
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

  // 강의 삭제(소프트 삭제)
  async softDeleteLecture(lectureId: number): Promise<UpdateResult> {
    return await this.lectureRepository.query('CALL SOFT_DELETE_LECTURE(?)', [
      lectureId,
    ]);
  }

  // 강의 생성
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
      lectureQRCode,
      lectureLocation,
      lectureEndDate,
    } = lectureDto;
    return await this.lectureRepository.query(
      'CALL CREATE_LECTURE(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
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
}
