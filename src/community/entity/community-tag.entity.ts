import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Community } from './community.entity';
import { Tag } from './tag.entity';

@Entity('communityTag')
export class CommunityTag {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  communityTagId: number;

  @ManyToOne(() => Community, (community) => community.communityTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'communityId' })
  community: Community;

  @ManyToOne(() => Tag, (tag) => tag.communityTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tagId' })
  tag: Tag;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
