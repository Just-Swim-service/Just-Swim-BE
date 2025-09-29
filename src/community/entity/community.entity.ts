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

  @OneToMany(() => Image, (image) => image.community)
  images: Image[];

  @CreateDateColumn({ type: 'timestamp' })
  communityCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  communityUpdatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  communityDeletedAt: Date;
}
