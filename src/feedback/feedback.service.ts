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
  // async createFeedbackTarget(
  //   feedbackId: number,
  //   feedbackTarget: string,
  // ): Promise<FeedbackTarget> {
  //   try {
  //     return await this.feedbackTargetRepository.createFeedbackTarget(
  //       feedbackId,
  //       feedbackTarget,
  //     );
  //   } catch (error) {
  //     throw new Error('feedbackTarget 생성 중 오류가 발생했습니다.');
  //   }
  // }
  async createFeedbackTarget(feedbackId: number, feedbackTarget: string): Promise<void> {
    const userIds = feedbackTarget.split(',').map(id => parseInt(id.trim()));

    console.log('userIds:', userIds);
    
    
    // for 루프를 사용하여 각 사용자 ID에 대해 데이터베이스에 피드백 대상을 추가
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];  // 배열의 인덱스를 사용하여 현재 userId를 얻음
      console.log('userId:', userId);
      
      if (!isNaN(userId)) { // 유효한 숫자인지 확인
        await this.feedbackTargetRepository.createFeedbackTarget(
          feedbackId, userId
        );
      }
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
