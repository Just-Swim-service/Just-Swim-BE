import { BadRequestException, Injectable } from '@nestjs/common';
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
  async insertMemberFromQR(userId: number, lectureId: number): Promise<Member> {
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
          throw new BadRequestException('중복된 수강생 정보가 있습니다.');
        }

        const newMember = entityManager.create(Member, {
          user: { userId },
          lecture: { lectureId },
        });

        return await entityManager.save(newMember);
      },
    );
  }

  /* 강의에 해당하는 member 조회 */
  async getAllMembersByLectureId(lectureId: number): Promise<Member[]> {
    return await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.lecture', 'lecture')
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
      .groupBy('member.memberId')
      .getRawMany();
  }

  /* instructor가 피드백 작성 시 강의를 듣고 있는 member 조회 */
  async getAllMembersByFeedback(userId: number): Promise<Member[]> {
    return await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.lecture', 'lecture')
      .select([
        'member.memberId AS memberId',
        'user.userId AS userId',
        'lecture.lectureTitle AS lectureTitle',
        'lecture.lectureId AS lectureId',
        'member.memberNickname AS memberNickname',
        'user.profileImage AS profileImage',
      ])
      .where('lecture.userId = :userId', { userId })
      .groupBy('member.userId')
      .getRawMany();
  }

  /* instructor가 강의 상세 조회 때 수강생의 강의에 대한 정보 조회 */
  async getMemberInfo(memberUserId: number, instructorUserId: number) {
    return await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.lecture', 'lecture')
      .leftJoin(
        'feedback',
        'feedback',
        `feedback.feedbackId = (
          SELECT F.feedbackId
          FROM feedback F
          JOIN feedbackTarget T ON F.feedbackId = T.feedbackId
          WHERE T.userId = :memberUserId
            AND F.userId = :instructorUserId
          ORDER BY F.feedbackDate DESC
          LIMIT 1
        )`,
        { memberUserId, instructorUserId },
      )
      .leftJoin(
        'image',
        'image',
        `image.feedbackId = feedback.feedbackId AND
          image.imageId = (
          SELECT I.imageId
          FROM image I
          WHERE I.feedbackId = feedback.feedbackId
          ORDER BY I.imageId DESC
          LIMIT 1
        )`,
      )
      .select([
        'user.userId AS userId',
        'user.profileImage AS profileImage',
        'user.name AS name',
        'user.birth AS birth',
        'user.email AS email',
        'user.phoneNumber AS phoneNumber',
        'lecture.lectureId AS lectureId',
        'lecture.lectureTitle AS lectureTitle',
        'lecture.lectureContent AS lectureContent',
        'lecture.lectureLocation AS lectureLocation',
        'lecture.lectureColor AS lectureColor',
        'lecture.lectureDays AS lectureDays',
        'lecture.lectureTime AS lectureTime',
        'feedback.feedbackId AS feedbackId',
        'feedback.feedbackDate AS feedbackDate',
        'feedback.feedbackType AS feedbackType',
        'feedback.feedbackContent AS feedbackContent',
        'image.imageId AS imageId',
        'image.imagePath AS imagePath',
      ])
      .where('member.userId')
      .getRawMany();
  }
}
