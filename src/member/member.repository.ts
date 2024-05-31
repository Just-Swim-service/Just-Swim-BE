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

  /* QR코드를 통한 회원 등록 */
  async insertMemberFromQR(userId: number, lectureId: number): Promise<Member> {
    return await this.memberRepository.query(
      'CALL INSERT_MEMBER_FROM_QR(?, ?)',
      [userId, lectureId],
    );
  }

  /* 강의에 해당하는 member 조회 */
  async getAllMembersByLectureId(lectureId: number): Promise<Member[]> {
    const result = await this.memberRepository.query(
      'CALL GET_ALL_MEMBERS_LECTUREID(?)',
      [lectureId],
    );
    return result[0];
  }

  /* instructor가 피드백 작성 시 강의를 듣고 있는 member 조회 */
  async getAllMembersByFeedback(userId: number): Promise<Member[]> {
    const result = await this.memberRepository.query(
      'CALL GET_ALL_MEMBERS_BY_FEEDBACK(?)',
      [userId],
    );

    return result[0];
  }
}
