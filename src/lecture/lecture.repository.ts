import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lecture } from './entity/lecture.entity';

@Injectable()
export class LectureRepository {
  constructor(
    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,
  ) {}

  // 강의 전제 조회
  async getLectures(): Promise<Lecture[]> {
    const result = await this.lectureRepository.query('CALL GET_LECTURE()');
    return result[0];
  }

  // 강의 상세 조회
  async getLectureById(lectureId: number): Promise<Lecture> {
    const result = await this.lectureRepository.query('CALL GET_LECTURE_ID(?)', [lectureId]);
    return result[0][0];
  }

  // 강의 수정
  async updateLecture(
    lectureId: number,
    lectureTime: string,
    lectureDays: string,
    lectureLevel: string,
    lectureContent: string,
    lectureQRCode: string
  ): Promise<void> {
    await this.lectureRepository.query('CALL UPDATE_LECTURE(?, ?, ?, ?, ?, ?)', [
      lectureId,
      lectureTime,
      lectureDays,
      lectureLevel,
      lectureContent,
      lectureQRCode,
    ]);
  }

  // 강의 삭제(소프트 삭제)
  async softDeleteLecture(lectureId: number): Promise<void> {
    await this.lectureRepository.query('CALL SOFT_DELETE_LECTURE(?)', [lectureId]);
  }

  // 강의 생성
  async createLecture(
    instructorId: number,
    lectureTime: string,
    lectureDays: string,
    lectureLevel: string,
    lectureContent: string,
    lectureQRCode: string,
  ): Promise<void> {
    await this.lectureRepository.query('CALL CREATE_LECTURE(?, ?, ?, ?, ?, ?)', [
      instructorId,
      lectureTime,
      lectureDays,
      lectureLevel,
      lectureContent,
      lectureQRCode || null,
    ]);
  }

  // 강의 QR 코드 생성
  async saveQRCode(lectureId: number, lectureQRCode: string): Promise<void> {
    await this.lectureRepository.query('CALL SAVE_QR_CODE(?, ?)', [lectureId, lectureQRCode]);
  }
}
