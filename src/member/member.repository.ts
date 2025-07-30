import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entity/member.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class MemberRepository {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  /* QR코드를 통한 회원 등록 */
  async insertMemberFromQR(
    userId: number,
    name: string,
    lectureId: number,
  ): Promise<Member> {
    return await this.memberRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        const exsitingMember = await entityManager.findOne(Member, {
          where: {
            user: { userId },
            lecture: { lectureId },
            memberDeletedAt: null,
          },
        });

        if (exsitingMember) {
          throw new ConflictException('이미 등록된 수업입니다.');
        }

        const newMember = entityManager.create(Member, {
          user: { userId },
          memberNickname: name,
          lecture: { lectureId },
        });

        return await entityManager.save(newMember);
      },
    );
  }

  /* 강의에 해당하는 member 조회 */
  async getAllMembersByLectureId(lectureId: number): Promise<any[]> {
    return await this.memberRepository
      .createQueryBuilder('member')
      .leftJoin('member.user', 'user')
      .leftJoin('member.lecture', 'lecture')
      .select([
        'member.memberId AS memberId',
        'user.userId AS userId',
        'lecture.lectureTitle AS lectureTitle',
        'lecture.lectureId AS lectureId',
        'member.memberNickname AS nickName',
        'user.name AS name',
        'user.profileImage AS profileImage',
      ])
      .where('member.lectureId = :lectureId', { lectureId })
      .orderBy('member.memberId', 'ASC')
      .getRawMany();
  }

  /* instructor가 피드백 작성 시 강의를 듣고 있는 member 조회 */
  async getAllMembersByFeedback(userId: number): Promise<any[]> {
    return await this.memberRepository
      .createQueryBuilder('member')
      .leftJoin('member.user', 'user')
      .leftJoin('member.lecture', 'lecture')
      .select([
        'member.memberId AS memberId',
        'user.userId AS userId',
        'lecture.lectureTitle AS lectureTitle',
        'lecture.lectureId AS lectureId',
        'member.memberNickname AS memberNickname',
        'user.profileImage AS profileImage',
      ])
      .where('lecture.userId = :userId', { userId })
      .orderBy('member.userId', 'ASC')
      .getRawMany();
  }

  /* instructor가 강의 상세 조회 때 수강생의 강의에 대한 정보 조회 */
  async getMemberInfo(
    memberUserId: number,
    instructorUserId: number,
  ): Promise<any> {
    return await this.memberRepository
      .createQueryBuilder('member')
      .leftJoin('member.user', 'user')
      .leftJoin('member.lecture', 'lecture')
      .leftJoin(
        'feedback',
        'feedback',
        `feedback.feedbackId = (
          SELECT F.feedbackId
          FROM feedback F
          JOIN feedbackTarget T ON F.feedbackId = T.feedbackId
          WHERE T.userId = :memberUserId
            AND F.userId = :instructorUserId
            AND F.feedbackDeletedAt IS NULL
          ORDER BY F.feedbackDate DESC
          LIMIT 1
        )`,
        { memberUserId, instructorUserId },
      )
      .leftJoin('image', 'image', `image.feedbackId = feedback.feedbackId`)
      .select([
        'user.userId AS userId',
        'user.profileImage AS profileImage',
        'user.name AS name',
        'lecture.lectureId AS lectureId',
        'lecture.lectureTitle AS lectureTitle',
        'lecture.lectureContent AS lectureContent',
        'lecture.lectureLocation AS lectureLocation',
        'lecture.lectureColor AS lectureColor',
        'lecture.lectureDays AS lectureDays',
        'lecture.lectureTime AS lectureTime',
        'lecture.lectureQRCode AS lectureQRCode',
        'lecture.lectureEndDate AS lectureEndDate',
        'feedback.feedbackId AS feedbackId',
        'feedback.feedbackDate AS feedbackDate',
        'feedback.feedbackType AS feedbackType',
        'feedback.feedbackContent AS feedbackContent',
        'feedback.feedbackLink AS feedbackLink',
        'image.imageId AS imageId',
        'image.imagePath AS imagePath',
      ])
      .where('member.userId = :memberUserId', { memberUserId })
      .orderBy('image.imageId', 'ASC')
      .getRawMany();
  }
}
