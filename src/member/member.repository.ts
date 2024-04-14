import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entity/member.entity';

@Injectable()
export class MemberRepository {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  // QR코드를 통한 회원 등록
  async InsertMemberFromQR(customerId: number, lectureId: number): Promise<void> {
    await this.memberRepository.query('CALL INSERT_MEMBER_FROM_QR(?, ?)', [
      customerId,
      lectureId,
    ]);
  }

  // 회원 가입 여부 확인
  async CheckCustomerId(customerId: number): Promise<boolean> {
    const result = await this.memberRepository.query('CALL CHECK_CUSTOMER_ID(?)', [customerId]);
    console.log('result', result);
    
    return parseInt(result[0][0].result) === 1;
  }
}
