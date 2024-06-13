import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [MulterModule.register({ limits: { fileSize: 5 * 1024 * 1024 } })],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
