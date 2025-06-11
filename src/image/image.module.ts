import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entity/image.entity';
import { ImageRepository } from './image.repository';
import { AwsModule } from 'src/common/aws/aws.module';
import { ImageController } from './image.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Image]), AwsModule],
  controllers: [ImageController],
  providers: [ImageService, ImageRepository],
  exports: [ImageService, ImageRepository],
})
export class ImageModule {}
