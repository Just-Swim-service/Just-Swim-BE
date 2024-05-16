import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { Users } from './entity/users.entity';
import { UsersDto } from './dto/users.dto';
import { EditUserDto } from './dto/editUser.dto';
import { CustomerRepository } from 'src/customer/customer.repository';
import { InstructorRepository } from 'src/instructor/instructor.repository';
import { MyLogger } from 'src/common/logger/logger.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: MyLogger,
    private readonly usersRepository: UsersRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly instructorRepository: InstructorRepository,
  ) {}

  /* email, provider를 이용해서 user 조회 */
  async findUserByEmail(
    email: string,
    provider: string,
  ): Promise<Users | undefined> {
    try {
      const result = await this.usersRepository.findUserByEmail(
        email,
        provider,
      );
      if (!result) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }
      return result;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '사용자를 찾는 중에 오류가 발생했습니다.',
      );
    }
  }

  /* user 생성 */
  async createUser(userData: UsersDto): Promise<Users> {
    try {
      return await this.usersRepository.createUser(userData);
    } catch (error) {
      this.logger.error(error);
      throw new Error('사용자 생성 중에 오류가 발생했습니다.');
    }
  }

  /* userId를 이용해 user 조회 */
  async findUserByPk(userId: number): Promise<Users> {
    try {
      const result = await this.usersRepository.findUserByPk(userId);
      if (!result) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }
      return result;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '사용자를 찾는 중에 오류가 발생했습니다.',
      );
    }
  }

  /* user의 userType 지정 */
  async selectUserType(userId: number, userType: string): Promise<void> {
    try {
      await this.usersRepository.selectUserType(userId, userType);
      if (userType === 'customer') {
        await this.customerRepository.createCustomer(userId);
      }
      if (userType === 'instructor') {
        await this.instructorRepository.createInstructor(userId);
      }
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '사용자 타입을 선택하는 중에 오류가 발생했습니다.',
      );
    }
  }

  /* user 프로필 수정 */
  async editUserProfile(
    userId: number,
    editUserDto: EditUserDto,
  ): Promise<void> {
    try {
      await this.usersRepository.editUserProfile(userId, editUserDto);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '사용자 프로필을 수정하는 중에 오류가 발생했습니다.',
      );
    }
  }
}
