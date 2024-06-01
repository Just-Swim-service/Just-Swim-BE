import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MemberRepository } from './member.repository';
import { Member } from './entity/member.entity';
import { MyLogger } from 'src/common/logger/logger.service';

@Injectable()
export class MemberService {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly logger: MyLogger,
  ) {}

  /* QR코드를 통한 회원 등록 */
  async insertMemberFromQR(userId: number, lectureId: number): Promise<Member> {
    try {
      return await this.memberRepository.insertMemberFromQR(userId, lectureId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'QR코드를 통한 회원 등록 중에 오류가 발생했습니다.',
      );
    }
  }

  /* 강의에 해당하는 수강생 */
  async getAllMembersByLectureId(lectureId: number): Promise<Member[]> {
    try {
      return await this.memberRepository.getAllMembersByLectureId(lectureId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '강의에 해당하는 수강생을 조회하는 중에 오류가 발생했습니다.',
      );
    }
  }

  /* instructor가 피드백 작성 시 강의를 듣고 있는 member 조회 */
  async getAllMembersByFeedback(userId: number): Promise<Member[]> {
    try {
      return await this.memberRepository.getAllMembersByFeedback(userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '강사에 해당하는 수강생을 조회하는 중에 오류가 발생했습니다.',
      );
    }
  }
}
