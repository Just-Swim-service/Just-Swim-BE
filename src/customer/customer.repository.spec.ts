import { Test, TestingModule } from '@nestjs/testing';
import { CustomerRepository } from './customer.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from './entity/customer.entity';
import { Repository } from 'typeorm';

describe('CustomerRepository', () => {
  let customerRepository: CustomerRepository;
  let repo: jest.Mocked<Repository<Customer>>;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerRepository,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockRepo,
        },
      ],
    }).compile();

    customerRepository = module.get<CustomerRepository>(CustomerRepository);
    repo = module.get(getRepositoryToken(Customer));
  });

  it('should create customer for given userId', async () => {
    const created = {
      customerId: 1,
      user: { userId: 1 },
      customerNickname: '홍길동',
    } as Customer;

    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    const result = await customerRepository.createCustomer(1, '홍길동');

    expect(repo.create).toHaveBeenCalledWith({
      user: { userId: 1 },
      customerNickname: '홍길동',
    });
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(result).toEqual(created);
  });

  it('should find customer by userId', async () => {
    const found = { customerId: 1, user: { userId: 1 } } as Customer;
    repo.findOne.mockResolvedValue(found);

    const result = await customerRepository.findCustomerByUserId(1);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { user: { userId: 1 } },
    });
    expect(result).toEqual(found);
  });
});
