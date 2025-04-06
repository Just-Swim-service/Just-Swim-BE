import { Image } from 'src/image/entity/image.entity';
import { mockFeedback } from './mock-feedback.repository';

export const mockImage: Image = {
  imageId: 1,
  feedback: mockFeedback,
  imagePath: 'imageURL',
  imageCreatedAt: new Date(),
  imageUpdatedAt: new Date(),
};

export const MockImageRepository = {
  createImage: jest.fn(),
  getImagesByFeedbackId: jest.fn(),
  deleteImage: jest.fn(),
  deleteImagesByFeedbackId: jest.fn(),
};
