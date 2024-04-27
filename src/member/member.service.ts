import { Injectable } from '@nestjs/common';
import { MemberRepository } from './member.repository';
import { Member } from './entity/member.entity';

@Injectable()
export class MemberService {
  constructor(private readonly memberRepository: MemberRepository) {}

  /* QR코드를 통한 회원 등록 */
  async insertMemberFromQR(userId: number, lectureId: number): Promise<Member> {
    return await this.memberRepository.insertMemberFromQR(userId, lectureId);
  }

  /* 회원 가입 여부 확인 */
  async checkCustomer(userId: number): Promise<boolean> {
    return await this.memberRepository.checkCustomer(userId);
  }

  /* 강사가 개설한 강의에 해당하는 수강생 */
  async getAllMemberByInstructor(lectureId: number): Promise<Member[]> {
    return await this.memberRepository.getAllMemberByInstructor(lectureId);
  }
}
