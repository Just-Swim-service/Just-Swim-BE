import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CustomerRepository } from './customer.repository';
import { Customer } from './entity/customer.entity';
import { MyLogger } from 'src/common/logger/logger.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly logger: MyLogger,
  ) {}

  /* userType을 customer로 지정할 경우 customer 정보 생성 */
  async createCustomer(userId: number): Promise<Customer> {
    try {
      return await this.customerRepository.createCustomer(userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '수강생 프로필 생성 중에 오류가 발생했습니다.',
      );
    }
  }

  /* customer의 정보 조회 */
  async findCustomerByUserId(userId: number): Promise<Customer> {
    try {
      return await this.customerRepository.findCustomerByUserId(userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '수강생 프로필 조회 중 오류가 발생했습니다.',
      );
    }
  }
}
