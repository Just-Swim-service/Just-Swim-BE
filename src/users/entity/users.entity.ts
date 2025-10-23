import { Customer } from 'src/customer/entity/customer.entity';
import { Feedback } from 'src/feedback/entity/feedback.entity';
import { FeedbackTarget } from 'src/feedback/entity/feedback-target.entity';
import { Instructor } from 'src/instructor/entity/instructor.entity';
import { Lecture } from 'src/lecture/entity/lecture.entity';
import { Member } from 'src/member/entity/member.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../enum/user-type.enum';
import { WithdrawalReason } from 'src/withdrawal-reason/entity/withdrawal-reason.entity';
import { Notification } from 'src/notification/entity/notification.entity';
import { Community } from 'src/community/entity/community.entity';
import { CommunityComment } from 'src/community/entity/community-comment.entity';
import { CommunityLike } from 'src/community/entity/community-like.entity';
import { CommunityBookmark } from 'src/community/entity/community-bookmark.entity';
import { CommentLike } from 'src/community/entity/comment-like.entity';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  userId: number;

  @Column({ type: 'enum', enum: UserType, nullable: true })
  userType: UserType;

  @Column({ type: 'varchar', nullable: true })
  provider: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  profileImage: string;

  @Column({ type: 'varchar', nullable: true })
  birth: string;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string;

  @CreateDateColumn({ type: 'timestamp' })
  userCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  userUpdatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  userDeletedAt: Date;

  @OneToMany(() => Customer, (customer) => customer.user)
  customer: Customer[];

  @OneToMany(() => Instructor, (instructor) => instructor.user)
  instructor: Instructor[];

  @OneToMany(() => Member, (member) => member.user)
  member: Member[];

  @OneToMany(() => Lecture, (lecture) => lecture.user)
  lecture: Lecture[];

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedback: Feedback[];

  @OneToMany(() => FeedbackTarget, (feedbackTarget) => feedbackTarget.user)
  feedbackTarget: FeedbackTarget[];

  @OneToMany(
    () => WithdrawalReason,
    (withdrawalReason) => withdrawalReason.user,
  )
  withdrawalReason: WithdrawalReason[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notification: Notification[];

  @OneToMany(() => Community, (community) => community.user)
  communities: Community[];

  @OneToMany(() => CommunityComment, (comment) => comment.user)
  communityComments: CommunityComment[];

  @OneToMany(() => CommunityLike, (like) => like.user)
  communityLikes: CommunityLike[];

  @OneToMany(() => CommunityBookmark, (bookmark) => bookmark.user)
  communityBookmarks: CommunityBookmark[];

  @OneToMany(() => CommentLike, (like) => like.user)
  commentLikes: CommentLike[];
}
