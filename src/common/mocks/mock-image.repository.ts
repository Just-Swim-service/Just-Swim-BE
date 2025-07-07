import { Image } from 'src/image/entity/image.entity';
import { mockFeedback } from './mock-feedback.repository';

export const mockImage: Image = {
  imageId: 1,
  feedback: mockFeedback,
  fileType: 'image',
  fileName: 'afaf',
  fileSize: 123,
  duration: '14초',
  thumbnailPath: 'afaf',
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
