import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MemberRepository } from './member.repository';
import { Member } from './entity/member.entity';

@Injectable()
export class MemberService {
  constructor(private readonly memberRepository: MemberRepository) {}

  /* QR코드를 통한 회원 등록 */
  async insertMemberFromQR(userId: number, lectureId: number): Promise<Member> {
    return await this.memberRepository.insertMemberFromQR(userId, lectureId);
  }

  /* 강의에 해당하는 수강생 */
  async getAllMembersByLectureId(lectureId: number): Promise<Member[]> {
    return await this.memberRepository.getAllMembersByLectureId(lectureId);
  }

  /* instructor가 피드백 작성 시 강의를 듣고 있는 member 조회 */
  async getAllMembersByFeedback(userId: number): Promise<Member[]> {
    return await this.memberRepository.getAllMembersByFeedback(userId);
  }
}
