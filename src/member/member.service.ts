import { Injectable, NotFoundException } from '@nestjs/common';
import { MemberRepository } from './member.repository';
import { Member } from './entity/member.entity';
import { LectureMemberDto } from './dto/lecture-member.dto';
import { FeedbackMemberDto } from './dto/feedback-member.dto';
import { MemberInfoDto } from './dto/member-info.dto';
import { LectureInfoDto } from 'src/lecture/dto/lecture-info.dto';
import { FeedbackInfoDto } from 'src/feedback/dto/feedback-info.dto';
import { ImageDto } from 'src/image/dto/image-info.dto';

@Injectable()
export class MemberService {
  constructor(private readonly memberRepository: MemberRepository) {}

  /* QR코드를 통한 회원 등록 */
  async insertMemberFromQR(
    userId: number,
    name: string,
    lectureId: number,
  ): Promise<Member> {
    const result = await this.memberRepository.insertMemberFromQR(
      userId,
      name,
      lectureId,
    );
    if (!result) {
      throw new NotFoundException('회원 등록에 실패했습니다.');
    }
    return result;
  }

  /* 강의에 해당하는 수강생 */
  async getAllMembersByLectureId(
    lectureId: number,
  ): Promise<LectureMemberDto[]> {
    return await this.memberRepository.getAllMembersByLectureId(lectureId);
  }

  /* instructor가 피드백 작성 시 강의를 듣고 있는 member 조회 */
  async getAllMembersByFeedback(userId: number): Promise<FeedbackMemberDto[]> {
    return await this.memberRepository.getAllMembersByFeedback(userId);
  }

  /* instructor가 강의 상세 조회 때 수강생의 강의에 대한 정보 조회 */
  async getMemberInfo(
    memberUserId: number,
    instructorUserId: number,
  ): Promise<MemberInfoDto> {
    const memberData = await this.memberRepository.getMemberInfo(
      memberUserId,
      instructorUserId,
    );

    if (!memberData || memberData.length === 0) {
      throw new NotFoundException('수강생 정보를 찾을 수 없습니다.');
    }

    const memberInfo: MemberInfoDto = {
      userId: 0,
      profileImage: '',
      name: '',
      birth: '',
      email: '',
      phoneNumber: '',
      lectures: [],
      feedback: [],
    };

    const lecturesMap = new Map<number, LectureInfoDto>();
    const feedbackMap = new Map<number, FeedbackInfoDto>();

    memberData.forEach((item: any) => {
      // 사용자 정보는 한 번만 설정
      if (!memberInfo.userId) {
        Object.assign(memberInfo, {
          userId: item.userId,
          profileImage: item.profileImage,
          name: item.name,
          birth: item.birth,
          email: item.email,
          phoneNumber: item.phoneNumber,
        });
      }

      // 강의 정보 처리 (중복 방지)
      if (item.lectureId && !lecturesMap.has(item.lectureId)) {
        lecturesMap.set(item.lectureId, {
          lectureId: item.lectureId,
          lectureTitle: item.lectureTitle,
          lectureContent: item.lectureContent,
          lectureLocation: item.lectureLocation,
          lectureColor: item.lectureColor,
          lectureDays: item.lectureDays,
          lectureTime: item.lectureTime,
          lectureQRCode: item.lectureQRCode,
          lectureEndDate: item.lectureEndDate,
        });
      }

      // 피드백 정보 처리 (중복 방지)
      if (item.feedbackId && !feedbackMap.has(item.feedbackId)) {
        feedbackMap.set(item.feedbackId, {
          feedbackId: item.feedbackId,
          feedbackDate: item.feedbackDate,
          feedbackType: item.feedbackType,
          feedbackContent: item.feedbackContent,
          feedbackLink: item.feedbackLink,
          images: [],
        });
      }

      // 이미지 정보 처리 (중복 방지)
      if (
        item.imagePath &&
        item.feedbackId &&
        feedbackMap.has(item.feedbackId)
      ) {
        const feedback = feedbackMap.get(item.feedbackId)!;
        const exists = feedback.images.some(
          (img: ImageDto) => img.imagePath === item.imagePath,
        );
        if (!exists) {
          feedback.images.push({ imagePath: item.imagePath });
        }
      }
    });

    // Map을 배열로 변환하여 설정
    memberInfo.lectures = Array.from(lecturesMap.values());
    memberInfo.feedback = Array.from(feedbackMap.values());

    return memberInfo;
  }


}
