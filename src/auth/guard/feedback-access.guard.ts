import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeedbackService } from 'src/feedback/feedback.service';

@Injectable()
export class FeedbackAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly feedbackService: FeedbackService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const feedbackId = parseInt(request.params.feedbackId);
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('인증된 사용자만 접근할 수 있습니다.');
    }

    if (!feedbackId || isNaN(feedbackId)) {
      throw new NotFoundException('유효하지 않은 피드백 ID입니다.');
    }

    try {
      const hasAccess = await this.feedbackService.checkFeedbackAccess(
        userId,
        feedbackId,
      );

      if (!hasAccess) {
        throw new ForbiddenException('피드백 접근 권한이 없습니다.');
      }

      return true;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new ForbiddenException('피드백 접근 권한을 확인할 수 없습니다.');
    }
  }
}

