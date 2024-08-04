import { Injectable } from '@nestjs/common';
import { ImageRepository } from './image.repository';
import { Image } from './entity/image.entity';

@Injectable()
export class ImageService {
  constructor(private readonly imageRepository: ImageRepository) {}

  // feedback image 저장
  async createImage(feedbackId: number, fileUrl: string) {
    const imagePath = fileUrl;
    return await this.imageRepository.createImage(feedbackId, imagePath);
  }

  // feedback image 조회
  async getImagesByFeedbackId(feedbackId: number): Promise<Image[]> {
    return await this.imageRepository.getImagesByFeedbackId(feedbackId);
  }

  // feedbackId에 해당하는 image 삭제
  async deleteImagesByFeedbackId(feedbackId: number): Promise<void> {
    await this.imageRepository.deleteImagesByFeedbackId(feedbackId);
  }

  // image 삭제
  async deleteImage(imageId: number): Promise<void> {
    return await this.imageRepository.deleteImage(imageId);
  }
}
