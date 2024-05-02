import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entity/users.entity';
import { Repository } from 'typeorm';
import { UsersDto } from './dto/users.dto';
import { EditUserDto } from './dto/editUser.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {}

  async findUserByEmail(
    email: string,
    provider: string,
  ): Promise<Users | undefined> {
    const result = await this.usersRepository.query(
      `CALL FIND_USER_BY_EMAIL(?, ?)`,
      [email, provider],
    );

    // 데이터가 존재하면 첫번째 데이터를 반환
    // 이 조건문이 없으니 신규 유저 생성시 생성이 되지 않음
    if (result.length > 0) {
      return result[0][0];
    }
  }

  async createUser(userData: UsersDto): Promise<Users> {
    const result = await this.usersRepository.query(
      `CALL CREATE_USER(?, ?, ?, ?, ?, ?)`,
      [
        userData.email,
        userData.name,
        userData.profileImage,
        userData.provider,
        userData.phoneNumber,
        userData.birth,
      ],
    );

    return result;
  }

  async findUserByPk(userId: number): Promise<Users> {
    const result = await this.usersRepository.query(`CALL FIND_USER_BY_PK(?)`, [
      userId,
    ]);
    return result;
  }

  async selectUserType(userId: number, userType: string): Promise<void> {
    await this.usersRepository.query(`CALL SELECT_USER_TYPE(?, ?)`, [
      userId,
      userType,
    ]);
  }

  async editUserProfile(
    userId: number,
    editUserDto: EditUserDto,
  ): Promise<void> {
    const { name, profileImage, birth, phoneNumber } = editUserDto;
    await this.usersRepository.query(`CALL EDIT_USER_PROFILE(?, ?, ?, ?, ?)`, [
      userId,
      name,
      profileImage,
      birth,
      phoneNumber,
    ]);
  }
}
