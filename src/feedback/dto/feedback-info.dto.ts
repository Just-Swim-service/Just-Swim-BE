import { ImageDto } from 'src/image/dto/image-info.dto';

export class FeedbackInfoDto {
  feedbackId: number;
  feedbackDate: string;
  feedbackType: string;
  feedbackContent: string;
  feedbackLink?: string;
  feedbackCreatedAt?: Date;
  lectureTitle?: string;
  images?: ImageDto[];
}
