import { Injectable } from '@nestjs/common';
import { MemberRepository } from './member.repository';

@Injectable()
export class MemberService {
  constructor(private readonly memberRepository: MemberRepository) {}

  // QR코드를 통한 회원 등록
  async insertMemberFromQR(
    customerId: number,
    lectureId: number,
  ): Promise<void> {
    await this.memberRepository.insertMemberFromQR(customerId, lectureId);
  }

  // 회원 가입 여부 확인
  async checkCustomerId(customerId: number): Promise<boolean> {
    return await this.memberRepository.checkCustomerId(customerId);
  }
}
