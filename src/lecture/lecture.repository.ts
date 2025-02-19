import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lecture } from './entity/lecture.entity';
import { EditLectureDto } from './dto/edit-lecture.dto';
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
    return await this.lectureRepository
      .createQueryBuilder('lecture')
      .leftJoinAndSelect('lecture.member', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .select([
        'lecture.lectureId as lectureId',
        'lecture.lectureTitle as lectureTitle',
        'lecture.lectureContent as lectureContent',
        'lecture.lectureTime as lectureTime',
        'lecture.lectureDays as lectureDays',
        'lecture.lectureLocation as lectureLocation',
        'lecture.lectureColor as lectureColor',
        'lecture.lectureQRCode as lectureQRCode',
        'lecture.lectureEndDate as lectureEndDate',
        'user.userId as memberUserId',
        'user.name as memberName',
        'user.profileImage as memberProfileImage',
      ])
      .where('lecture.userId = :userId', { userId })
      .andWhere('lecture.lectureDeletedAt IS NULL')
      .orderBy('lecture.lectureId', 'ASC')
      .addOrderBy('user.userId', 'ASC')
      .getRawMany();
  }

  /* 강사 모든 강의 조회 */
  async getAllLecturesByInstructor(userId: number): Promise<any[]> {
    return await this.lectureRepository
      .createQueryBuilder('lecture')
      .leftJoinAndSelect('lecture.member', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('lecture.user', 'instructor')
      .select([
        'lecture.lectureId as lectureId',
        'lecture.lectureTitle as lectureTitle',
        'lecture.lectureContent as lectureContent',
        'lecture.lectureTime as lectureTime',
        'lecture.lectureDays as lectureDays',
        'lecture.lectureLocation as lectureLocation',
        'lecture.lectureColor as lectureColor',
        'lecture.lectureQRCode as lectureQRCode',
        'lecture.lectureEndDate as lectureEndDate',
        'user.userId as userId',
        'user.name as name',
        'user.profileImage as profileImage',
        'instructor.name as instructorName',
        'instructor.profileImage as instructorProfileImage',
      ])
      .where('lecture.userId = :userId', { userId })
      .orderBy('lecture.lectureId', 'ASC')
      .addOrderBy('user.userId', 'ASC')
      .getRawMany();
  }

  /* 수강생 강의 조회 */
  async getScheduleLecturesByCustomer(userId: number): Promise<any[]> {
    return await this.lectureRepository
      .createQueryBuilder('lecture')
      .leftJoinAndSelect('lecture.member', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .select([
        'lecture.lectureId as lectureId',
        'lecture.lectureTitle as lectureTitle',
        'lecture.lectureContent as lectureContent',
        'lecture.lectureTime as lectureTime',
        'lecture.lectureDays as lectureDays',
        'lecture.lectureLocation as lectureLocation',
        'lecture.lectureColor as lectureColor',
        'lecture.lectureQRCode as lectureQRCode',
        'lecture.lectureEndDate as lectureEndDate',
        'user.userId as memberUserId',
        'user.name as memberName',
        'user.profileImage as memberProfileImage',
      ])
      .where('member.userId = :userId', { userId })
      .andWhere('lecture.lectureDeletedAt IS NULL')
      .orderBy('lecture.lectureId', 'ASC')
      .addOrderBy('user.userId', 'ASC')
      .getRawMany();
  }

  /* 수강생 모든 강의 조회 */
  async getAllLecturesByCustomer(userId: number): Promise<any[]> {
    return await this.lectureRepository
      .createQueryBuilder('lecture')
      .leftJoinAndSelect('lecture.member', 'member')
      .leftJoinAndSelect('lecture.user', 'instructor')
      .select([
        'lecture.lectureId as lectureId',
        'lecture.lectureTitle as lectureTitle',
        'lecture.lectureContent as lectureContent',
        'lecture.lectureTime as lectureTime',
        'lecture.lectureDays as lectureDays',
        'lecture.lectureLocation as lectureLocation',
        'lecture.lectureColor as lectureColor',
        'lecture.lectureQRCode as lectureQRCode',
        'lecture.lectureEndDate as lectureEndDate',
        'instructor.name as name',
        'instructor.profileImage as profileImage',
      ])
      .where('member.userId = :userId', { userId })
      .andWhere('lecture.lectureDeletedAt IS NULL')
      .groupBy('lecture.lectureId')
      .getRawMany();
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

    await this.lectureRepository.update(
      { lectureId },
      {
        lectureTitle,
        lectureContent,
        lectureTime,
        lectureDays,
        lectureColor,
        lectureQRCode,
        lectureLocation,
        lectureEndDate,
      },
    );
  }

  /* 강의 삭제(softDelete) */
  async softDeleteLecture(lectureId: number): Promise<void> {
    await this.lectureRepository.update(
      { lectureId },
      { lectureDeletedAt: new Date() },
    );
  }

  /* 강의 생성 */
  async createLecture(
    userId: number,
    lectureDto: LectureDto,
  ): Promise<Lecture> {
    const newLecture = this.lectureRepository.create({
      user: { userId },
      lectureTitle: lectureDto.lectureTitle,
      lectureContent: lectureDto.lectureContent,
      lectureTime: lectureDto.lectureTime,
      lectureDays: lectureDto.lectureDays,
      lectureColor: lectureDto.lectureColor,
      lectureLocation: lectureDto.lectureLocation,
      lectureQRCode: lectureDto.lectureQRCode,
      lectureEndDate: lectureDto.lectureEndDate,
    });

    return await this.lectureRepository.save(newLecture);
  }

  /* 강의 QR 코드 생성 */
  async saveQRCode(lectureId: number, lectureQRCode: string): Promise<void> {
    await this.lectureRepository.update({ lectureId }, { lectureQRCode });
  }

  /* 강의 권한 확인을 위한 조회 */
  async getLectureForAuth(lectureId: number): Promise<Lecture> {
    return await this.lectureRepository.findOne({
      where: { lectureId },
      relations: ['user'],
    });
  }
}
