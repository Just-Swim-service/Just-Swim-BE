import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Feedback } from './entity/feedback.entity';
import { Repository, UpdateResult } from 'typeorm';
import { FeedbackDto } from './dto/feedback.dto';
import { EditFeedbackDto } from './dto/editFeedback.dto';

@Injectable()
export class FeedbackRepository {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  /* 강사용 전체 feedback 조회 */
  async getAllFeedbackByInstructor(userId: number): Promise<Feedback[]> {
    const result = await this.feedbackRepository.query(
      'CALL GET_ALL_FEEDBACK_INSTRUCTOR(?)',
      [userId],
    );
    return result[0];
  }

  /* feedback 상세 조회 */
  async getFeedbackById(feedbackId: number): Promise<Feedback> {
    const result = await this.feedbackRepository.query(
      'CALL GET_FEEDBACK_ID(?)',
      [feedbackId],
    );
    return result[0][0];
  }

  /* feedback 생성 */
  async createFeedback(
    userId: number,
    feedbackDto: FeedbackDto,
  ): Promise<Feedback> {
    const {
      feedbackType,
      feedbackContent,
      feedbackDate,
      feedbackFile,
      feedbackLink,
      feedbackTarget,
    } = feedbackDto;
    const result = await this.feedbackRepository.query(
      'CALL CREATE_FEEDBACK(?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        feedbackType,
        feedbackContent,
        feedbackDate,
        feedbackFile,
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
  ): Promise<UpdateResult> {
    const {
      feedbackType,
      feedbackContent,
      feedbackDate,
      feedbackFile,
      feedbackLink,
    } = editFeedbackDto;

    const result = await this.feedbackRepository.query(
      'CALL UPDATE_FEEDBACK(?, ?, ?, ?, ?, ?)',
      [
        feedbackId,
        feedbackType,
        feedbackContent,
        feedbackDate,
        feedbackFile,
        feedbackLink,
      ],
    );

    return result[0][0];
  }

  /* feedback 삭제(softDelete) */
  async softDeleteFeedback(feedbackId: number): Promise<UpdateResult> {
    return await this.feedbackRepository.query('CALL SOFT_DELETE_FEEDBACK(?)', [
      feedbackId,
    ]);
  }
}
