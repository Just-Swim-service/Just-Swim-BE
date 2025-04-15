import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { Users } from './entity/users.entity';
import { CreateUsersDto } from './dto/create-users.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { CustomerRepository } from 'src/customer/customer.repository';
import { InstructorRepository } from 'src/instructor/instructor.repository';
import { AwsService } from 'src/common/aws/aws.service';
import { UserType } from './enum/user-type.enum';
import slugify from 'slugify';
import { EditProfileImageDto } from 'src/image/dto/edit-profile-image.dto';
import { CreateWithdrawalReasonDto } from 'src/withdrawal-reason/dto/ceate-withdrawal-reason.dto';

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
  async createUser(userData: CreateUsersDto): Promise<Users> {
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
  async selectUserType(userId: number, userType: UserType): Promise<void> {
    const user = await this.usersRepository.findUserByPk(userId);
    if (user.userType !== null) {
      throw new NotAcceptableException('계정에 타입이 이미 지정되어 있습니다.');
    }
    await this.usersRepository.selectUserType(userId, userType);
    if (userType === UserType.Customer) {
      await this.customerRepository.createCustomer(userId);
    }
    if (userType === UserType.Instructor) {
      await this.instructorRepository.createInstructor(userId);
    }
  }

  /* profileImage 업로드를 위한 presigned url 생성 */
  async generateProfileImagePresignedUrl(
    userId: number,
    editProfileImageDto: EditProfileImageDto,
  ): Promise<string> {
    if (!editProfileImageDto.profileImage) {
      throw new BadRequestException(
        '프로필 이미지 파일명이 제공되지 않았습니다.',
      );
    }

    const ext = editProfileImageDto.profileImage.split('.').pop();
    if (!ext || !['jpg', 'png', 'jpeg', 'webp'].includes(ext.toLowerCase())) {
      throw new BadRequestException('허용되지 않는 이미지 확장자입니다.');
    }

    const originalNameWithoutExt = editProfileImageDto.profileImage
      .split('.')
      .slice(0, -1)
      .join('.'); // 확장자를 제외한 이름
    const slugifiedName = slugify(originalNameWithoutExt, {
      lower: true,
      strict: true,
    });
    const fileName = `profileImage/${Date.now().toString()}-${slugifiedName}.${ext}`;

    // presignedUrl 생성
    const presignedUrl = await this.awsService.getPresignedUrl(fileName, ext);

    return presignedUrl;
  }

  /* user 프로필 수정 */
  async editUserProfile(userId: number, editUserDto: EditUserDto) {
    const user = await this.usersRepository.findUserByPk(userId);

    // profileImage를 수정할 경우
    if (editUserDto.profileImage) {
      // 기존 프로필 이미지가 있다면 삭제 준비
      const exProfileImage = user.profileImage ? user.profileImage : null;

      if (exProfileImage) {
        const fileName = user.profileImage.split('/').slice(-2).join('/');
        await this.awsService.deleteImageFromS3(fileName);
      }
    }
    await this.usersRepository.editUserProfile(userId, editUserDto);
  }

  /* user 탈퇴 */
  async withdrawUser(
    userId: number,
    createWithdrawalReasonDto: CreateWithdrawalReasonDto,
  ): Promise<void> {
    await this.usersRepository.withdrawUser(userId, createWithdrawalReasonDto);
  }
}
