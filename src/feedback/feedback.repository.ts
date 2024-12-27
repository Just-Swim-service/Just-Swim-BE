import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Feedback } from './entity/feedback.entity';
import { Repository } from 'typeorm';
import { FeedbackDto } from './dto/feedback.dto';
import { EditFeedbackDto } from './dto/edit-feedback.dto';

@Injectable()
export class FeedbackRepository {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  /* 강사용 전체 feedback 조회(feedbackDeletedAt is null) */
  async getAllFeedbackByInstructor(userId: number): Promise<any[]> {
    return await this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoin('feedback.feedbackTargets', 'feedbackTarget')
      .leftJoin('member', 'member', 'member.userId = feedbackTarget.userId')
      .leftJoin('lecture', 'lecture', 'lecture.lectureId = member.lectureId')
      .leftJoin('users', 'user', 'user.userId = feedbackTarget.userId')
      .select([
        'feedback.feedbackId AS feedbackId',
        'feedback.feedbackType AS feedbackType',
        'feedback.feedbackDate AS feedbackDate',
        'feedback.feedbackContent AS feedbackContent',
        'feedbackTarget.userId AS memberUserId',
        'member.memberNickname AS memberNickname',
        'lecture.lectureTitle AS lectureTitle',
        'user.profileImage AS memberProfileImage',
      ])
      .where('feedback.userId = :userId', { userId })
      .andWhere('feedback.feedbackDeletedAt IS NULL')
      .groupBy('feedback.feedbackId, feedbackTarget.userId')
      .orderBy('feedback.feedbackId', 'ASC')
      .addOrderBy('feedbackTarget.userId', 'ASC')
      .getRawMany();
  }

  /* customer 개인 feedback 전체 조회 */
  async getAllFeedbackByCustomer(userId: number): Promise<any[]> {
    return await this.feedbackRepository
      .createQueryBuilder('feedbackTarget')
      .leftJoin('feedbackTarget.feedback', 'feedback')
      .leftJoin('feedbackTarget.lecture', 'lecture')
      .leftJoin('lecture.user', 'instructor')
      .select([
        'feedback.feedbackId AS feedbackId',
        'lecture.lectureTitle AS lectureTitle',
        'feedback.feedbackContent AS feedbackContent',
        'feedback.feedbackDate AS feedbackDate',
        'feedback.feedbackType AS feedbackType',
        'instructor.profileImage AS instructorProfileImage',
        'instructor.name AS instructorName',
      ])
      .where('feedbackTarget.userId = :userId', { userId })
      .andWhere('feedback.feedbackDeletedAt IS NULL')
      .groupBy(
        `
        feedback.feedbackId,
        lecture.lectureTitle,
        feedback.feedbackContent,
        feedback.feedbackDate,
        feedback.feedbackType,
        instructor.profileImage,
        instructor.name
      `,
      )
      .getRawMany();
  }

  /* feedback 상세 조회 */
  async getFeedbackByPk(feedbackId: number) {
    return await this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoin('feedback.user', 'instructor')
      .leftJoin('feedback.images', 'image')
      .select([
        'feedback.userId AS instructorUserId',
        'feedback.feedbackId AS feedbackId',
        'feedback.feedbackType AS feedbackType',
        'feedback.feedbackDate AS feedbackDate',
        'feedback.feedbackContent AS feedbackContent',
        'feedback.feedbackLink AS feedbackLink',
        'feedback.feedbackCreatedAt AS feedbackCreatedAt',
        'instructor.name AS instructorName',
        'instructor.profileImage AS instructorProfileImage',
        'image.imagePath AS imagePath',
      ])
      .where('feedback.feedbackId = :feedbackId', { feedbackId })
      .andWhere('feedback.feedbackDeletedAt IS NULL')
      .groupBy(
        `
        feedback.feedbackId,
        feedback.userId,
        feedback.feedbackType,
        feedback.feedbackDate,
        feedback.feedbackContent,
        feedback.feedbackLink,
        feedback.feedbackCreatedAt,
        instructor.name,
        instructor.profileImage,
        image.imagePath
      `,
      )
      .getRawMany();
  }

  /* feedback 생성 */
  async createFeedback(
    userId: number,
    feedbackDto: FeedbackDto,
    feedbackTargetJson: string,
    filesJson: string,
  ): Promise<Feedback> {
    const { feedbackType, feedbackContent, feedbackDate, feedbackLink } =
      feedbackDto;
    const result = await this.feedbackRepository.query(
      'CALL CREATE_FEEDBACK(?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        feedbackType,
        feedbackContent,
        feedbackDate,
        feedbackLink,
        feedbackTargetJson,
        filesJson,
      ],
    );
    return result[0][0];
  }

  /* feedback 수정 */
  async updateFeedback(
    feedbackId: number,
    editFeedbackDto: EditFeedbackDto,
    feedbackTargetJson: string,
    filesJson: string,
  ): Promise<void> {
    const { feedbackType, feedbackContent, feedbackDate, feedbackLink } =
      editFeedbackDto;

    await this.feedbackRepository.query(
      'CALL UPDATE_FEEDBACK(?, ?, ?, ?, ?, ?, ?)',
      [
        feedbackId,
        feedbackType,
        feedbackContent,
        feedbackDate,
        feedbackLink,
        feedbackTargetJson,
        filesJson,
      ],
    );
  }

  /* feedback 삭제(softDelete) */
  async softDeleteFeedback(feedbackId: number): Promise<void> {
    await this.feedbackRepository.query('CALL SOFT_DELETE_FEEDBACK(?)', [
      feedbackId,
    ]);
  }
}
