import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CommunityRepository } from './community.repository';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AwsService } from 'src/common/aws/aws.service';
import { ImageService } from 'src/image/image.service';
import slugify from 'slugify';
import { CommunityImageDto } from './dto/community-image.dto';
import { CommunityPresignedUrlDto } from './dto/community-presigned-url.dto';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityRepository: CommunityRepository,
    private readonly awsService: AwsService,
    private readonly imageService: ImageService,
  ) {}

  // 게시글 파일 업로드를 위한 presignedUrl 생성 (이미지 + 동영상)
  async generateCommunityPresignedUrls(
    userId: number,
    communityImageDto: CommunityImageDto,
  ): Promise<CommunityPresignedUrlDto[]> {
    const presignedUrls = await Promise.all(
      communityImageDto.files.map(async (file) => {
        const ext = file.split('.').pop(); // 확장자 추출
        const originalNameWithoutExt = file.split('.').slice(0, -1).join('.'); // 확장자를 제외한 이름
        const slugifiedName = slugify(originalNameWithoutExt, {
          lower: true,
          strict: true,
        });
        const fileName = `community/${userId}/${Date.now().toString()}-${slugifiedName}.${ext}`;

        // 파일 타입 확인
        const fileType: 'image' | 'video' = [
          'mp4',
          'webm',
          'ogg',
          'mov',
          'avi',
        ].includes(ext)
          ? 'video'
          : 'image';

        // presignedUrl 생성
        const { presignedUrl, contentType } =
          await this.awsService.getPresignedUrl(fileName, ext);

        return {
          presignedUrl,
          fileName,
          fileType,
          contentType,
        };
      }),
    );

    return presignedUrls;
  }

  // 게시글 관련 메서드
  async createCommunity(
    userId: number,
    createCommunityDto: CreateCommunityDto,
  ) {
    const { tags, communityImages, ...communityData } = createCommunityDto;

    // 게시글 생성
    const community = await this.communityRepository.createCommunity(
      userId,
      communityData,
    );

    // 태그가 있으면 연결
    if (tags && tags.length > 0) {
      await this.communityRepository.attachTagsToCommunity(
        community.communityId,
        tags,
      );
    }

    // 이미지/동영상이 있으면 저장
    if (communityImages && communityImages.length > 0) {
      await Promise.all(
        communityImages.map((image) =>
          this.imageService.createCommunityFile(
            community.communityId,
            image.filePath,
            image.fileType,
            image.fileName,
            image.fileSize,
            image.duration,
            image.thumbnailPath,
          ),
        ),
      );
    }

    return community;
  }

  async findAllCommunities(page: number = 1, limit: number = 10) {
    const { communities, total } =
      await this.communityRepository.findAllCommunities(page, limit);

    // 기존 데이터에 포함된 모든 HTML 태그 제거
    const cleanedCommunities = this.removeHtmlTags(communities);

    return {
      communities: cleanedCommunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findCommunityById(communityId: number, userId?: number) {
    const community =
      await this.communityRepository.findCommunityById(communityId);

    if (!community) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 조회수 증가
    await this.communityRepository.incrementViewCount(communityId);

    // 좋아요 여부 확인 (로그인한 사용자인 경우)
    let isLiked = false;
    let isBookmarked = false;
    if (userId) {
      isLiked = await this.communityRepository.checkCommunityLike(
        userId,
        communityId,
      );
      isBookmarked = await this.communityRepository.checkBookmark(
        userId,
        communityId,
      );
    }

    // 댓글 가져오기
    const comments =
      await this.communityRepository.findCommentsByCommunityId(communityId);

    return {
      ...community,
      isLiked,
      isBookmarked,
      comments,
    };
  }

  async updateCommunity(
    communityId: number,
    userId: number,
    updateCommunityDto: UpdateCommunityDto,
  ) {
    const community =
      await this.communityRepository.findCommunityById(communityId);

    if (!community) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (community.user.userId !== userId) {
      throw new ForbiddenException('게시글을 수정할 권한이 없습니다.');
    }

    const { tags, communityImages, ...updateData } = updateCommunityDto;

    // 게시글 업데이트
    const updatedCommunity = await this.communityRepository.updateCommunity(
      communityId,
      updateData,
    );

    // 태그가 포함되어 있으면 업데이트
    if (tags !== undefined) {
      await this.communityRepository.updateCommunityTags(communityId, tags);
    }

    // 이미지/동영상이 포함되어 있으면 업데이트
    if (communityImages !== undefined) {
      // 기존 이미지 조회 및 S3에서 삭제
      const existingImages =
        await this.imageService.getFilesByCommunityId(communityId);
      if (existingImages && existingImages.length > 0) {
        await Promise.all(
          existingImages.flatMap((image) => {
            const deleteTasks: Promise<void>[] = [];

            // 이미지/영상 파일 삭제
            if (image.imagePath) {
              const url = new URL(image.imagePath);
              const fileName = url.pathname.split('/').slice(-3).join('/');
              deleteTasks.push(this.awsService.deleteImageFromS3(fileName));
            }

            // 썸네일이 있을 경우 삭제
            if (image.thumbnailPath) {
              const thumbUrl = new URL(image.thumbnailPath);
              const thumbFileName = thumbUrl.pathname
                .split('/')
                .slice(-3)
                .join('/');
              deleteTasks.push(
                this.awsService.deleteImageFromS3(thumbFileName),
              );
            }

            return deleteTasks;
          }),
        );
      }

      // 기존 이미지 레코드 삭제
      await this.imageService.deleteFilesByCommunityId(communityId);

      // 새 이미지/동영상 저장
      if (communityImages.length > 0) {
        await Promise.all(
          communityImages.map((image) =>
            this.imageService.createCommunityFile(
              communityId,
              image.filePath,
              image.fileType,
              image.fileName,
              image.fileSize,
              image.duration,
              image.thumbnailPath,
            ),
          ),
        );
      }
    }

    return updatedCommunity;
  }

  async deleteCommunity(communityId: number, userId: number) {
    const community =
      await this.communityRepository.findCommunityById(communityId);

    if (!community) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (community.user.userId !== userId) {
      throw new ForbiddenException('게시글을 삭제할 권한이 없습니다.');
    }

    // S3에서 이미지/동영상 삭제
    const existingImages =
      await this.imageService.getFilesByCommunityId(communityId);
    if (existingImages && existingImages.length > 0) {
      await Promise.all(
        existingImages.flatMap((image) => {
          const deleteTasks: Promise<void>[] = [];

          // 이미지/영상 파일 삭제
          if (image.imagePath) {
            const url = new URL(image.imagePath);
            const fileName = url.pathname.split('/').slice(-3).join('/');
            deleteTasks.push(this.awsService.deleteImageFromS3(fileName));
          }

          // 썸네일이 있을 경우 삭제
          if (image.thumbnailPath) {
            const thumbUrl = new URL(image.thumbnailPath);
            const thumbFileName = thumbUrl.pathname
              .split('/')
              .slice(-3)
              .join('/');
            deleteTasks.push(this.awsService.deleteImageFromS3(thumbFileName));
          }

          return deleteTasks;
        }),
      );
    }

    await this.communityRepository.deleteCommunity(communityId);
    return { message: '게시글이 삭제되었습니다.' };
  }

  // 댓글 관련 메서드
  async createComment(
    communityId: number,
    userId: number,
    createCommentDto: CreateCommentDto,
  ) {
    // 게시글 존재 확인
    const community =
      await this.communityRepository.findCommunityById(communityId);
    if (!community) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return await this.communityRepository.createComment(
      userId,
      communityId,
      createCommentDto.content,
      createCommentDto.parentCommentId,
    );
  }

  async getComments(communityId: number) {
    const community =
      await this.communityRepository.findCommunityById(communityId);
    if (!community) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return await this.communityRepository.findCommentsByCommunityId(
      communityId,
    );
  }

  async updateComment(commentId: number, userId: number, content: string) {
    const comment = await this.communityRepository.findCommentById(commentId);

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.user.userId !== userId) {
      throw new ForbiddenException('댓글을 수정할 권한이 없습니다.');
    }

    return await this.communityRepository.updateComment(commentId, content);
  }

  async deleteComment(commentId: number, userId: number) {
    const comment = await this.communityRepository.findCommentById(commentId);

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.user.userId !== userId) {
      throw new ForbiddenException('댓글을 삭제할 권한이 없습니다.');
    }

    await this.communityRepository.deleteComment(commentId);
    return { message: '댓글이 삭제되었습니다.' };
  }

  // 좋아요 관련 메서드
  async toggleCommunityLike(communityId: number, userId: number) {
    const community =
      await this.communityRepository.findCommunityById(communityId);
    if (!community) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const isLiked = await this.communityRepository.toggleCommunityLike(
      userId,
      communityId,
    );
    return { isLiked };
  }

  async toggleCommentLike(commentId: number, userId: number) {
    const comment = await this.communityRepository.findCommentById(commentId);

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    const isLiked = await this.communityRepository.toggleCommentLike(
      userId,
      commentId,
    );
    return { isLiked };
  }

  // 태그 및 카테고리 관련 메서드
  async getCommunitiesByCategory(
    category: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const { communities, total } =
      await this.communityRepository.findCommunitiesByCategory(
        category as any,
        page,
        limit,
      );

    // 기존 데이터에 포함된 모든 HTML 태그 제거
    const cleanedCommunities = this.removeHtmlTags(communities);

    return {
      communities: cleanedCommunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCommunitiesByTags(
    tags: string[],
    page: number = 1,
    limit: number = 10,
  ) {
    const { communities, total } =
      await this.communityRepository.findCommunitiesByTags(tags, page, limit);

    // 기존 데이터에 포함된 모든 HTML 태그 제거
    const cleanedCommunities = this.removeHtmlTags(communities);

    return {
      communities: cleanedCommunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPopularTags(limit: number = 20) {
    return await this.communityRepository.getPopularTags(limit);
  }

  async searchTags(query: string, limit: number = 10) {
    return await this.communityRepository.searchTags(query, limit);
  }

  async getCategoryStats() {
    return await this.communityRepository.getCategoryStats();
  }

  // 검색 관련 메서드
  async searchCommunities(
    query: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'recent' | 'popular' | 'relevance' = 'relevance',
  ) {
    const { communities, total } =
      await this.communityRepository.searchCommunities(
        query,
        page,
        limit,
        sortBy,
      );

    // 기존 데이터에 포함된 모든 HTML 태그 제거
    const cleanedCommunities = this.removeHtmlTags(communities);

    return {
      communities: cleanedCommunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      searchQuery: query,
      sortBy,
    };
  }

  async advancedSearchCommunities(
    searchParams: {
      query?: string;
      category?: string;
      tags?: string[];
      startDate?: string;
      endDate?: string;
      minLikes?: number;
      minComments?: number;
      sortBy?:
        | 'recent'
        | 'popular'
        | 'relevance'
        | 'likes'
        | 'comments'
        | 'views';
    },
    page: number = 1,
    limit: number = 10,
  ) {
    const { query, category } = searchParams;

    // 날짜 문자열을 Date 객체로 변환하고 category를 CategoryType으로 변환
    const processedParams = {
      ...searchParams,
      category: category as any, // CategoryType으로 캐스팅
      startDate: searchParams.startDate
        ? new Date(searchParams.startDate)
        : undefined,
      endDate: searchParams.endDate
        ? new Date(searchParams.endDate)
        : undefined,
    };

    const { communities, total } =
      await this.communityRepository.advancedSearchCommunities(
        processedParams,
        page,
        limit,
      );

    // 기존 데이터에 포함된 모든 HTML 태그 제거
    const cleanedCommunities = this.removeHtmlTags(communities);

    return {
      communities: cleanedCommunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      searchParams: processedParams,
    };
  }

  // 관련 태그 추천
  async getRelatedTags(query: string, limit: number = 10) {
    return await this.communityRepository.getRelatedTags(query, limit);
  }

  // 검색어 자동완성
  async getSearchSuggestions(query: string, limit: number = 5) {
    return await this.communityRepository.getSearchSuggestions(query, limit);
  }

  // 기존 데이터에 포함된 모든 HTML 태그 제거하는 유틸리티 메서드
  private removeHtmlTags(communities: any[]) {
    return communities.map((community) => ({
      ...community,
      title: this.stripHtmlTags(community.title),
      content: this.stripHtmlTags(community.content),
      // 태그에도 HTML 태그 제거
      communityTags: community.communityTags?.map((ct: any) => ({
        ...ct,
        tag: {
          ...ct.tag,
          tagName: this.stripHtmlTags(ct.tag.tagName),
        },
      })),
    }));
  }

  // 문자열에서 모든 HTML 태그 제거
  private stripHtmlTags(text: string): string {
    if (!text) return text;
    // 모든 HTML 태그 제거 (<>로 둘러싸인 모든 것)
    return text.replace(/<[^>]*>/g, '');
  }

  // 북마크 관련 메서드
  async toggleBookmark(userId: number, communityId: number) {
    // 게시글 존재 확인
    const community =
      await this.communityRepository.findCommunityById(communityId);
    if (!community) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const isBookmarked = await this.communityRepository.toggleBookmark(
      userId,
      communityId,
    );

    return {
      isBookmarked,
      message: isBookmarked
        ? '북마크에 추가되었습니다.'
        : '북마크가 해제되었습니다.',
    };
  }

  async getUserBookmarks(userId: number, page: number = 1, limit: number = 10) {
    const { communities, total } =
      await this.communityRepository.getUserBookmarks(userId, page, limit);

    // 기존 데이터에 포함된 모든 HTML 태그 제거
    const cleanedCommunities = this.removeHtmlTags(communities);

    return {
      bookmarks: cleanedCommunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
