import { FeedbackTarget } from 'src/feedback/entity/feedback-target.entity';
import { mockFeedback } from './mock-feedback.repository';
import { mockUser } from './mock-user.repository';
import { mockLecture } from './mock-lecture.repository';

export const mockFeedbackTarget: FeedbackTarget = {
  feedbackTargetId: 1,
  feedback: mockFeedback,
  user: mockUser,
  lecture: mockLecture,
  feedbackTargetCreatedAt: new Date(),
  feedbackTargetUpdatedAt: new Date(),
};

export const MockFeedbackTargetRepository = {
  getFeedbackTargetByFeedbackId: jest
    .fn()
    .mockResolvedValue([mockFeedbackTarget]),
};
