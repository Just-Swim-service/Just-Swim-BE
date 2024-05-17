import { Module } from '@nestjs/common';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instructor } from './entity/instructor.entity';
import { InstructorRepository } from './instructor.repository';
import { LoggerModule } from 'src/common/logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Instructor]), LoggerModule],
  controllers: [InstructorController],
  providers: [InstructorService, InstructorRepository],
  exports: [InstructorService, InstructorRepository],
})
export class InstructorModule {}
