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

  // 파일 타입 확인
  private getFileType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext)) {
      return 'video';
    }
    return 'image';
  }

  // feedback 파일 저장 (이미지 + 동영상)
  async createFile(
    feedbackId: number,
    fileUrl: string,
    fileName?: string,
    fileSize?: number,
    duration?: string,
    thumbnailPath?: string,
  ) {
    const fileType = fileName ? this.getFileType(fileName) : 'image';
    const imagePath = fileUrl;

    // 기존 createImage 메서드 사용 (추후 createFile로 확장 가능)
    return await this.imageRepository.createImage(feedbackId, imagePath);
  }

  // feedback image 저장 (기존 호환성 유지)
  async createImage(feedbackId: number, fileUrl: string) {
    return this.createFile(feedbackId, fileUrl);
  }

  // feedback 파일 조회 (이미지 + 동영상)
  async getFilesByFeedbackId(feedbackId: number): Promise<Image[]> {
    return await this.imageRepository.getImagesByFeedbackId(feedbackId);
  }

  // feedback image 조회 (기존 호환성 유지)
  async getImagesByFeedbackId(feedbackId: number): Promise<Image[]> {
    return this.getFilesByFeedbackId(feedbackId);
  }

  // feedbackId에 해당하는 파일 삭제 (이미지 + 동영상)
  async deleteFilesByFeedbackId(feedbackId: number): Promise<void> {
    await this.imageRepository.deleteImagesByFeedbackId(feedbackId);
  }

  // feedbackId에 해당하는 image 삭제 (기존 호환성 유지)
  async deleteImagesByFeedbackId(feedbackId: number): Promise<void> {
    return this.deleteFilesByFeedbackId(feedbackId);
  }

  // 파일 삭제 (이미지 + 동영상)
  async deleteFile(imageId: number): Promise<void> {
    return await this.imageRepository.deleteImage(imageId);
  }

  // image 삭제 (기존 호환성 유지)
  async deleteImage(imageId: number): Promise<void> {
    return this.deleteFile(imageId);
  }

  // 파일 URL에 따라 S3에서 삭제 (이미지 + 동영상)
  async deleteFeedbackFileFromS3(
    deleteImageDto: DeleteImageDto,
  ): Promise<void> {
    const fileURL = deleteImageDto.fileURL;

    const url = new URL(fileURL);
    const fileName = url.pathname.split('/').slice(-3).join('/');

    await this.awsService.deleteFileFromS3(fileName);
  }

  // imageURL에 따라 이미지 삭제 (기존 호환성 유지)
  async deleteFeedbackImageFromS3(
    deleteImageDto: DeleteImageDto,
  ): Promise<void> {
    return this.deleteFeedbackFileFromS3(deleteImageDto);
  }
}
