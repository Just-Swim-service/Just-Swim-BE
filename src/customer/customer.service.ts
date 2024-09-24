import { Injectable } from '@nestjs/common';
import { CustomerRepository } from './customer.repository';
import { Customer } from './entity/customer.entity';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  /* userType을 customer로 지정할 경우 customer 정보 생성 */
  async createCustomer(userId: number): Promise<Customer> {
    return await this.customerRepository.createCustomer(userId);
  }

  /* customer의 정보 조회 */
  async findCustomerByUserId(userId: number): Promise<Customer> {
    return await this.customerRepository.findCustomerByUserId(userId);
  }
}
