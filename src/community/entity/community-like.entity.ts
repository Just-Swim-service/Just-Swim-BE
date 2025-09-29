import { Users } from 'src/users/entity/users.entity';
import { Community } from './community.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('communityLike')
export class CommunityLike {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  likeId: number;

  @ManyToOne(() => Users, (user) => user.communityLikes)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ManyToOne(() => Community, (community) => community.likes)
  @JoinColumn({ name: 'communityId' })
  community: Community;

  @CreateDateColumn({ type: 'timestamp' })
  likeCreatedAt: Date;
}
