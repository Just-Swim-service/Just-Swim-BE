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
    try {
      const feedbacks =
        await this.feedbackRepository.getAllFeedbackByInstructor(userId);

      return feedbacks;
    } catch (error) {
      throw new Error(
        '강사가 작성한 전체 feedback 조회 중 오류가 발생했습니다.',
      );
    }
  }

  /* feedback 상세 조회 */
  async getFeedbackById(feedbackId: number): Promise<Feedback> {
    try {
      const feedback =
        await this.feedbackRepository.getFeedbackById(feedbackId);
      return feedback;
    } catch (error) {
      throw new Error('feedback 상세 조회 중 오류가 발생했습니다.');
    }
  }

  /* feedback 생성 */
  async createFeedback(
    userId: number,
    feedbackDto: FeedbackDto,
  ): Promise<Feedback> {
    try {
      return await this.feedbackRepository.createFeedback(userId, feedbackDto);
    } catch (error) {
      throw new Error('feedback 생성 중 오류가 발생했습니다.');
    }
  }

  /* feedbackTarget 생성 */
  async createFeedbackTarget(
    feedbackId: number,
    feedbackTarget: string,
  ): Promise<FeedbackTarget> {
    try {
      return await this.feedbackTargetRepository.createFeedbackTarget(
        feedbackId,
        feedbackTarget,
      );
    } catch (error) {
      throw new Error('feedbackTarget 생성 중 오류가 발생했습니다.');
    }
  }

  /* feedback 수정 */
  async updateFeedback(
    feedbackId: number,
    editFeedbackDto: EditFeedbackDto,
  ): Promise<void> {
    try {
      await this.feedbackRepository.updateFeedback(feedbackId, editFeedbackDto);
    } catch (error) {
      throw new Error('feedback 수정 중 오류가 발생했습니다.');
    }
  }

  /* feedbackTarget 수정 */
  async updateFeedbackTarget(
    feedbackId: number,
    feedbackTarget: string,
  ): Promise<void> {
    try {
      await this.feedbackTargetRepository.updateFeedbackTarget(
        feedbackId,
        feedbackTarget,
      );
    } catch (error) {
      throw new Error('feedbackTarget 수정 중 오류가 발생했습니다.');
    }
  }

  /* feedback 삭제(softDelete) */
  async softDeleteFeedback(feedbackId: number): Promise<void> {
    try {
      await this.feedbackRepository.softDeleteFeedback(feedbackId);
    } catch (error) {
      throw new Error('feedback 삭제 중 오류가 발생했습니다.');
    }
  }

  /* feedbackTarget 삭제 */
  async deleteFeedbackTarget(feedbackId: number): Promise<void> {
    try {
      await this.feedbackTargetRepository.deleteFeedbackTarget(feedbackId);
    } catch (error) {
      throw new Error('feedbackTarget 삭제 중 오류가 발생했습니다.');
    }
  }
}
