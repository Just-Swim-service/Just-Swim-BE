import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entity/image.entity';
import { ImageRepository } from './image.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  providers: [ImageService, ImageRepository],
  exports: [ImageService, ImageRepository],
})
export class ImageModule {}
