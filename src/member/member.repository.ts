import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entity/member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MemberRepository {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  /* 자신이 소속된 lecture 확인 */
  // async getMyLectureList(customerId: number): Promise<Member[]> {
  //   return await this.memberRepository
  //     .createQueryBuilder('member')
  //     .leftJoin('lecture', 'lecture', 'member.lectureId = lecture.lectureId')
  //     .select([
  //       'lecture.lectureTitle AS lectureTitle',
  //       'lecture.lectureContent AS lectureContent',
  //       'lecture.lectureTime AS lectureTime',
  //       'lecture.lectureDays AS lectureDays',
  //       'lecture.lectureLocation AS lectureLocation',
  //       'lecture.lectureColor AS lectureColor',
  //     ])
  //     .where('member.customerId = : customerId', { customerId })
  //     .getRawMany();
  // }

  /* QR코드를 통한 회원 등록 */
  async insertMemberFromQR(userId: number, lectureId: number): Promise<Member> {
    return await this.memberRepository.query(
      'CALL INSERT_MEMBER_FROM_QR(?, ?)',
      [userId, lectureId],
    );
  }

  /* 회원 가입 여부 확인 */
  async checkCustomer(userId: number): Promise<boolean> {
    const result = await this.memberRepository.query(
      'CALL CHECK_CUSTOMER_ID(?)',
      [userId],
    );

    return parseInt(result[0][0].result) === 1;
  }

  /* 강사가 개설한 모든 강의에 해당하는 수강생 */
  async getAllMemberByInstructor(lectureId: number): Promise<Member[]> {
    const result = await this.memberRepository.query(
      'CALL GET_ALL_MEMBER_INSTRUCTOR(?)',
      [lectureId],
    );
    return result[0];
  }
}
