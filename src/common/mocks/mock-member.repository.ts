import { Member } from 'src/member/entity/member.entity';
import { mockUser } from './mock-user.repository';
import { mockLecture } from './mock-lecture.repository';

export const mockMember: Member = {
  memberId: 1,
  user: mockUser,
  lecture: mockLecture,
  memberNickname: '홍길동',
  memberCreatedAt: new Date(),
  memberUpdatedAt: new Date(),
  memberDeletedAt: null,
};

export const mockMemberInfoRaw = [
  {
    userId: 1,
    profileImage: 'image.jpg',
    name: '홍길동',
    birth: '1990-01-01',
    email: 'hong@example.com',
    phoneNumber: '010-1234-5678',
    lectureId: 10,
    lectureTitle: '강의 제목',
    lectureContent: '강의 내용',
    lectureLocation: '강의실 101',
    lectureColor: '#FF0000',
    lectureDays: ['월', '수'],
    lectureTime: '10:00~12:00',
    feedbackId: 100,
    feedbackDate: '2024-01-01',
    feedbackType: '긍정적',
    feedbackContent: '좋았어요!',
    imagePath: 'img1.jpg',
  },
  {
    userId: 1,
    profileImage: 'image.jpg',
    name: '홍길동',
    birth: '1990-01-01',
    email: 'hong@example.com',
    phoneNumber: '010-1234-5678',
    lectureId: 10,
    lectureTitle: '강의 제목',
    lectureContent: '강의 내용',
    lectureLocation: '강의실 101',
    lectureColor: '#FF0000',
    lectureDays: ['월', '수'],
    lectureTime: '10:00~12:00',
    feedbackId: 100,
    feedbackDate: '2024-01-01',
    feedbackType: '긍정적',
    feedbackContent: '좋았어요!',
    imagePath: 'img2.jpg',
  },
];

export const MockMemberRepository = {
  insertMemberFromQR: jest.fn().mockResolvedValue(mockMember),
  getAllMembersByLectureId: jest.fn().mockResolvedValue([mockMember]),
  getAllMembersByFeedback: jest.fn().mockResolvedValue([mockMember]),
  getMemberInfo: jest.fn().mockResolvedValue(mockMemberInfoRaw),
  checkMemberExists: jest.fn().mockResolvedValue(true),
};
