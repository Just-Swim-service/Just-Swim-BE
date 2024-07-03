import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { CustomerRepository } from './customer.repository';
import { Customer } from './entity/customer.entity';
import { Users } from 'src/users/entity/users.entity';

export class MockCustomerRepository {
  readonly mockCustomer: Customer = {
    user: new Users(),
    customerId: 1,
    customerNickname: '홍길동',
    customerCreatedAt: new Date(),
    customerUpdatedAt: new Date(),
  };
}

describe('CustomerService', () => {
  let service: CustomerService;
  let repository: CustomerRepository;

  const mockCustomer = new MockCustomerRepository().mockCustomer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: CustomerRepository,
          useValue: {
            createCustomer: jest.fn(),
            findCustomerByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    repository = module.get<CustomerRepository>(CustomerRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCustomer', () => {
    it('should create a new customer with the provided data', async () => {
      const newCustomer: Customer = {
        customerId: 1,
        user: new Users(),
        customerNickname: null,
        customerCreatedAt: new Date(),
        customerUpdatedAt: new Date(),
      };
      (repository.createCustomer as jest.Mock).mockResolvedValue(newCustomer);

      const result = await service.createCustomer(newCustomer.user.userId);

      expect(result).toEqual(newCustomer);
    });
  });

  describe('findCustomerByUserId', () => {
    it('userId를 통해 customer 정보를 조회', async () => {
      const userId = 1;
      (repository.findCustomerByUserId as jest.Mock).mockResolvedValue(
        mockCustomer,
      );

      const result = await service.findCustomerByUserId(userId);

      expect(result).toEqual(mockCustomer);
    });
  });
});
