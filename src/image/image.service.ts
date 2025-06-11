import { Injectable } from '@nestjs/common';
import { ImageRepository } from './image.repository';
import { Image } from './entity/image.entity';
import { AwsService } from 'src/common/aws/aws.service';
import { DeleteImageDto } from './dto/delete-image.dto';

@Injectable()
export class ImageService {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly awsService: AwsService,
  ) {}

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

  // imageURL에 따라 이미지 삭제
  async deleteFeedbackImageFromS3(
    deleteImageDto: DeleteImageDto,
  ): Promise<void> {
    const fileURL = deleteImageDto.fileURL;

    const url = new URL(fileURL);
    const fileName = url.pathname.split('/').slice(-3).join('/');

    await this.awsService.deleteImageFromS3(fileName);
  }
}
