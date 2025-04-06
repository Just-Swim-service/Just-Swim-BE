import { Feedback } from 'src/feedback/entity/feedback.entity';
import { mockUser } from './mock-user.repository';
import { FeedbackType } from 'src/feedback/enum/feedback-type.enum';

export const mockFeedback: Feedback = {
  feedbackId: 1,
  user: mockUser,
  feedbackType: FeedbackType.Personal,
  feedbackContent:
    '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
  feedbackLink: 'URL',
  feedbackDate: '2024.04.22',
  feedbackCreatedAt: new Date(),
  feedbackUpdatedAt: new Date(),
  feedbackDeletedAt: null,
  feedbackTarget: [],
  image: [],
};

export const MockFeedbackRepository = {
  getAllFeedbackByInstructor: jest.fn().mockResolvedValue([mockFeedback]),
  getAllFeedbackByCustomer: jest.fn().mockResolvedValue([mockFeedback]),
  getFeedbackByPk: jest.fn(),
  createFeedback: jest.fn().mockResolvedValue(mockFeedback),
  updateFeedback: jest.fn().mockResolvedValue(undefined),
  softDeleteFeedback: jest.fn().mockResolvedValue(undefined),
};
