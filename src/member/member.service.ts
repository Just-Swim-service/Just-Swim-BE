import { Injectable, NotFoundException } from '@nestjs/common';
import { MemberRepository } from './member.repository';
import { Member } from './entity/member.entity';

@Injectable()
export class MemberService {
  constructor(private readonly memberRepository: MemberRepository) {}

  /* QR코드를 통한 회원 등록 */
  async insertMemberFromQR(userId: number, lectureId: number): Promise<Member> {
    return await this.memberRepository.insertMemberFromQR(userId, lectureId);
  }

  /* 강의에 해당하는 수강생 */
  async getAllMembersByLectureId(lectureId: number): Promise<Member[]> {
    return await this.memberRepository.getAllMembersByLectureId(lectureId);
  }

  /* instructor가 피드백 작성 시 강의를 듣고 있는 member 조회 */
  async getAllMembersByFeedback(userId: number): Promise<Member[]> {
    return await this.memberRepository.getAllMembersByFeedback(userId);
  }

  /* instructor가 강의 상세 조회 때 수강생의 강의에 대한 정보 조회 */
  async getMemberInfo(memberUserId: number, instructorUserId: number) {
    const memberData = await this.memberRepository.getMemberInfo(
      memberUserId,
      instructorUserId,
    );

    if (!memberData || memberData.length === 0) {
      throw new NotFoundException('수강생 정보를 찾을 수 없습니다.');
    }

    // 사용자 정보를 구조화
    const memberInfo = {
      userId: '',
      profileImage: '',
      name: '',
      birth: '',
      email: '',
      phoneNumber: '',
      lectures: [],
      feedback: [],
    };

    // 강의 및 피드백 정보 정리
    memberData.forEach((item: any) => {
      // 사용자 정보 설정
      if (!memberInfo.userId) {
        memberInfo.userId = item.userId;
        memberInfo.profileImage = item.profileImage;
        memberInfo.name = item.name;
        memberInfo.birth = item.birth;
        memberInfo.email = item.email;
        memberInfo.phoneNumber = item.phoneNumber;
      }

      // 강의 정보 처리
      let lecture = memberInfo.lectures.find(
        (l: any) => l.lectureId === item.lectureId,
      );

      if (!lecture) {
        lecture = {
          lectureId: item.lectureId,
          lectureTitle: item.lectureTitle,
          lectureContent: item.lectureContent,
          lectureLocation: item.lectureLocation,
          lectureDays: item.lectureDays,
          lectureTime: item.lectureTime,
        };
        memberInfo.lectures.push(lecture);
      }

      // 피드백 정보 처리
      let feedback = memberInfo.feedback.find(
        (f: any) => f.feedbackId === item.feedbackId,
      );

      if (!feedback) {
        feedback = {
          feedbackId: item.feedbackId,
          feedbackDate: item.feedbackDate,
          feedbackType: item.feedbackType,
          feedbackContent: item.feedbackContent,
          images: [],
        };
        memberInfo.feedback.push(feedback);
      }

      // 이미지 추가
      if (
        item.imagePath &&
        !feedback.images.find((img: any) => img.imagePath === item.imagePath)
      ) {
        feedback.images.push({ imagePath: item.imagePath });
      }
    });

    return memberInfo;
  }
}
