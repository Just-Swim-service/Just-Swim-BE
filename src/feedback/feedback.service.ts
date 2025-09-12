import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FeedbackRepository } from './feedback.repository';
import { Feedback } from './entity/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { EditFeedbackDto } from './dto/edit-feedback.dto';
import { FeedbackTargetRepository } from './feedback-target.repository';
import { AwsService } from 'src/common/aws/aws.service';
import { ImageService } from 'src/image/image.service';
import slugify from 'slugify';
import { FeedbackImageDto } from 'src/image/dto/feedback-image.dto';
import { FeedbackPresignedUrlDto } from './dto/feedback-presigned-url.dto';
import { InstructorFeedbackDto } from './dto/instructor-feedback.dto';
import { CustomerFeedbackDto } from './dto/customer-feedback.dto';
import { FeedbackDetail } from './dto/feedback-detail.dto';
import { UsersService } from 'src/users/users.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly awsService: AwsService,
    private readonly feedbackRepository: FeedbackRepository,
    private readonly feedbackTargetRepository: FeedbackTargetRepository,
    private readonly imageService: ImageService,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}

  /* 강사용 전체 feedback 조회(feedbackDeletedAt is null) */
  async getAllFeedbackByInstructor(
    userId: number,
  ): Promise<InstructorFeedbackDto[]> {
    const feedbackDatas =
      await this.feedbackRepository.getAllFeedbackByInstructor(userId);

    // feedbackId를 기준으로 중복된 피드백을 제거, member 정보와 image정보를 배열로 정리
    const feedbacks = feedbackDatas.reduce((acc, feedback) => {
      const existingFeedback = acc.find(
        (f) => f.feedbackId === feedback.feedbackId,
      );

      const member = feedback.memberUserId
        ? {
            memberUserId: feedback.memberUserId,
            memberProfileImage: feedback.memberProfileImage,
            memberName: feedback.memberNickname,
          }
        : null;

      if (existingFeedback) {
        // 중복된 멤버인지 확인 후 추가
        if (
          member &&
          !existingFeedback.members.some(
            (m) => m.memberUserId === member.memberUserId,
          )
        ) {
          existingFeedback.members.push(member);
        }
      } else {
        acc.push({
          feedbackId: feedback.feedbackId,
          feedbackType: feedback.feedbackType,
          feedbackDate: feedback.feedbackDate,
          feedbackContent: feedback.feedbackContent,
          lectureTitle: feedback.lectureTitle,
          members: member ? [member] : [],
        });
      }

      return acc;
    }, []);

    return feedbacks;
  }

  /* customer 개인 feedback 전체 조회 */
  async getAllFeedbackByCustomer(
    userId: number,
  ): Promise<CustomerFeedbackDto[]> {
    const feedbackDatas =
      await this.feedbackRepository.getAllFeedbackByCustomer(userId);

    // 강사 정보를 객체로 묶어서 반환
    const feedbacks = feedbackDatas.map((feedback) => ({
      feedbackId: feedback.feedbackId,
      lectureTitle: feedback.lectureTitle,
      lectureColor: feedback.lectureColor,
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
  async getFeedbackByPk(
    userId: number,
    feedbackId: number,
  ): Promise<FeedbackDetail> {
    const feedbackData =
      await this.feedbackRepository.getFeedbackByPk(feedbackId);
    if (!feedbackData) {
      throw new NotFoundException('존재하지 않는 피드백입니다.');
    }

    const feedback = feedbackData.reduce((acc, feedback) => {
      const existingFeedback = acc.find(
        (f) => f.feedbackId === feedback.feedbackId,
      );

      const newImage = feedback.imagePath
        ? {
            imagePath: feedback.imagePath,
            thumbnailPath: feedback.thumbnailPath,
            fileType: feedback.fileType,
            fileName: feedback.fileName,
            fileSize: feedback.fileSize,
            duration: feedback.duration,
          }
        : null;

      if (existingFeedback) {
        // 이미지 중복 방지: imagePath 기준
        if (
          newImage &&
          !existingFeedback.images.some(
            (img) => img.imagePath === newImage.imagePath,
          )
        ) {
          existingFeedback.images.push(newImage);
        }
      } else {
        acc.push({
          feedbackId: feedback.feedbackId,
          feedbackContent: feedback.feedbackContent,
          feedbackDate: feedback.feedbackDate,
          feedbackType: feedback.feedbackType,
          feedbackLink: feedback.feedbackLink,
          feedbackCreatedAt: feedback.feedbackCreatedAt,
          lectureTitle: feedback.lectureTitle,
          instructor: {
            instructorUserId: feedback.instructorUserId,
            instructorName: feedback.instructorName,
            instructorProfileImage: feedback.instructorProfileImage,
          },
          images: newImage ? [newImage] : [],
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
        return { feedback };
      }
    }
    throw new UnauthorizedException('feedback 상세 조회 권한이 없습니다.');
  }

  /* feedback 파일 업로드를 위한 presignedUrl 생성 (이미지 + 동영상) */
  async generateFeedbackPresignedUrls(
    userId: number,
    feedbackImageDto: FeedbackImageDto,
  ): Promise<FeedbackPresignedUrlDto[]> {
    const presignedUrls = await Promise.all(
      feedbackImageDto.files.map(async (file) => {
        const ext = file.split('.').pop(); // 확장자 추출
        const originalNameWithoutExt = file.split('.').slice(0, -1).join('.'); // 확장자를 제외한 이름
        const slugifiedName = slugify(originalNameWithoutExt, {
          lower: true,
          strict: true,
        });
        const fileName = `feedback/${userId}/${Date.now().toString()}-${slugifiedName}.${ext}`;

        // 파일 타입 확인
        const fileType = ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext)
          ? 'video'
          : 'image';

        // presignedUrl 생성
        const { presignedUrl, contentType } =
          await this.awsService.getPresignedUrl(fileName, ext);

        return {
          presignedUrl,
          fileName,
          fileType,
          contentType,
        };
      }),
    );

    return presignedUrls;
  }

  /* feedback 생성 */
  async createFeedback(
    userId: number,
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<Feedback> {
    // image
    let filesJsonArray = [];

    if (
      createFeedbackDto.feedbackImage &&
      createFeedbackDto.feedbackImage.length > 0
    ) {
      filesJsonArray = createFeedbackDto.feedbackImage.map((file: any) => {
        return {
          filePath: file.filePath,
          fileType: file.fileType,
          fileName: file.fileName,
          fileSize: file.fileSize,
          duration: file.duration ?? null,
          thumbnailPath: file.thumbnailPath ?? null,
        };
      });
    }

    const filesJson = JSON.stringify(filesJsonArray);

    // feedbackTarget을 db에 넣을 수 있게 변경
    const feedbackTargetJson = JSON.stringify(createFeedbackDto.feedbackTarget);

    // feedback 생성
    const feedback = await this.feedbackRepository.createFeedback(
      userId,
      createFeedbackDto,
      feedbackTargetJson,
      filesJson,
    );

    // 피드백 생성 후 알림 발송
    try {
      const targetUserIds = createFeedbackDto.feedbackTarget.flatMap(
        (target) => target.userIds,
      );
      const lectureTitle = '강의'; // 실제로는 lecture 정보를 조회해야 함

      await this.notificationService.createFeedbackNotification(
        userId,
        targetUserIds,
        feedback.feedbackId,
        lectureTitle,
        createFeedbackDto.feedbackContent,
      );
    } catch (error) {
      // 알림 발송 실패는 피드백 생성에 영향을 주지 않음
      console.error('Failed to send feedback notification:', error);
    }

    return feedback;
  }

  /* feedback 수정 */
  async updateFeedback(
    userId: number,
    feedbackId: number,
    editFeedbackDto: EditFeedbackDto,
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

    let filesJsonArray = [];

    // s3에 저장된 새로운 이미지들의 URL 생성
    if (
      editFeedbackDto.feedbackImage &&
      editFeedbackDto.feedbackImage.length > 0
    ) {
      filesJsonArray = editFeedbackDto.feedbackImage.map((file: any) => {
        return {
          filePath: file.filePath,
          fileType: file.fileType,
          fileName: file.fileName,
          fileSize: file.fileSize,
          duration: file.duration ?? null,
          thumbnailPath: file.thumbnailPath ?? null,
        };
      });

      const existingImages =
        await this.imageService.getImagesByFeedbackId(feedbackId);
      if (existingImages && existingImages.length > 0) {
        await Promise.all(
          existingImages.flatMap((image) => {
            const deleteTasks: Promise<void>[] = [];

            // 이미지/영상 파일 삭제
            if (image.imagePath) {
              const url = new URL(image.imagePath);
              const fileName = url.pathname.split('/').slice(-3).join('/');
              deleteTasks.push(this.awsService.deleteImageFromS3(fileName));
            }

            // 썸네일이 있을 경우 삭제
            if (image.thumbnailPath) {
              const thumbUrl = new URL(image.thumbnailPath);
              const thumbFileName = thumbUrl.pathname
                .split('/')
                .slice(-3)
                .join('/');
              deleteTasks.push(
                this.awsService.deleteImageFromS3(thumbFileName),
              );
            }

            return deleteTasks;
          }),
        );
      }
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
        existingImages.flatMap((image) => {
          const deleteTasks: Promise<void>[] = [];

          // 이미지/영상 파일 삭제
          if (image.imagePath) {
            const url = new URL(image.imagePath);
            const fileName = url.pathname.split('/').slice(-3).join('/');
            deleteTasks.push(this.awsService.deleteImageFromS3(fileName));
          }

          // 썸네일이 있을 경우 삭제
          if (image.thumbnailPath) {
            const thumbUrl = new URL(image.thumbnailPath);
            const thumbFileName = thumbUrl.pathname
              .split('/')
              .slice(-3)
              .join('/');
            deleteTasks.push(this.awsService.deleteImageFromS3(thumbFileName));
          }

          return deleteTasks;
        }),
      );
    }

    // 피드백 삭제
    await this.feedbackRepository.softDeleteFeedback(feedbackId);
  }

  // 피드백 접근 권한 확인
  async checkFeedbackAccess(
    userId: number,
    feedbackId: number,
  ): Promise<boolean> {
    try {
      const user = await this.usersService.findUserByPk(userId);
      if (!user) {
        return false;
      }

      const feedback =
        await this.feedbackRepository.getFeedbackByPk(feedbackId);
      if (!feedback || feedback.length === 0) {
        return false;
      }

      if (user.userType === 'instructor') {
        // 강사는 자신이 작성한 피드백만 접근 가능
        return feedback[0].instructorUserId === userId;
      } else if (user.userType === 'customer') {
        // 수강생은 자신이 대상인 피드백만 접근 가능
        const feedbackTargetList =
          await this.feedbackTargetRepository.getFeedbackTargetByFeedbackId(
            feedbackId,
          );
        return feedbackTargetList.some(
          (target) => target.memberUserId === userId,
        );
      }

      return false;
    } catch (error) {
      return false;
    }
  }
}
