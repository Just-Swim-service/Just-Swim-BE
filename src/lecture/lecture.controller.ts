import { Controller, Post, Body, Get, Param, ParseIntPipe, NotFoundException, Delete } from '@nestjs/common';
import { LectureService } from './lecture.service';
import { Lecture } from './entity/lecture.entity';

@Controller('lecture')
export class LectureController {
  constructor(private readonly lectureService: LectureService) {}

  // 강의 전체 조회
  @Get()
  async getLectures(): Promise<Lecture[]> {
    return await this.lectureService.getLectures();
  }

  // 강의 상세 조회
  @Get('/:lectureId')
  async getLectureById(@Param('lectureId', ParseIntPipe) lectureId: number): Promise<Lecture> {
    const lecture = await this.lectureService.getLectureById(lectureId);
    return lecture;
  }

  // 강의 수정
  @Post('/:lectureId')
  async updateLecture(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Body('lectureTime') lectureTime: string,
    @Body('lectureDays') lectureDays: string,
    @Body('lectureLevel') lectureLevel: string,
    @Body('lectureContent') lectureContent: string,
    @Body('lectureQRCode') lectureQRCode: string,
  ): Promise<void> {
    await this.lectureService.updateLecture(lectureId, lectureTime, lectureDays, lectureLevel, lectureContent, lectureQRCode);
  }

  // 강의 삭제(소프트 삭제)
  @Delete('/:lectureId')
  async softDeleteLecture(@Param('lectureId', ParseIntPipe) lectureId: number): Promise<void> {
    await this.lectureService.softDeleteLecture(lectureId);
  }

  // 강의 생성
  @Post()
  async createLecture(
    @Body('instructorId') instructorId: number,
    @Body('lectureTime') lectureTime: string,
    @Body('lectureDays') lectureDays: string,
    @Body('lectureLevel') lectureLevel: string,
    @Body('lectureContent') lectureContent: string,
    @Body('lectureQRCode') lectureQRCode: string,
  ): Promise<void> {
    await this.lectureService.createLecture(instructorId, lectureTime, lectureDays, lectureLevel, lectureContent, lectureQRCode);
  }
}
