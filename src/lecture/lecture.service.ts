import { Injectable } from '@nestjs/common';
import { Lecture } from './entity/lecture.entity';
import { LectureRepository } from './lecture.repository';
import { EditLectureDto } from './dto/editLecture.dto';
import { LectureDto } from './dto/lecture.dto';

@Injectable()
export class LectureService {
  constructor(private readonly lectureRepository: LectureRepository) {}

  /* 강의 전체 조회 */
  async getLectures(): Promise<Lecture[]> {
    try {
      return await this.lectureRepository.getLectures();
    } catch (error) {
      throw new Error('강의 전체 조회 중에 오류가 발생했습니다.');
    }
  }

  /* 스케줄 - 강사용 강의 조회 */
  async getLecturesByInstructor(userId: number): Promise<Lecture[]> {
    try {
      return await this.lectureRepository.getLecturesByInstructor(userId);
    } catch (error) {
      throw new Error('강사의 스케줄 조회 중에 오류가 발생했습니다.');
    }
  }

  /* 강사 모든 강의 조회 */
  async getAllLecturesByInstructor(userId: number): Promise<Lecture[]> {
    try {
      return await this.lectureRepository.getAllLecturesByInstructor(userId);
    } catch (error) {
      throw new Error('강사가 생성한 모든 강의 조회 중에 오류가 발생했습니다.');
    }
  }

  // 회원용 강의 조회
  /* 
  1. customerId를 통해 member 테이블에 있는 등록 정보 추출
  2. for문을 이용하여  추출한 정보에서 lectureId만 추출
  3. lectureId를 이용하여 강의 정보 추출*/
  // async getLecturesByCustomerId(customerId: number): Promise<Lecture[]> {
  //   const lectureIdList =
  //     await this.memberRepository.getMyLectureList(customerId);
  // }

  /* 강의 상세 조회 */
  async getLectureById(lectureId: number) {
    try {
      const lecture = await this.lectureRepository.getLectureById(lectureId);
      if (!lecture) {
        return null;
      }
      return lecture;
    } catch (error) {
      throw new Error('강의 상세 조회 중에 오류가 발생했습니다.');
    }
  }

  // 강의 수정
  async updateLecture(
    lectureId: number,
    editLectureDto: EditLectureDto,
  ): Promise<void> {
    try {
      await this.lectureRepository.updateLecture(lectureId, editLectureDto);
    } catch (error) {
      throw new Error('강의 수정 중에 오류가 발생했습니다.');
    }
  }

  // 강의 삭제(소프트 삭제)
  async softDeleteLecture(lectureId: number): Promise<void> {
    try {
      await this.lectureRepository.softDeleteLecture(lectureId);
    } catch (error) {
      throw new Error('강의 삭제 중에 오류가 발생했습니다.');
    }
  }

  // 강의 생성
  async createLecture(
    userId: number,
    lectureDto: LectureDto,
  ): Promise<Lecture> {
    try {
      return await this.lectureRepository.createLecture(userId, lectureDto);
    } catch (error) {
      throw new Error('강의 생성 중에 오류가 발생했습니다.');
    }
  }

  // 강의 QR 코드 생성
  async saveQRCode(lectureId: number, lectureQRCode: string): Promise<void> {
    try {
      await this.lectureRepository.saveQRCode(lectureId, lectureQRCode);
    } catch (error) {
      throw new Error('강의 QR 코드 생성 중에 오류가 발생했습니다.');
    }
  }
}
