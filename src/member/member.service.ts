import { Injectable } from '@nestjs/common';
import { MemberRepository } from './member.repository';
import { Member } from './entity/member.entity';

@Injectable()
export class MemberService {
  constructor(private readonly memberRepository: MemberRepository) {}

  /* QR코드를 통한 회원 등록 */
  async insertMemberFromQR(userId: number, lectureId: number): Promise<Member> {
    try {
      return await this.memberRepository.insertMemberFromQR(userId, lectureId);
    } catch (error) {
      throw new Error('QR코드를 통한 회원 등록 중에 오류가 발생했습니다.');
    }
  }

  /* 강사가 개설한 강의에 해당하는 수강생 */
  async getAllMemberByInstructor(lectureId: number): Promise<Member[]> {
    try {
      return await this.memberRepository.getAllMemberByInstructor(lectureId);
    } catch (error) {
      throw new Error(
        '강의에 해당하는 수강생을 조회하는 중에 오류가 발생했습니다.',
      );
    }
  }
}
