import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FeedbackRepository } from './feedback.repository';
import { Feedback } from './entity/feedback.entity';
import { FeedbackDto } from './dto/feedback.dto';
import { EditFeedbackDto } from './dto/editFeedback.dto';
import { FeedbackTargetRepository } from './feedbackTarget.repository';
import { DataSource, QueryRunner } from 'typeorm';
import { AwsService } from 'src/common/aws/aws.service';
import { ImageService } from 'src/image/image.service';
import { FeedbackTargetDto } from './dto/feedbackTarget.dto';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly awsService: AwsService,
    private readonly feedbackRepository: FeedbackRepository,
    private readonly feedbackTargetRepository: FeedbackTargetRepository,
    private readonly imageService: ImageService,
    private readonly dataSource: DataSource,
  ) {}

  /* 강사용 전체 feedback 조회(feedbackDeletedAt is null) */
  async getAllFeedbackByInstructor(userId: number): Promise<Feedback[]> {
    return await this.feedbackRepository.getAllFeedbackByInstructor(userId);
  }

  /* customer 개인 feedback 전체 조회 */
  async getAllFeedbackByCustomer(userId: number): Promise<Feedback[]> {
    return await this.feedbackRepository.getAllFeedbackByCustomer(userId);
  }

  /* feedback 상세 조회 */
  async getFeedbackByPk(userId: number, feedbackId: number) {
    const feedback = await this.feedbackRepository.getFeedbackByPk(feedbackId);
    if (!feedback) {
      throw new NotFoundException('존재하지 않는 피드백입니다.');
    }

    const feedbackTargetList =
      await this.feedbackTargetRepository.getFeedbackTargetByFeedbackId(
        feedbackId,
      );
    // instructor
    for (let i = 0; i < feedback.length; i++) {
      if (feedback[i].userId === userId) {
        return { feedback, feedbackTargetList };
      }
    }

    // member
    for (let i = 0; i < feedbackTargetList.length; i++) {
      if (feedbackTargetList[i].userId === userId) {
        return feedback;
      }
    }
    throw new UnauthorizedException('feedback 상세 조회 권한이 없습니다.');
  }

  /* feedback 생성 */
  async createFeedback(
    userId: number,
    feedbackDto: FeedbackDto,
    files?: Express.Multer.File[],
  ): Promise<Feedback> {
    // image
    let filesJsonArray = [];
    if (files && files.length > 0) {
      filesJsonArray = await Promise.all(
        files.map(async (file) => {
          const ext = file.mimetype.split('/')[1];
          const fileName = `feedback/${userId}/${Date.now().toString()}-${file.originalname}`;
          const fileUrl = await this.awsService.uploadImageToS3(
            fileName,
            file,
            ext,
          );
          return { filePath: fileUrl };
        }),
      );
    }
    const filesJson = JSON.stringify(filesJsonArray);

    // feedbackTarget을 db에 넣을 수 있게 변경
    const feedbackTargetJson = JSON.stringify(feedbackDto.feedbackTarget);

    // feedback 생성
    const feedback = await this.feedbackRepository.createFeedback(
      userId,
      feedbackDto,
      feedbackTargetJson,
      filesJson,
    );

    return feedback;
  }

  /* feedback 수정 */
  async updateFeedback(
    userId: number,
    feedbackId: number,
    editFeedbackDto: EditFeedbackDto,
    files?: Express.Multer.File[],
  ): Promise<void> {
    const feedback = await this.feedbackRepository.getFeedbackByPk(feedbackId);
    if (!feedback) {
      throw new NotFoundException('존재하지 않는 피드백입니다.');
    }
    for (let i = 0; i < feedback.length; i++) {
      if (feedback[i].userId !== userId) {
        throw new UnauthorizedException('feedback 수정 권한이 없습니다.');
      }
    }

    const existingImages =
      await this.imageService.getImagesByFeedbackId(feedbackId);
    if (existingImages && existingImages.length > 0) {
      await Promise.all(
        existingImages.map(async (image) => {
          const fileName = image.imagePath.split('/').slice(-2).join('/');
          await this.awsService.deleteImageFromS3(fileName);
        }),
      );
    }

    // 이미지 파일 JSON 생성
    let filesJsonArray = [];
    if (files && files.length > 0) {
      filesJsonArray = await Promise.all(
        files.map(async (file) => {
          const ext = file.mimetype.split('/')[1];
          const fileName = `feedback/${userId}/${Date.now().toString()}-${file.originalname}`;
          const fileUrl = await this.awsService.uploadImageToS3(
            fileName,
            file,
            ext,
          );
          return { filePath: fileUrl };
        }),
      );
    }
    const filesJson =
      filesJsonArray.length > 0 ? JSON.stringify(filesJsonArray) : null;

    // feedbackTarget을 db에 넣을 수 있게 변경
    const feedbackTargetJson =
      editFeedbackDto.feedbackTarget &&
      editFeedbackDto.feedbackTarget.length > 0
        ? JSON.stringify(editFeedbackDto.feedbackTarget)
        : null;

    // 피드백 업데이트
    await this.feedbackRepository.updateFeedback(
      feedbackId,
      editFeedbackDto,
      feedbackTargetJson,
      filesJson,
    );
  }

  /* feedback 삭제(softDelete) */
  async softDeleteFeedback(userId: number, feedbackId: number): Promise<void> {
    const feedback = await this.feedbackRepository.getFeedbackByPk(feedbackId);
    if (!feedback) {
      throw new NotFoundException('존재하지 않는 피드백입니다.');
    }

    for (let i = 0; i < feedback.length; i++) {
      if (feedback[i].userId !== userId) {
        throw new UnauthorizedException('feedback 삭제 권한이 없습니다.');
      }
    }

    // S3에서 이미지 삭제
    const existingImages =
      await this.imageService.getImagesByFeedbackId(feedbackId);
    if (existingImages && existingImages.length > 0) {
      await Promise.all(
        existingImages.map((image) => {
          const fileName = image.imagePath.split('/').slice(-2).join('/');
          this.awsService.deleteImageFromS3(fileName);
        }),
      );
    }

    // 피드백 삭제
    await this.feedbackRepository.softDeleteFeedback(feedbackId);
  }
}
