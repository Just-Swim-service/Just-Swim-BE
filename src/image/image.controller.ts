import { Body, Controller, Delete, Res } from '@nestjs/common';
import { ImageService } from './image.service';
import { DeleteImageDto } from './dto/delete-image.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ResponseService } from 'src/common/response/response.service';
import { response, Response } from 'express';

@ApiTags('Image')
@Controller('image')
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly responseService: ResponseService,
  ) {}

  /* imageUrl에 따라 이미지 삭제 */
  @Delete()
  @ApiOperation({
    summary: '이미지/동영상 파일 삭제',
    description: 'S3에서 이미지 또는 동영상 파일을 삭제합니다.',
  })
  async deleteImage(
    @Res() res: Response,
    @Body() deleteImageDto: DeleteImageDto,
  ) {
    await this.imageService.deleteFeedbackFileFromS3(deleteImageDto);
    return this.responseService.success(res, '파일 삭제 성공');
  }
}
