import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from './entity/image.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ImageRepository {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  // feedback에 따라 image 경로 저장
  async createImage(feedbackId: number, imagePath: string) {
    const newImage = this.imageRepository.create({
      feedback: { feedbackId },
      imagePath,
    });
    return await this.imageRepository.save(newImage);
  }

  // community에 따라 image 경로 저장
  async createCommunityImage(
    communityId: number,
    imagePath: string,
    fileType?: string,
    fileName?: string,
    fileSize?: number,
    duration?: string,
    thumbnailPath?: string,
  ) {
    const newImage = this.imageRepository.create({
      community: { communityId },
      imagePath,
      fileType,
      fileName,
      fileSize,
      duration,
      thumbnailPath,
    });
    return await this.imageRepository.save(newImage);
  }

  // feedback image 조회
  async getImagesByFeedbackId(feedbackId: number): Promise<Image[]> {
    return await this.imageRepository.find({
      where: { feedback: { feedbackId } },
    });
  }

  // community image 조회
  async getImagesByCommunityId(communityId: number): Promise<Image[]> {
    return await this.imageRepository.find({
      where: { community: { communityId } },
    });
  }

  // image 삭제
  async deleteImage(imageId: number) {
    await this.imageRepository.delete({ imageId });
  }

  // feedbackId에 해당하는 image 삭제
  async deleteImagesByFeedbackId(feedbackId: number): Promise<void> {
    await this.imageRepository.delete({ feedback: { feedbackId } });
  }

  // communityId에 해당하는 image 삭제
  async deleteImagesByCommunityId(communityId: number): Promise<void> {
    await this.imageRepository.delete({ community: { communityId } });
  }
}
