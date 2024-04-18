import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Lecture } from './entity/lecture.entity';
import { LectureRepository } from './lecture.repository';
import { NotFoundError } from 'rxjs';

@Injectable()
export class LectureService {
  constructor(private readonly lectureRepository: LectureRepository) {}

  // 강의 전체 조회
  async getLectures(): Promise<Lecture[]> {
    try {
      const lecture = await this.lectureRepository.getLectures();
      if (!lecture) {
        throw new NotFoundException('데이터가 없습니다.');
      }
      return lecture;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  // 강의 상세 조회
  async getLectureById(lectureId: number): Promise<Lecture> {
    try {
      const lecture = await this.lectureRepository.getLectureById(lectureId);
      if (!lecture) {
        throw new NotFoundException('해당 ID의 데이터가 없습니다.');
      }
      return lecture;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  // 강의 수정
  async updateLecture(
    lectureId: number,
    lectureTime: string,
    lectureDays: string,
    lectureLevel: string,
    lectureContent: string,
    lectureQRCode: string,
  ): Promise<void> {
    const lecture = await this.lectureRepository.getLectureById(lectureId);
    if (!lecture) {
      throw new NotFoundException(`해당 ID의 데이터가 없습니다.`);
    }

    try {
      await this.lectureRepository.updateLecture(
        lectureId,
        lectureTime,
        lectureDays,
        lectureLevel,
        lectureContent,
        lectureQRCode,
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  // 강의 삭제(소프트 삭제)
  async softDeleteLecture(lectureId: number): Promise<void> {
    const lecture = await this.lectureRepository.getLectureById(lectureId);
    if (!lecture) {
      throw new NotFoundException(`해당 ID의 데이터가 없습니다.`);
    }

    try {
      await this.lectureRepository.softDeleteLecture(lectureId);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
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
    try {
      await this.lectureRepository.createLecture(instructorId, lectureTime, lectureDays, lectureLevel, lectureContent, lectureQRCode);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  // 강의 QR 코드 생성
  async saveQRCode(lectureId: number, lectureQRCode: string): Promise<void> {
    await this.lectureRepository.saveQRCode(lectureId, lectureQRCode);
  }
}
