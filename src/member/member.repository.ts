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

  // 자신이 소속된 lecture 확인
  async getMyLectureList(customerId: number): Promise<Member[]> {
    return await this.memberRepository
      .createQueryBuilder('member')
      .leftJoin('lecture', 'lecture', 'member.lectureId = lecture.lectureId')
      .select([
        'lecture.lectureTitle AS lectureTitle',
        'lecture.lectureContent AS lectureContent',
        'lecture.lectureTime AS lectureTime',
        'lecture.lectureDays AS lectureDays',
        'lecture.lectureLocation AS lectureLocation',
        'lecture.lectureColor AS lectureColor',
      ])
      .where('member.customerId = : customerId', { customerId })
      .getRawMany();
  }
}
