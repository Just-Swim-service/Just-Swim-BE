import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FeedbackRepository } from './feedback.repository';
import { Feedback } from './entity/feedback.entity';
import { FeedbackDto } from './dto/feedback.dto';
import { EditFeedbackDto } from './dto/edit-feedback.dto';
import { FeedbackTargetRepository } from './feedback-target.repository';
import { AwsService } from 'src/common/aws/aws.service';
import { ImageService } from 'src/image/image.service';
import slugify from 'slugify';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly awsService: AwsService,
    private readonly feedbackRepository: FeedbackRepository,
    private readonly feedbackTargetRepository: FeedbackTargetRepository,
    private readonly imageService: ImageService,
  ) {}

  /* 강사용 전체 feedback 조회(feedbackDeletedAt is null) */
  async getAllFeedbackByInstructor(userId: number): Promise<any[]> {
    const feedbackDatas =
      await this.feedbackRepository.getAllFeedbackByInstructor(userId);

    // feedbackId를 기준으로 중복된 피드백을 제거, member 정보와 image정보를 배열로 정리
    const feedbacks = feedbackDatas.reduce((acc, feedback) => {
      const existingFeedback = acc.find(
        (f) => f.feedbackId === feedback.feedbackId,
      );

      if (existingFeedback) {
        // 이미 해당 강의가 존재하면 member 정보를 추가
        if (feedback.memberUserId) {
          existingFeedback.members.push({
            memberUserId: feedback.memberUserId,
            memberProfileImage: feedback.memberProfileImage,
            memberNickname: feedback.memberNickname,
          });
        }
      } else {
        acc.push({
          feedbackId: feedback.feedbackId,
          feedbackType: feedback.feedbackType,
          feedbackDate: feedback.feedbackDate,
          feedbackContent: feedback.feedbackContent,
          lectureTitle: feedback.lectureTitle,
          members: feedback.memberUserId
            ? [
                {
                  memberUserId: feedback.memberUserId,
                  memberProfileImage: feedback.memberProfileImage,
                  memberNickname: feedback.memberNickname,
                },
              ]
            : [],
        });
      }
      return acc;
    }, []);

    return feedbacks;
  }

  /* customer 개인 feedback 전체 조회 */
  async getAllFeedbackByCustomer(userId: number): Promise<any[]> {
    const feedbackDatas =
      await this.feedbackRepository.getAllFeedbackByCustomer(userId);

    // 강사 정보를 객체로 묶어서 반환
    const feedbacks = feedbackDatas.map((feedback) => ({
      feedback: feedback.feedbackId,
      lectureTitle: feedback.lectureTitle,
      feedbackContent: feedback.feedbackContent,
      feedbackDate: feedback.feedbackDate,
      feedbackType: feedback.feedbackType,
      instructor: {
        instructorName: feedback.instructorName,
        instructorProfileImage: feedback.instructorProfileImage,
      },
    }));

    return feedbacks;
  }

  /* feedback 상세 조회 */
  async getFeedbackByPk(userId: number, feedbackId: number) {
    const feedbackData =
      await this.feedbackRepository.getFeedbackByPk(feedbackId);
    if (!feedbackData) {
      throw new NotFoundException('존재하지 않는 피드백입니다.');
    }

    const feedback = feedbackData.reduce((acc, feedback) => {
      const existingFeedback = acc.find(
        (f) => f.feedbackId === feedback.feedbackId,
      );

      if (existingFeedback) {
        // 이미 해당 강의가 존재하면 image 정보를 추가
        if (feedback.imagePath) {
          existingFeedback.images.push({
            images: feedback.imagePath,
          });
        }
      } else {
        acc.push({
          feedbackId: feedback.feedbackId,
          feedbackContent: feedback.feedbackContent,
          feedbackDate: feedback.feedbackDate,
          feedbackType: feedback.feedbackType,
          instructor: {
            instructorUserId: feedback.instructorUserId,
            instructorName: feedback.instructorName,
            instructorProfileImage: feedback.instructorProfileImage,
          },
          images: feedback.imagePath ? [{ imagePath: feedback.imagePath }] : [],
        });
      }
      return acc;
    }, []);

    const feedbackTargetList =
      await this.feedbackTargetRepository.getFeedbackTargetByFeedbackId(
        feedbackId,
      );
    // instructor
    if (feedback[0].instructor.instructorUserId === userId) {
      return { feedback, feedbackTargetList };
    }

    // member
    for (let i = 0; i < feedbackTargetList.length; i++) {
      if (feedbackTargetList[i].memberUserId === userId) {
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
          // slugify로 -나 스페이스를 처리
          const originalNameWithoutExt = file.originalname
            .split('.')
            .slice(0, -1)
            .join('.');
          const slugifiedName = slugify(originalNameWithoutExt, {
            lower: true,
            strict: true,
          });
          const fileName = `feedback/${userId}/${Date.now().toString()}-${slugifiedName}.${ext}`;
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

    // 피드백 중 사용자 권한 확인
    const authorizedFeedback = feedback.find(
      (f) => f.instructorUserId === userId,
    );
    if (!authorizedFeedback) {
      throw new UnauthorizedException('feedback 수정 권한이 없습니다.');
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
          // slugify로 -나 스페이스를 처리
          const originalNameWithoutExt = file.originalname
            .split('.')
            .slice(0, -1)
            .join('.');
          const slugifiedName = slugify(originalNameWithoutExt, {
            lower: true,
            strict: true,
          });
          const fileName = `feedback/${userId}/${Date.now().toString()}-${slugifiedName}.${ext}`;
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

    // 삭제 중 사용자 권한 확인
    const authorizedFeedback = feedback.find(
      (f) => f.instructorUserId === userId,
    );
    if (!authorizedFeedback) {
      throw new UnauthorizedException('feedback 수정 권한이 없습니다.');
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
