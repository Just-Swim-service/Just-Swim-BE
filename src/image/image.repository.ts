import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from './entity/image.entity';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class ImageRepository {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  // feedback에 따라 image 경로 저장
  async createImage(
    feedbackId: number,
    imagePath: string,
    queryRunner: QueryRunner,
  ) {
    return await this.imageRepository.queryRunner.manager.query(
      'CALL CREATE_IMAGE(?, ?)',
      [feedbackId, imagePath],
    );
  }

  // feedback image 조회
  async getImagesByFeedbackId(feedbackId: number): Promise<Image[]> {
    return await this.imageRepository.query(
      'CALL GET_IMAGES_BY_FEEDBACKID(?)',
      [feedbackId],
    );
  }

  // image 삭제
  async deleteImage(imageId: number) {
    return await this.imageRepository.query('CALL DELETE_IMAGE(?)', [imageId]);
  }

  // feedbackId에 해당하는 image 삭제
  async deleteImagesByFeedbackId(
    feedbackId: number,
    queryRunner: QueryRunner,
  ): Promise<void> {
    await this.imageRepository.queryRunner.manager.query(
      'CALL DELETE_IMAGES_BY_FEEDBACKID(?)',
      [feedbackId],
    );
  }
}
