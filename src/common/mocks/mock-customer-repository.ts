import { Customer } from 'src/customer/entity/customer.entity';
import { mockUser } from './mock-user.repository';

export const mockCustomer: Customer = {
  user: mockUser,
  customerId: 1,
  customerNickname: '홍길동',
  customerCreatedAt: new Date(),
  customerUpdatedAt: new Date(),
};

export const MockCustomerRepository = {
  createCustomer: jest.fn(),
  findCustomerByUserId: jest.fn(),
};
