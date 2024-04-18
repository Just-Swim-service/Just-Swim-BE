import { Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entity/member.entity';
import { MemberRepository } from './member.repository';
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
