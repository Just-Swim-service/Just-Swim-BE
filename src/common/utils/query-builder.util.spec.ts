import { QueryBuilderUtil } from './query-builder.util';
import { SelectQueryBuilder } from 'typeorm';

describe('QueryBuilderUtil', () => {
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<any>>;

  beforeEach(() => {
    mockQueryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
    } as any;
  });

  describe('addSafeWhere', () => {
    it('should add where condition with sanitized parameters', () => {
      const condition = 'userId = :userId';
      const parameters = { userId: 1 };

      QueryBuilderUtil.addSafeWhere(mockQueryBuilder, condition, parameters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(condition, {
        userId: 1,
      });
    });

    it('should sanitize string parameters', () => {
      const condition = 'userName = :userName';
      const parameters = { userName: 'test<script>alert("xss")</script>' };

      QueryBuilderUtil.addSafeWhere(mockQueryBuilder, condition, parameters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(condition, {
        userName: 'test',
      });
    });

    it('should filter out null and undefined parameters', () => {
      const condition = 'userId = :userId AND userName = :userName';
      const parameters = { userId: 1, userName: null, userEmail: undefined };

      QueryBuilderUtil.addSafeWhere(mockQueryBuilder, condition, parameters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(condition, {
        userId: 1,
      });
    });
  });

  describe('addSafeOrderBy', () => {
    it('should add order by for allowed columns', () => {
      QueryBuilderUtil.addSafeOrderBy(mockQueryBuilder, 'userId', 'ASC');

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('userId', 'ASC');
    });

    it('should throw error for disallowed columns', () => {
      expect(() => {
        QueryBuilderUtil.addSafeOrderBy(
          mockQueryBuilder,
          'invalidColumn',
          'ASC',
        );
      }).toThrow('Invalid sort column: invalidColumn');
    });

    it('should default to ASC direction', () => {
      QueryBuilderUtil.addSafeOrderBy(mockQueryBuilder, 'userId');

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('userId', 'ASC');
    });
  });

  describe('addSafePagination', () => {
    it('should add pagination with valid parameters', () => {
      QueryBuilderUtil.addSafePagination(mockQueryBuilder, 10, 20);

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(20);
    });

    it('should enforce maximum limit', () => {
      QueryBuilderUtil.addSafePagination(mockQueryBuilder, 150, 0);

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(100);
    });

    it('should enforce minimum limit', () => {
      QueryBuilderUtil.addSafePagination(mockQueryBuilder, 0, 0);

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(1);
    });

    it('should enforce minimum offset', () => {
      QueryBuilderUtil.addSafePagination(mockQueryBuilder, 10, -5);

      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(0);
    });

    it('should default offset to 0', () => {
      QueryBuilderUtil.addSafePagination(mockQueryBuilder, 10);

      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(0);
    });
  });

  describe('addSafeSearch', () => {
    it('should add search conditions for valid fields', () => {
      QueryBuilderUtil.addSafeSearch(mockQueryBuilder, 'test', [
        'userName',
        'userEmail',
      ]);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(userName LIKE :searchTerm OR userEmail LIKE :searchTerm)',
        { searchTerm: '%test%' },
      );
    });

    it('should sanitize search term', () => {
      QueryBuilderUtil.addSafeSearch(mockQueryBuilder, 'test<script>', [
        'userName',
      ]);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(userName LIKE :searchTerm)',
        { searchTerm: '%test%' },
      );
    });

    it('should filter out invalid search fields', () => {
      QueryBuilderUtil.addSafeSearch(mockQueryBuilder, 'test', [
        'userName',
        'invalidField',
      ]);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(userName LIKE :searchTerm)',
        { searchTerm: '%test%' },
      );
    });

    it('should not add search if no valid fields', () => {
      QueryBuilderUtil.addSafeSearch(mockQueryBuilder, 'test', [
        'invalidField',
      ]);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should not add search for empty term', () => {
      QueryBuilderUtil.addSafeSearch(mockQueryBuilder, '', ['userName']);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should not add search for whitespace only term', () => {
      QueryBuilderUtil.addSafeSearch(mockQueryBuilder, '   ', ['userName']);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });
  });
});
