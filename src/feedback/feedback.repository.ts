import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Feedback } from './entity/feedback.entity';
import { QueryRunner, Repository } from 'typeorm';
import { FeedbackDto } from './dto/feedback.dto';
import { EditFeedbackDto } from './dto/editFeedback.dto';

@Injectable()
export class FeedbackRepository {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  /* 강사용 전체 feedback 조회(feedbackDeletedAt is null) */
  async getAllFeedbackByInstructor(userId: number): Promise<Feedback[]> {
    const result = await this.feedbackRepository.query(
      'CALL GET_ALL_FEEDBACK_INSTRUCTOR(?)',
      [userId],
    );
    return result[0];
  }

  /* customer 개인 feedback 전체 조회 */
  async getAllFeedbackByCustomer(userId: number): Promise<Feedback[]> {
    const result = await this.feedbackRepository.query(
      'CALL GET_ALL_FEEDBACK_CUSTOMER(?)',
      [userId],
    );
    return result[0];
  }

  /* feedback 상세 조회 */
  async getFeedbackByPk(feedbackId: number): Promise<Feedback> {
    const result = await this.feedbackRepository.query(
      'CALL GET_FEEDBACK_BY_PK(?)',
      [feedbackId],
    );
    return result[0];
  }

  /* feedback 생성 */
  async createFeedback(
    userId: number,
    feedbackDto: FeedbackDto,
    queryRunner: QueryRunner,
  ): Promise<Feedback> {
    const {
      feedbackType,
      feedbackContent,
      feedbackDate,
      feedbackLink,
      feedbackTarget,
    } = feedbackDto;
    const result = await this.feedbackRepository.queryRunner.manager.query(
      'CALL CREATE_FEEDBACK(?, ?, ?, ?, ?, ?)',
      [
        userId,
        feedbackType,
        feedbackContent,
        feedbackDate,
        feedbackLink,
        feedbackTarget,
      ],
    );
    return result[0][0];
  }

  /* feedback 수정 */
  async updateFeedback(
    feedbackId: number,
    editFeedbackDto: EditFeedbackDto,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const {
      feedbackType,
      feedbackContent,
      feedbackDate,
      feedbackLink,
      feedbackTarget,
    } = editFeedbackDto;

    await this.feedbackRepository.queryRunner.manager.query(
      'CALL UPDATE_FEEDBACK(?, ?, ?, ?, ?, ?)',
      [
        feedbackId,
        feedbackType,
        feedbackContent,
        feedbackDate,
        feedbackLink,
        feedbackTarget,
      ],
    );
  }

  /* feedback 삭제(softDelete) */
  async softDeleteFeedback(
    feedbackId: number,
    queryRunner: QueryRunner,
  ): Promise<void> {
    await this.feedbackRepository.queryRunner.manager.query(
      'CALL SOFT_DELETE_FEEDBACK(?)',
      [feedbackId],
    );
  }
}
