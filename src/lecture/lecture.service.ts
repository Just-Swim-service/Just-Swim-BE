import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Lecture } from './entity/lecture.entity';
import { LectureRepository } from './lecture.repository';
import { EditLectureDto } from './dto/editLecture.dto';
import { LectureDto } from './dto/lecture.dto';
import { MyLogger } from 'src/common/logger/logger.service';
import { MemberRepository } from 'src/member/member.repository';

@Injectable()
export class LectureService {
  constructor(
    private readonly lectureRepository: LectureRepository,
    private readonly memberRepository: MemberRepository,
    private readonly logger: MyLogger,
  ) {}

  /* 강의 전체 조회 */
  async getLectures(): Promise<Lecture[]> {
    try {
      return await this.lectureRepository.getLectures();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '강의 전체 조회 중에 오류가 발생했습니다.',
      );
    }
  }

  /* 스케줄 - 강사용 강의 조회 (lectureDeletedAt is null) */
  async getLecturesByInstructor(userId: number): Promise<Lecture[]> {
    try {
      return await this.lectureRepository.getLecturesByInstructor(userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '강사의 스케줄 조회 중에 오류가 발생했습니다.',
      );
    }
  }

  /* 강사 모든 강의 조회 */
  async getAllLecturesByInstructor(userId: number): Promise<Lecture[]> {
    try {
      return await this.lectureRepository.getAllLecturesByInstructor(userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '강사가 생성한 모든 강의 조회 중에 오류가 발생했습니다.',
      );
    }
  }

  /* 스케줄 - 수강생 본인이 들어가 있는 강의 조회 */
  async getLecturesByCustomer(userId: number): Promise<Lecture[]> {
    try {
      return await this.lectureRepository.getLecturesByCustomer(userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '수강생 스케줄 조회 중에 오류가 발생했습니다.',
      );
    }
  }

  /* 수강생 모든 강의 조회 */
  async getAllLecturesByCustomer(userId: number): Promise<Lecture[]> {
    try {
      return await this.lectureRepository.getAllLecturesByCustomer(userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '수강생이 등록한 모든 강의 조회 중에 오류가 발생했습니다.',
      );
    }
  }

  /* 강의 상세 조회 */
  async getLectureByPk(userId: number, lectureId: number) {
    try {
      const lecture = await this.lectureRepository.getLectureByPk(lectureId);
      if (!lecture) {
        throw new NotFoundException('존재하지 않는 강좌입니다.');
      }
      const lectureMembers =
        await this.memberRepository.getAllMemberByLectureId(lectureId);

      // 강의 작성자
      if (lecture.userId === userId) {
        return { lecture, lectureMembers };
      }
      if (lectureMembers.some((member) => member.userId === userId)) {
        return lecture;
      }
      throw new UnauthorizedException('강의 접근 권한이 없습니다.');
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '강의 상세 조회 중에 오류가 발생했습니다.',
      );
    }
  }

  // 강의 수정
  async updateLecture(
    userId: number,
    lectureId: number,
    editLectureDto: EditLectureDto,
  ): Promise<void> {
    try {
      const lecture = await this.lectureRepository.getLectureByPk(lectureId);
      if (lecture.userId !== userId) {
        throw new UnauthorizedException('강의 수정 권한이 없습니다.');
      }

      await this.lectureRepository.updateLecture(lectureId, editLectureDto);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '강의 수정 중에 오류가 발생했습니다.',
      );
    }
  }

  // 강의 삭제(softDelete)
  async softDeleteLecture(userId: number, lectureId: number): Promise<void> {
    try {
      const lecture = await this.lectureRepository.getLectureByPk(lectureId);
      if (lecture.userId !== userId) {
        throw new UnauthorizedException('강의 수정 권한이 없습니다.');
      }

      await this.lectureRepository.softDeleteLecture(lectureId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '강의 삭제 중에 오류가 발생했습니다.',
      );
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
      this.logger.error(error);
      throw new InternalServerErrorException(
        '강의 생성 중에 오류가 발생했습니다.',
      );
    }
  }

  // 강의 QR 코드 생성
  async saveQRCode(lectureId: number, lectureQRCode: string): Promise<void> {
    try {
      await this.lectureRepository.saveQRCode(lectureId, lectureQRCode);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '강의 QR 코드 생성 중에 오류가 발생했습니다.',
      );
    }
  }
}
