import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CommunityTag } from './community-tag.entity';

@Entity('tag')
export class Tag {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  tagId: number;

  @Column({ type: 'varchar', unique: true })
  tagName: string; // 예: "자유형", "평영", "초보"

  @Column({ type: 'bigint', default: 0 })
  usageCount: number; // 태그가 사용된 횟수 (인기 태그 추출용)

  @OneToMany(() => CommunityTag, (communityTag) => communityTag.tag)
  communityTags: CommunityTag[];

  @CreateDateColumn({ type: 'timestamp' })
  tagCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  tagUpdatedAt: Date;
}
