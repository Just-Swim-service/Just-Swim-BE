import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { MemberRepository } from './member.repository';
import { Member } from './entity/member.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AuthMiddleWare } from 'src/auth/middleware/auth.middleware';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Member]), AuthModule, UsersModule],
  controllers: [MemberController],
  providers: [MemberService, MemberRepository, AuthMiddleWare],
  exports: [MemberService, MemberRepository],
})
export class MemberModule {}
