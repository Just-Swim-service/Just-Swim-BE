import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB로 증가 (동영상 지원)
        files: 4, // 최대 4개 파일
      },
    }),
  ],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
