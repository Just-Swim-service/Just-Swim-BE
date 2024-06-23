import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entity/image.entity';
import { ImageRepository } from './image.repository';
import { AwsModule } from 'src/common/aws/aws.module';

@Module({
  imports: [TypeOrmModule.forFeature([Image]), AwsModule],
  providers: [ImageService, ImageRepository],
  exports: [ImageService, ImageRepository],
})
export class ImageModule {}
