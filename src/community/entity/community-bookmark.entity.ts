import { Users } from 'src/users/entity/users.entity';
import { Community } from './community.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('communityBookmark')
export class CommunityBookmark {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  bookmarkId: number;

  @ManyToOne(() => Users, (user) => user.communityBookmarks)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ManyToOne(() => Community, (community) => community.bookmarks)
  @JoinColumn({ name: 'communityId' })
  community: Community;

  @CreateDateColumn({ type: 'timestamp' })
  bookmarkCreatedAt: Date;
}
