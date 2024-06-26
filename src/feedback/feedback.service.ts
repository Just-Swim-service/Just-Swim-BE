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
    if (feedback.user && feedback.user.userId === userId) {
      return { feedback, feedbackTargetList };
    }
    // member
    if (
      feedbackTargetList.some(
        (feedbackTarget) =>
          feedbackTarget.user && feedbackTarget.user.userId === userId,
      )
    ) {
      return feedback;
    }
  }

  /* feedback 생성 */
  async createFeedback(
    userId: number,
    feedbackDto: FeedbackDto,
    files?: Express.Multer.File[],
  ): Promise<Feedback> {
    // DB 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const feedback = await this.feedbackRepository.createFeedback(
        userId,
        feedbackDto,
        queryRunner,
      );

      if (files && files.length > 0) {
        const fileUploadPromises = files.map(async (file) => {
          const ext = file.mimetype.split('/')[1];
          const fileName = `feedback/${userId}/${Date.now().toString()}-${file.originalname}`;
          const fileUrl = await this.awsService.uploadImageToS3(
            fileName,
            file,
            ext,
          );
          await this.imageService.createImage(
            feedback.feedbackId,
            fileUrl,
            queryRunner,
          );
        });

        await Promise.all(fileUploadPromises);
      }
      // 정상적으로 끝났을 경우 commit
      await queryRunner.commitTransaction();
      return feedback;
    } catch (error) {
      console.log(error);
      // 에러 발생 시 트랜잭션 rollback
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('피드백 생성 실패');
    } finally {
      // 끝났을 경우 queryRunner 해제
      await queryRunner.release();
    }
  }

  /* feedbackTarget 생성 */
  async createFeedbackTarget(
    feedbackId: number,
    feedbackTarget: FeedbackTargetDto[],
  ): Promise<void> {
    // DB 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const target of feedbackTarget) {
        const lectureId = target.lectureId;
        for (const userId of target.userIds) {
          if (!isNaN(userId)) {
            // 여기서 추가적인 유효성 검사를 수행할 수 있음
            await this.feedbackTargetRepository.createFeedbackTarget(
              feedbackId,
              lectureId,
              userId,
              queryRunner,
            );
          }
        }
      }

      // 모든 작업이 성공적으로 완료되면 커밋
      await queryRunner.commitTransaction();
    } catch (error) {
      // 롤백
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('피드백 타겟 생성 실패');
    } finally {
      // queryRunner 해제
      await queryRunner.release();
    }
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
    if (feedback.user && feedback.user.userId !== userId) {
      throw new UnauthorizedException('feedback 수정 권한이 없습니다.');
    }

    // DB 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 피드백 업데이트
      await this.feedbackRepository.updateFeedback(
        feedbackId,
        editFeedbackDto,
        queryRunner,
      );

      // 피드백 타겟 업데이트
      if (editFeedbackDto.feedbackTarget.length > 0) {
        await this.updateFeedbackTarget(
          feedbackId,
          editFeedbackDto.feedbackTarget,
        );
      }

      // 이미지 관리
      const existingImages =
        await this.imageService.getImagesByFeedbackId(feedbackId);
      if (existingImages && existingImages.length > 0) {
        const deleteImageS3 = existingImages.map(async (image) => {
          const fileName = image.imagePath.split('/').slice(-2).join('/');
          await this.awsService.deleteImageFromS3(fileName);
        });
        const deleteImageDB = this.imageService.deleteImagesByFeedbackId(
          feedbackId,
          queryRunner,
        );
        await Promise.all([...deleteImageS3, deleteImageDB]);
      }

      if (files && files.length > 0) {
        const fileUploadPromises = files.map(async (file) => {
          const ext = file.mimetype.split('/')[1];
          const fileName = `feedback/${userId}/${Date.now().toString()}-${file.originalname}`;
          const fileUrl = await this.awsService.uploadImageToS3(
            fileName,
            file,
            ext,
          );
          await this.imageService.createImage(feedbackId, fileUrl, queryRunner);
        });

        await Promise.all(fileUploadPromises);
      }

      // 정상적으로 끝났을 경우 commit
      await queryRunner.commitTransaction();
    } catch (error) {
      // error 발생 시 트랜잭션 rollback
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('feedback 수정 실패');
    } finally {
      // 끝났을 경우 queryRunner 해제
      await queryRunner.release();
    }
  }

  /* feedbackTarget 수정 */
  async updateFeedbackTarget(
    feedbackId: number,
    feedbackTarget: FeedbackTargetDto[],
  ): Promise<void> {
    // DB 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 새로운 피드백 대상 생성
      for (const target of feedbackTarget) {
        const lectureId = target.lectureId;
        for (const userId of target.userIds) {
          if (!isNaN(userId)) {
            await this.feedbackTargetRepository.createFeedbackTarget(
              feedbackId,
              lectureId,
              userId,
              queryRunner,
            );
          }
        }
      }
      // 정상적으로 끝났을 경우 commit
      await queryRunner.commitTransaction();
    } catch (error) {
      // error 발생 시 트랜잭션 rollback
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('feedback 삭제 실패');
    } finally {
      // 끝났을 경우 queryRunner 해제
      await queryRunner.release();
    }
  }

  /* feedback 삭제(softDelete) */
  async softDeleteFeedback(userId: number, feedbackId: number): Promise<void> {
    const feedback = await this.feedbackRepository.getFeedbackByPk(feedbackId);
    if (!feedback) {
      throw new NotFoundException('존재하지 않는 피드백입니다.');
    }
    if (feedback.user && feedback.user.userId !== userId) {
      throw new UnauthorizedException('feedback 삭제 권한이 없습니다.');
    }

    // DB 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 피드백, 피드백 대상 및 이미지 삭제
      await Promise.all([
        this.feedbackRepository.softDeleteFeedback(feedbackId, queryRunner),
        this.deleteFeedbackTarget(feedbackId, queryRunner),
        this.imageService.deleteImagesByFeedbackId(feedbackId, queryRunner),
      ]);

      // S3에서 이미지 삭제
      const existingImages =
        await this.imageService.getImagesByFeedbackId(feedbackId);
      if (existingImages && existingImages.length > 0) {
        const deleteImagePromises = existingImages.map((image) => {
          const fileName = image.imagePath.split('/').slice(-2).join('/');
          this.awsService.deleteImageFromS3(fileName);
        });
        await Promise.all(deleteImagePromises);
      }

      // 정상적으로 끝났을 경우 commit
      await queryRunner.commitTransaction();
    } catch (error) {
      // error 발생 시 트랜잭션 rollback
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('feedback 삭제 실패');
    } finally {
      // 끝났을 경우 queryRunner 해제
      await queryRunner.release();
    }
  }

  /* feedbackTarget 삭제 */
  async deleteFeedbackTarget(
    feedbackId: number,
    queryRunner: QueryRunner,
  ): Promise<void> {
    await this.feedbackTargetRepository.deleteFeedbackTarget(
      feedbackId,
      queryRunner,
    );
  }
}
