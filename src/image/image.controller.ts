import { Body, Controller, Delete, Res } from '@nestjs/common';
import { ImageService } from './image.service';
import { DeleteImageDto } from './dto/delete-image.dto';
import { ApiTags } from '@nestjs/swagger';
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
  async deleteImage(
    @Res() res: Response,
    @Body() deleteImageDto: DeleteImageDto,
  ) {
    await this.imageService.deleteFeedbackImageFromS3(deleteImageDto);
    return this.responseService.success(res, 'feedbackImage 삭제 성공');
  }
}
