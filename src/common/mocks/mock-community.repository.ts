import { Community } from 'src/community/entity/community.entity';
import { CommunityComment } from 'src/community/entity/community-comment.entity';
import { CommunityLike } from 'src/community/entity/community-like.entity';
import { CommentLike } from 'src/community/entity/comment-like.entity';
import { Tag } from 'src/community/entity/tag.entity';
import { CommunityTag } from 'src/community/entity/community-tag.entity';
import { CategoryType } from 'src/community/enum/category-type.enum';
import { mockUser } from './mock-user.repository';

export const mockTag: Tag = {
  tagId: 1,
  tagName: '자유형',
  usageCount: 10,
  communityTags: [],
  tagCreatedAt: new Date(),
  tagUpdatedAt: new Date(),
};

export const mockTag2: Tag = {
  tagId: 2,
  tagName: '평영',
  usageCount: 8,
  communityTags: [],
  tagCreatedAt: new Date(),
  tagUpdatedAt: new Date(),
};

export const mockCommunityTag: CommunityTag = {
  communityTagId: 1,
  community: null,
  tag: mockTag,
  createdAt: new Date(),
};

export const mockCommunity: Community = {
  communityId: 1,
  user: mockUser,
  title: '오늘 수영 연습 후기',
  content:
    '오늘 자유형 연습을 했는데 정말 힘들었지만 뿌듯해요! 다음에는 배영도 도전해보려고 합니다.',
  category: CategoryType.RECORD,
  workoutData: {
    workoutType: '자유형',
    duration: '30분',
    distance: '500m',
    difficulty: '중급',
  },
  viewCount: 15,
  likeCount: 8,
  commentCount: 3,
  comments: [],
  likes: [],
  images: [],
  communityTags: [mockCommunityTag],
  communityCreatedAt: new Date(),
  communityUpdatedAt: new Date(),
  communityDeletedAt: null,
};

export const mockCommunityComment: CommunityComment = {
  commentId: 1,
  user: mockUser,
  community: mockCommunity,
  parentComment: null,
  replies: [],
  content: '정말 대단하세요! 저도 자유형 배우고 있는데 힘들어요 ㅠㅠ',
  likeCount: 2,
  likes: [],
  commentCreatedAt: new Date(),
  commentUpdatedAt: new Date(),
  commentDeletedAt: null,
};

export const mockCommunityLike: CommunityLike = {
  likeId: 1,
  user: mockUser,
  community: mockCommunity,
  likeCreatedAt: new Date(),
};

export const mockCommentLike: CommentLike = {
  likeId: 1,
  user: mockUser,
  comment: mockCommunityComment,
  likeCreatedAt: new Date(),
};

export const MockCommunityRepository = {
  createCommunity: jest.fn().mockResolvedValue(mockCommunity),
  findAllCommunities: jest.fn().mockResolvedValue({
    communities: [mockCommunity],
    total: 1,
  }),
  findCommunityById: jest.fn().mockResolvedValue(mockCommunity),
  updateCommunity: jest.fn().mockResolvedValue(mockCommunity),
  deleteCommunity: jest.fn().mockResolvedValue(undefined),
  incrementViewCount: jest.fn().mockResolvedValue(undefined),
  createComment: jest.fn().mockResolvedValue(mockCommunityComment),
  findCommentsByCommunityId: jest
    .fn()
    .mockResolvedValue([mockCommunityComment]),
  findCommentById: jest.fn().mockResolvedValue(mockCommunityComment),
  updateComment: jest.fn().mockResolvedValue(mockCommunityComment),
  deleteComment: jest.fn().mockResolvedValue(undefined),
  toggleCommunityLike: jest.fn().mockResolvedValue(true),
  toggleCommentLike: jest.fn().mockResolvedValue(true),
  checkCommunityLike: jest.fn().mockResolvedValue(true),
  checkCommentLike: jest.fn().mockResolvedValue(true),
  // 태그 및 카테고리 관련 메서드
  findOrCreateTag: jest.fn().mockResolvedValue(mockTag),
  attachTagsToCommunity: jest.fn().mockResolvedValue(undefined),
  updateCommunityTags: jest.fn().mockResolvedValue(undefined),
  getPopularTags: jest.fn().mockResolvedValue([mockTag, mockTag2]),
  searchTags: jest.fn().mockResolvedValue([mockTag]),
  findCommunitiesByCategory: jest.fn().mockResolvedValue({
    communities: [mockCommunity],
    total: 1,
  }),
  findCommunitiesByTags: jest.fn().mockResolvedValue({
    communities: [mockCommunity],
    total: 1,
  }),
  getCategoryStats: jest.fn().mockResolvedValue([
    { category: CategoryType.RECORD, count: 10 },
    { category: CategoryType.QUESTION, count: 5 },
  ]),
};
