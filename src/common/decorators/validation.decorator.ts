import { applyDecorators, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/common-response.dto';

export function ValidateAndTransform() {
  return applyDecorators(
    UsePipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        disableErrorMessages: false,
        validationError: {
          target: false,
          value: false,
        },
      }),
    ),
    ApiResponse({
      status: 400,
      description: '입력 데이터 검증 실패',
      type: ErrorResponseDto,
    }),
  );
}

export function ValidateQuery() {
  return applyDecorators(
    UsePipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        disableErrorMessages: false,
      }),
    ),
  );
}
