import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entity/users.entity';
import { EntityManager, Repository } from 'typeorm';
import { UsersDto } from './dto/users.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { WithdrawalReasonDto } from 'src/withdrawal-reason/dto/withdrawal-reason.dto';
import { UserType } from './enum/user-type.enum';
import { WithdrawalReason } from 'src/withdrawal-reason/entity/withdrawal-reason.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
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
  async createUser(userData: UsersDto): Promise<Users> {
    return await this.usersRepository.save(userData);
  }

  /* userId를 이용해서 user 조회 */
  async findUserByPk(userId: number): Promise<Users> {
    return await this.usersRepository.findOne({ where: { userId } });
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
    await this.usersRepository.update({ userId }, editUserDto);
  }

  /* user(instructor) 탈퇴 */
  async withdrawUser(
    userId: number,
    withdrawalReasonDto: WithdrawalReasonDto,
  ): Promise<void> {
    const withdrawalReasonContent = withdrawalReasonDto.withdrawalReasonContent;

    await this.usersRepository.manager.transaction(
      async (entityManager: EntityManager) => {
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
            userDeletedAt: new Date(),
          },
        );

        await entityManager.insert(WithdrawalReason, {
          user: { userId },
          withdrawalReasonContent,
        });
      },
    );
  }
}
