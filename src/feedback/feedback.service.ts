import { Injectable } from '@nestjs/common';
import { FeedbackRepository } from './feedback.repository';
import { Feedback } from './entity/feedback.entity';
import { FeedbackDto } from './dto/feedback.dto';
import { EditFeedbackDto } from './dto/editFeedback.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import { FeedbackTarget } from './entity/feedbackTarget.entity';
import { FeedbackTargetRepository } from './feedbackTarget.repository';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackRepository: FeedbackRepository,
    private readonly feedbackTargetRepository: FeedbackTargetRepository,
  ) {}

  /* 강사용 전체 feedback 조회 */
  async getAllFeedbackByInstructor(userId: number): Promise<Feedback[]> {
    const feedbacks =
      await this.feedbackRepository.getAllFeedbackByInstructor(userId);

    return feedbacks;
  }

  /* feedback 상세 조회 */
  async getFeedbackById(feedbackId: number): Promise<Feedback> {
    const feedback = await this.feedbackRepository.getFeedbackById(feedbackId);
    return feedback;
  }

  /* feedback 생성 */
  async createFeedback(
    userId: number,
    feedbackDto: FeedbackDto,
  ): Promise<Feedback> {
    return await this.feedbackRepository.createFeedback(userId, feedbackDto);
  }

  /* feedbackTarget 생성 */
  async createFeedbackTarget(
    feedbackId: number,
    feedbackTarget: string,
  ): Promise<FeedbackTarget> {
    return await this.feedbackTargetRepository.createFeedbackTarget(
      feedbackId,
      feedbackTarget,
    );
  }

  /* feedback 수정 */
  async updateFeedback(
    feedbackId: number,
    editFeedbackDto: EditFeedbackDto,
  ): Promise<UpdateResult> {
    return await this.feedbackRepository.updateFeedback(
      feedbackId,
      editFeedbackDto,
    );
  }

  /* feedbackTarget 수정 */
  async updateFeedbackTarget(
    feedbackId: number,
    feedbackTarget: string,
  ): Promise<UpdateResult> {
    return await this.feedbackTargetRepository.updateFeedbackTarget(
      feedbackId,
      feedbackTarget,
    );
  }

  /* feedback 삭제(softDelete) */
  async softDeleteFeedback(feedbackId: number): Promise<UpdateResult> {
    return await this.feedbackRepository.softDeleteFeedback(feedbackId);
  }

  /* feedbackTarget 삭제 */
  async deleteFeedbackTarget(feedbackId: number): Promise<DeleteResult> {
    return await this.feedbackTargetRepository.deleteFeedbackTarget(feedbackId);
  }
}
