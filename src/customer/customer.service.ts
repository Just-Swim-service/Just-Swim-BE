import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomerRepository } from './customer.repository';
import { Customer } from './entity/customer.entity';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  /* customer의 정보 조회 */
  async findCustomerByUserId(userId: number): Promise<Customer> {
    const customer = await this.customerRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new NotFoundException(
        '해당 사용자의 customer 정보를 찾을 수 없습니다.',
      );
    }
    return customer;
  }

  /* userType을 customer로 지정할 경우 customer 정보 생성 */
  async createCustomer(userId: number): Promise<Customer> {
    const exists = await this.customerRepository.findCustomerByUserId(userId);
    if (exists) {
      throw new ConflictException('이미 해당 customer 정보가 존재합니다.');
    }
    return await this.customerRepository.createCustomer(userId);
  }
}
