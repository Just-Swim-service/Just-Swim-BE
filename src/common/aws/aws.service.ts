import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'), // AWS Region
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY'), // Access Key
        secretAccessKey: this.configService.get<string>(
          'AWS_S3_SECRET_ACCESS_KEY',
        ), // Secret Key
      },
    });
  }

  /* 파일 타입 확인 */
  public getContentType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();

    // 이미지 타입
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    }

    // 동영상 타입
    if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext)) {
      return `video/${ext}`;
    }

    // 기본값
    return 'application/octet-stream';
  }

  /* 파일 업로드 (이미지 + 동영상) */
  async uploadFileToS3(fileName: string, file: Express.Multer.File) {
    const contentType = this.getContentType(fileName);

    // AWS S3에 파일 업로드 명령을 생성
    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
      Key: fileName,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: contentType,
      ...(contentType.startsWith('video/') && {
        CacheControl: 'max-age=31536000',
        ContentDisposition: 'inline',
      }),
    });

    await this.s3Client.send(command);

    return `https://s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${this.configService.get<string>('AWS_S3_BUCKET_NAME')}/${fileName}`;
  }

  /* 이미지 저장 (기존 호환성 유지) */
  async uploadImageToS3(
    fileName: string,
    file: Express.Multer.File,
    ext: string,
  ) {
    return this.uploadFileToS3(fileName, file);
  }

  /* 동영상 저장 */
  async uploadVideoToS3(fileName: string, file: Express.Multer.File) {
    return this.uploadFileToS3(fileName, file);
  }

  /* 파일 삭제 (이미지 + 동영상) */
  async deleteFileFromS3(fileName: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
      Key: fileName,
    });

    await this.s3Client.send(command);
  }

  /* 이미지 삭제 (기존 호환성 유지) */
  async deleteImageFromS3(fileName: string) {
    return this.deleteFileFromS3(fileName);
  }

  /* qrcode 저장 */
  async uploadQRCodeToS3(lectureId: number, qrCodeData: string) {
    const buffer = Buffer.from(qrCodeData.split(',')[1], 'base64');
    const fileName = `qrcodes/${lectureId}.png`;

    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
      Key: fileName, // 업로드될 파일의 이름
      Body: buffer, // 업로드할 파일
      ACL: 'public-read', // 파일 접근 권한
      ContentType: 'image/png', // 파일 타입/확장자
    });

    await this.s3Client.send(command);

    return `https://${this.configService.get<string>('AWS_S3_BUCKET_NAME')}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${fileName}`;
  }

  /* presigned url (이미지 + 동영상) */
  async getPresignedUrl(
    fileName: string,
    ext?: string,
  ): Promise<{ presignedUrl: string; contentType: string }> {
    const contentType = ext
      ? this.getContentType(`${fileName}.${ext}`)
      : this.getContentType(fileName);

    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
      Key: fileName,
      ContentType: contentType,
      ...(contentType.startsWith('video/') && {
        CacheControl: 'max-age=31536000', // 1년 캐시
        ContentDisposition: 'inline',
      }),
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // 1시간 유효
    });

    return { presignedUrl, contentType };
  }
}
