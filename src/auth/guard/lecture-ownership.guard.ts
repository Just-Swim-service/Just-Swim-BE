import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LectureService } from 'src/lecture/lecture.service';

@Injectable()
export class LectureOwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly lectureService: LectureService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const lectureId = parseInt(request.params.lectureId);
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('인증된 사용자만 접근할 수 있습니다.');
    }

    if (!lectureId || isNaN(lectureId)) {
      throw new NotFoundException('유효하지 않은 강의 ID입니다.');
    }

    try {
      const hasAccess = await this.lectureService.checkLectureAccess(
        userId,
        lectureId,
      );

      if (!hasAccess) {
        throw new ForbiddenException('강의 접근 권한이 없습니다.');
      }

      return true;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new ForbiddenException('강의 접근 권한을 확인할 수 없습니다.');
    }
  }
}


