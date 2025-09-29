import { Users } from 'src/users/entity/users.entity';
import { CommunityComment } from './community-comment.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('commentLike')
export class CommentLike {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  likeId: number;

  @ManyToOne(() => Users, (user) => user.commentLikes)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ManyToOne(() => CommunityComment, (comment) => comment.likes)
  @JoinColumn({ name: 'commentId' })
  comment: CommunityComment;

  @CreateDateColumn({ type: 'timestamp' })
  likeCreatedAt: Date;
}
