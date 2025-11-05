import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, IsNull } from 'typeorm';
import { UserBadge } from './entity/user-badge.entity';
import { UserLevel } from './entity/user-level.entity';
import { Member } from 'src/member/entity/member.entity';
import { FeedbackTarget } from 'src/feedback/entity/feedback-target.entity';
import { Community } from 'src/community/entity/community.entity';
import { CommunityComment } from 'src/community/entity/community-comment.entity';
import { Feedback } from 'src/feedback/entity/feedback.entity';
import { Lecture } from 'src/lecture/entity/lecture.entity';
import { Users } from 'src/users/entity/users.entity';

@Injectable()
export class StatisticsRepository {
  constructor(
    @InjectRepository(UserBadge)
    private readonly userBadgeRepository: Repository<UserBadge>,
    @InjectRepository(UserLevel)
    private readonly userLevelRepository: Repository<UserLevel>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(FeedbackTarget)
    private readonly feedbackTargetRepository: Repository<FeedbackTarget>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(CommunityComment)
    private readonly commentRepository: Repository<CommunityComment>,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  // 사용자 레벨 조회 또는 생성
  async findOrCreateUserLevel(userId: number): Promise<UserLevel> {
    let userLevel = await this.userLevelRepository.findOne({
      where: { user: { userId } },
      relations: ['user'],
    });

    if (!userLevel) {
      const user = await this.usersRepository.findOne({
        where: { userId },
      });
      userLevel = this.userLevelRepository.create({
        user,
        level: 1,
        experience: 0,
        currentStreak: 0,
        longestStreak: 0,
      });
      await this.userLevelRepository.save(userLevel);
    }

    return userLevel;
  }

  // 사용자 레벨 업데이트
  async updateUserLevel(userLevel: UserLevel): Promise<UserLevel> {
    return await this.userLevelRepository.save(userLevel);
  }

  // 사용자 배지 조회
  async findUserBadges(userId: number): Promise<UserBadge[]> {
    return await this.userBadgeRepository.find({
      where: { user: { userId } },
      order: { earnedAt: 'DESC' },
    });
  }

  // 배지 추가
  async addBadge(
    userId: number,
    badgeType: string,
    description: string,
  ): Promise<UserBadge> {
    const user = await this.usersRepository.findOne({ where: { userId } });
    const badge = this.userBadgeRepository.create({
      user,
      badgeType: badgeType as any,
      badgeDescription: description,
    });
    return await this.userBadgeRepository.save(badge);
  }

  // 배지 존재 여부 확인
  async hasBadge(userId: number, badgeType: string): Promise<boolean> {
    const count = await this.userBadgeRepository.count({
      where: {
        user: { userId },
        badgeType: badgeType as any,
      },
    });
    return count > 0;
  }

  // 수강생 피드백 통계
  async getStudentFeedbackStats(userId: number, startDate?: Date) {
    const query = this.feedbackTargetRepository
      .createQueryBuilder('ft')
      .leftJoinAndSelect('ft.feedback', 'feedback')
      .where('ft.userId = :userId', { userId });

    if (startDate) {
      query.andWhere('ft.feedbackTargetCreatedAt >= :startDate', { startDate });
    }

    return await query.getMany();
  }

  // 수강생 강의 정보
  async getStudentLectures(userId: number) {
    return await this.memberRepository.find({
      where: { user: { userId }, memberDeletedAt: IsNull() },
      relations: ['lecture', 'lecture.user'],
      order: { memberCreatedAt: 'ASC' },
    });
  }

  // 수강생 커뮤니티 통계
  async getStudentCommunityStats(userId: number) {
    const posts = await this.communityRepository.find({
      where: { user: { userId } },
      relations: ['likes', 'bookmarks'],
    });

    const comments = await this.commentRepository.find({
      where: { user: { userId } },
    });

    return { posts, comments };
  }

  // 강사 강의 통계
  async getInstructorLectures(userId: number) {
    return await this.lectureRepository.find({
      where: { user: { userId } },
      relations: ['member', 'member.user'],
      order: { lectureCreatedAt: 'DESC' },
    });
  }

  // 강사 피드백 통계
  async getInstructorFeedbackStats(userId: number, startDate?: Date) {
    const query = this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.feedbackTarget', 'feedbackTarget')
      .where('feedback.userId = :userId', { userId });

    if (startDate) {
      query.andWhere('feedback.feedbackCreatedAt >= :startDate', { startDate });
    }

    return await query.getMany();
  }

  // 강사 커뮤니티 통계
  async getInstructorCommunityStats(userId: number) {
    return await this.communityRepository.find({
      where: { user: { userId } },
      relations: ['likes', 'comments'],
      order: { likeCount: 'DESC' },
    });
  }

  // 랭킹 - 활동적인 수강생
  async getActiveStudentsRanking(limit: number = 50, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 피드백, 커뮤니티 활동 기반 랭킹
    const query = `
      SELECT 
        u.userId,
        u.name,
        u.profileImage,
        COALESCE(c.customerNickname, '') as nickname,
        COALESCE(ul.level, 1) as level,
        (
          COALESCE(feedback_count, 0) * 10 +
          COALESCE(post_count, 0) * 5 +
          COALESCE(comment_count, 0) * 2 +
          COALESCE(like_count, 0) * 1
        ) as score,
        COALESCE(feedback_count, 0) as feedbackCount,
        COALESCE(post_count, 0) as postCount,
        COALESCE(comment_count, 0) as commentCount,
        COALESCE(like_count, 0) as likeCount
      FROM users u
      LEFT JOIN customer c ON u.userId = c.userId
      LEFT JOIN userLevel ul ON u.userId = ul.userId
      LEFT JOIN (
        SELECT ft.userId, COUNT(*) as feedback_count
        FROM feedbackTarget ft
        WHERE ft.feedbackTargetCreatedAt >= ?
        GROUP BY ft.userId
      ) fb ON u.userId = fb.userId
      LEFT JOIN (
        SELECT userId, COUNT(*) as post_count, SUM(likeCount) as like_count
        FROM community
        WHERE communityCreatedAt >= ?
        GROUP BY userId
      ) p ON u.userId = p.userId
      LEFT JOIN (
        SELECT userId, COUNT(*) as comment_count
        FROM communityComment
        WHERE commentCreatedAt >= ?
        GROUP BY userId
      ) cm ON u.userId = cm.userId
      WHERE u.userType = 'customer'
      ORDER BY score DESC
      LIMIT ?
    `;

    return await this.usersRepository.query(query, [
      startDate,
      startDate,
      startDate,
      limit,
    ]);
  }

  // 랭킹 - 인기 강사
  async getPopularInstructorsRanking(limit: number = 50, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query = `
      SELECT 
        u.userId,
        u.name,
        u.profileImage,
        COALESCE(i.introduction, '') as nickname,
        COALESCE(ul.level, 1) as level,
        (
          COALESCE(student_count, 0) * 15 +
          COALESCE(feedback_count, 0) * 5 +
          COALESCE(post_count, 0) * 3 +
          COALESCE(like_count, 0) * 1
        ) as score,
        COALESCE(student_count, 0) as studentCount,
        COALESCE(feedback_count, 0) as feedbackCount,
        COALESCE(post_count, 0) as postCount,
        COALESCE(like_count, 0) as likeCount
      FROM users u
      LEFT JOIN instructor i ON u.userId = i.userId
      LEFT JOIN userLevel ul ON u.userId = ul.userId
      LEFT JOIN (
        SELECT l.userId, COUNT(DISTINCT m.userId) as student_count
        FROM lecture l
        LEFT JOIN member m ON l.lectureId = m.lectureId AND m.memberDeletedAt IS NULL
        GROUP BY l.userId
      ) st ON u.userId = st.userId
      LEFT JOIN (
        SELECT userId, COUNT(*) as feedback_count
        FROM feedback
        WHERE feedbackCreatedAt >= ?
        GROUP BY userId
      ) fb ON u.userId = fb.userId
      LEFT JOIN (
        SELECT userId, COUNT(*) as post_count, SUM(likeCount) as like_count
        FROM community
        WHERE communityCreatedAt >= ?
        GROUP BY userId
      ) p ON u.userId = p.userId
      WHERE u.userType = 'instructor'
      ORDER BY score DESC
      LIMIT ?
    `;

    return await this.usersRepository.query(query, [
      startDate,
      startDate,
      limit,
    ]);
  }
}

