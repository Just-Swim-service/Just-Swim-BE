import { Module } from '@nestjs/common';
import { SecurityLoggerService } from './security-logger.service';
import { SessionManagerService } from './session-manager.service';

@Module({
  providers: [SecurityLoggerService, SessionManagerService],
  exports: [SecurityLoggerService, SessionManagerService],
})
export class SecurityModule {}

