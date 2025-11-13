import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entity/users.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateUsersDto } from './dto/create-users.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { CreateWithdrawalReasonDto } from 'src/withdrawal-reason/dto/ceate-withdrawal-reason.dto';
import { UserType } from './enum/user-type.enum';
import { WithdrawalReason } from 'src/withdrawal-reason/entity/withdrawal-reason.entity';
import { Instructor } from 'src/instructor/entity/instructor.entity';
import { Customer } from 'src/customer/entity/customer.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    @InjectRepository(Instructor)
    private instructorRepository: Repository<Instructor>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  /* email, provider를 이용해 user 조회 */
  async findUserByEmail(
    email: string,
    provider: string,
  ): Promise<Users | undefined> {
    return await this.usersRepository.findOne({
      where: { email, provider },
    });
  }

  /* user 생성 */
  async createUser(userData: CreateUsersDto): Promise<Users> {
    return await this.usersRepository.save(userData);
  }

  /* userId를 이용해서 user 조회 (instructor, customer 관계 데이터 포함) */
  async findUserByPk(userId: number): Promise<Users> {
    return await this.usersRepository.findOne({
      where: { userId },
      relations: ['instructor', 'customer'],
    });
  }

  /* userType을 지정 */
  async selectUserType(userId: number, userType: UserType): Promise<void> {
    await this.usersRepository.update({ userId }, { userType });
  }

  /* user 프로필 수정 */
  async editUserProfile(
    userId: number,
    editUserDto: EditUserDto,
  ): Promise<void> {
    // Users 테이블에서만 업데이트할 필드들
    const userUpdateData = {
      name: editUserDto.name,
      profileImage: editUserDto.profileImage,
      birth: editUserDto.birth,
      phoneNumber: editUserDto.phoneNumber,
    };

    await this.usersRepository.update({ userId }, userUpdateData);
  }

  /* instructor 프로필 수정 */
  async editInstructorProfile(
    userId: number,
    editUserDto: EditUserDto,
  ): Promise<void> {
    const instructorUpdateData = {
      workingLocation: editUserDto.instructorWorkingLocation,
      career: editUserDto.instructorCareer,
      history: editUserDto.instructorHistory,
      introduction: editUserDto.instructorIntroduction,
      curriculum: editUserDto.instructorCurriculum,
      youtubeLink: editUserDto.instructorYoutubeLink,
      instagramLink: editUserDto.instructorInstagramLink,
      facebookLink: editUserDto.instructorFacebookLink,
    };

    // null과 undefined 값 제거
    const filteredData = Object.fromEntries(
      Object.entries(instructorUpdateData).filter(
        ([_, value]) => value !== null && value !== undefined,
      ),
    );

    if (Object.keys(filteredData).length > 0) {
      await this.instructorRepository.update(
        { user: { userId } },
        filteredData,
      );
    }
  }

  /* customer 프로필 수정 */
  async editCustomerProfile(
    userId: number,
    editUserDto: EditUserDto,
  ): Promise<void> {
    if (editUserDto.customerNickname !== null) {
      await this.customerRepository.update(
        { user: { userId } },
        { customerNickname: editUserDto.customerNickname },
      );
    }
  }

  /* user(instructor) 탈퇴 */
  async withdrawUser(
    userId: number,
    createWithdrawalReasonDto: CreateWithdrawalReasonDto,
  ): Promise<void> {
    const withdrawalReasonContent =
      createWithdrawalReasonDto.withdrawalReasonContent;

    await this.usersRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        // 1. WithdrawalReason을 먼저 삽입 (Users 정보가 아직 null이 아닌 상태에서)
        await entityManager.insert(WithdrawalReason, {
          user: { userId },
          withdrawalReasonContent,
        });

        // 2. Users의 개인정보를 null로 처리 (콘텐츠는 보존됨)
        await entityManager.update(
          Users,
          { userId },
          {
            email: null,
            userType: null,
            provider: null,
            name: null,
            profileImage: null,
            birth: null,
            phoneNumber: null,
            refreshToken: null, // refreshToken도 함께 처리
            userDeletedAt: new Date(),
          },
        );
      },
    );
  }

  /* user refreshToken 심기 */
  async updateRefreshToken(userId: number, hashedToken: string): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: hashedToken });
  }

  /* user refreshToken 제거 */
  async removeRefreshToken(userId: number) {
    await this.usersRepository.update(userId, { refreshToken: null });
  }
}
