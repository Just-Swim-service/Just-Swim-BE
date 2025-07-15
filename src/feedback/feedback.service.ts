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

@Injectable()
export class FeedbackService {
  constructor(
    private readonly awsService: AwsService,
    private readonly feedbackRepository: FeedbackRepository,
    private readonly feedbackTargetRepository: FeedbackTargetRepository,
    private readonly imageService: ImageService,
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

      if (existingFeedback) {
        // 이미 해당 강의가 존재하면 image 정보를 추가
        if (feedback.imagePath) {
          existingFeedback.images.push({
            imagePath: feedback.imagePath,
          });
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
      filesJsonArray = createFeedbackDto.feedbackImage.map((imageUrl) => {
        return {
          filePath: imageUrl,
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
      filesJsonArray = editFeedbackDto.feedbackImage.map((imageUrl) => {
        return {
          filePath: imageUrl,
        };
      });

      const existingImages =
        await this.imageService.getImagesByFeedbackId(feedbackId);
      if (existingImages && existingImages.length > 0) {
        await Promise.all(
          existingImages.map(async (image) => {
            const url = new URL(image.imagePath);
            const fileName = url.pathname.split('/').slice(-3).join('/');
            await this.awsService.deleteImageFromS3(fileName);
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
        existingImages.map((image) => {
          const url = new URL(image.imagePath);
          const fileName = url.pathname.split('/').slice(-3).join('/');
          return this.awsService.deleteImageFromS3(fileName);
        }),
      );
    }

    // 피드백 삭제
    await this.feedbackRepository.softDeleteFeedback(feedbackId);
  }
}
