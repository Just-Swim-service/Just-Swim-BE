import { Users } from 'src/users/entity/users.entity';
import { Image } from 'src/image/entity/image.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { CommunityComment } from './community-comment.entity';
import { CommunityLike } from './community-like.entity';
import { CommunityBookmark } from './community-bookmark.entity';
import { CommunityTag } from './community-tag.entity';
import { CategoryType } from '../enum/category-type.enum';

@Entity('community')
export class Community {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  communityId: number;

  @ManyToOne(() => Users, (user) => user.communities)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'mediumtext' })
  content: string;

  @Column({ type: 'enum', enum: CategoryType, default: CategoryType.STORY })
  category: CategoryType; // 카테고리 (질문, 운동기록, 수영팁, 후기, 수영일상)

  @Column({ type: 'json', nullable: true })
  workoutData: any; // 운동 관련 데이터 (날짜, 시간, 종목 등)

  @Column({ type: 'bigint', default: 0 })
  viewCount: number;

  @Column({ type: 'bigint', default: 0 })
  likeCount: number;

  @Column({ type: 'bigint', default: 0 })
  commentCount: number;

  @OneToMany(() => CommunityComment, (comment) => comment.community)
  comments: CommunityComment[];

  @OneToMany(() => CommunityLike, (like) => like.community)
  likes: CommunityLike[];

  @OneToMany(() => CommunityBookmark, (bookmark) => bookmark.community)
  bookmarks: CommunityBookmark[];

  @OneToMany(() => Image, (image) => image.community)
  images: Image[];

  @OneToMany(() => CommunityTag, (communityTag) => communityTag.community)
  communityTags: CommunityTag[];

  @CreateDateColumn({ type: 'timestamp' })
  communityCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  communityUpdatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  communityDeletedAt: Date;
}
