// feedback-presigned-url.dto.ts
export class FeedbackPresignedUrlDto {
  presignedUrl: string;
  fileName: string;
  fileType?: string; // 'image' 또는 'video'
  fileSize?: number; // 파일 크기 (bytes)
  duration?: string; // 동영상 길이 (초)
  thumbnailPath?: string; // 동영상 썸네일 경로
}
