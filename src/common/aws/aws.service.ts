import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
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

  async uploadImageToS3(
    fileName: string,
    file: Express.Multer.File,
    ext: string,
  ) {
    // AWS S3에 이미지 업로드 명령을 생성
    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
      Key: fileName, // 업로드될 파일의 이름
      Body: file.buffer, // 업로드할 파일
      ACL: 'public-read', // 파일 접근 권한
      ContentType: `image/${ext}`, // 파일 타입/확장자
    });

    // 생성된 명령을 S3 클라이언트에 전달하여 이미지 업로드를 수행
    await this.s3Client.send(command);

    // 업로드된 이미지의 URL을 반환
    return `https://s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${fileName}`;
  }

  async deleteImageFromS3(fileName: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
      Key: fileName,
    });

    await this.s3Client.send(command);
  }

  async uploadImagesToS3(
    fileNames: string[],
    files: Express.Multer.File[],
    exts: string[],
  ) {
    if (files.length !== fileNames.length || files.length !== exts.length) {
      throw new BadRequestException('');
    }
  }
}
