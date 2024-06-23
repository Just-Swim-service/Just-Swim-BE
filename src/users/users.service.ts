import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { Users } from './entity/users.entity';
import { UsersDto } from './dto/users.dto';
import { EditUserDto } from './dto/editUser.dto';
import { CustomerRepository } from 'src/customer/customer.repository';
import { InstructorRepository } from 'src/instructor/instructor.repository';
import { AwsService } from 'src/common/aws/aws.service';
import * as path from 'path';
import { LectureRepository } from 'src/lecture/lecture.repository';
import { MemberRepository } from 'src/member/member.repository';
import { FeedbackRepository } from 'src/feedback/feedback.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly awsService: AwsService,
    private readonly usersRepository: UsersRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly instructorRepository: InstructorRepository,
  ) {}

  /* email, provider를 이용해서 user 조회 */
  async findUserByEmail(
    email: string,
    provider: string,
  ): Promise<Users | undefined> {
    const result = await this.usersRepository.findUserByEmail(email, provider);
    return result;
  }

  /* user 생성 */
  async createUser(userData: UsersDto): Promise<Users> {
    return await this.usersRepository.createUser(userData);
  }

  /* userId를 이용해 user 조회 */
  async findUserByPk(userId: number): Promise<Users> {
    const result = await this.usersRepository.findUserByPk(userId);
    if (!result) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return result;
  }

  /* user의 userType 지정 */
  async selectUserType(userId: number, userType: string): Promise<void> {
    const user = await this.usersRepository.findUserByPk(userId);
    if (user.userType !== null) {
      throw new NotAcceptableException('계정에 타입이 이미 지정되어 있습니다.');
    }
    await this.usersRepository.selectUserType(userId, userType);
    if (userType === 'customer') {
      await this.customerRepository.createCustomer(userId);
    }
    if (userType === 'instructor') {
      await this.instructorRepository.createInstructor(userId);
    }
  }

  /* user 프로필 수정 */
  async editUserProfile(
    userId: number,
    editUserDto: EditUserDto,
    file?: Express.Multer.File,
  ): Promise<void> {
    const user = await this.usersRepository.findUserByPk(userId);

    // profileImage를 수정할 경우
    if (file) {
      // 기존 프로필 이미지가 있다면 삭제
      if (user.profileImage) {
        const fileName = user.profileImage.split('/').slice(-2).join('/');
        await this.awsService.deleteImageFromS3(fileName);
      }

      // 새 이미지 업로드
      const fileName = `profileImage/${Date.now().toString()}-${file.originalname}`;
      const ext = path.extname(file.originalname).substring(1);
      const profileImageUrl = await this.awsService.uploadImageToS3(
        fileName,
        file,
        ext,
      );
      editUserDto.profileImage = profileImageUrl;
    }
    await this.usersRepository.editUserProfile(userId, editUserDto);
  }

  /* user 탈퇴 */
  async withdrawUser(userId: number): Promise<void> {
    await this.usersRepository.withdrawUser(userId);
  }
}
