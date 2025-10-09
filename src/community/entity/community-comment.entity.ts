import { Users } from 'src/users/entity/users.entity';
import { Community } from './community.entity';
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
import { CommentLike } from './comment-like.entity';

@Entity('communityComment')
export class CommunityComment {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  commentId: number;

  @ManyToOne(() => Users, (user) => user.communityComments)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ManyToOne(() => Community, (community) => community.comments)
  @JoinColumn({ name: 'communityId' })
  community: Community;

  @ManyToOne(() => CommunityComment, (comment) => comment.replies, {
    nullable: true,
  })
  @JoinColumn({ name: 'parentCommentId' })
  parentComment?: CommunityComment; // 대댓글을 위한 부모 댓글

  @OneToMany(() => CommunityComment, (comment) => comment.parentComment)
  replies: CommunityComment[]; // 대댓글들

  @Column({ type: 'mediumtext' })
  content: string;

  @Column({ type: 'bigint', default: 0 })
  likeCount: number;

  @OneToMany(() => CommentLike, (like) => like.comment)
  likes: CommentLike[];

  @CreateDateColumn({ type: 'timestamp' })
  commentCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  commentUpdatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  commentDeletedAt: Date;
}
