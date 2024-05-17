import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entity/customer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  /* userType을 customer로 지정할 경우 customer 정보 생성 */
  async createCustomer(userId: number): Promise<Customer> {
    const result = await this.customerRepository.query(
      `CALL CREATE_CUSTOMER(?)`,
      [userId],
    );
    return result;
  }

  /* customer의 정보 조회 */
  async findCustomerByUserId(userId: number): Promise<Customer> {
    return await this.customerRepository.query(
      `CALL FIND_CUSTOMER_BY_USERID(?)`,
      [userId],
    );
  }
}
