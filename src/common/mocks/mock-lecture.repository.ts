import { Lecture } from 'src/lecture/entity/lecture.entity';
import { mockUser } from './mock-user.repository';

export const mockLecture: Lecture = {
  lectureId: 1,
  user: mockUser,
  lectureTitle: '아침 5반',
  lectureContent: '이 강의는 고급자를 대상으로 합니다. 응용을 다룹니다.',
  lectureTime: '12:00-14:00',
  lectureDays: '화목',
  lectureLocation: '강동구 실내 수영장',
  lectureColor: '#F1554C',
  lectureQRCode: 'QR 코드',
  lectureEndDate: '2024.05.31',
  lectureCreatedAt: new Date(),
  lectureUpdatedAt: new Date(),
  lectureDeletedAt: null,
  member: [],
  feedbackTarget: [],
};

export const MockLectureRepository = {
  getLectures: jest.fn().mockResolvedValue([mockLecture]),
  getScheduleLecturesByInstructor: jest.fn().mockResolvedValue([mockLecture]),
  getAllLecturesByInstructor: jest.fn().mockResolvedValue([mockLecture]),
  getScheduleLecturesByCustomer: jest.fn().mockResolvedValue([mockLecture]),
  getAllLecturesByCustomer: jest.fn().mockResolvedValue([mockLecture]),
  getLectureByPk: jest.fn().mockResolvedValue([mockLecture]),
  getLectureForAuth: jest.fn().mockResolvedValue(mockLecture.user),
  updateLecture: jest.fn().mockResolvedValue(mockLecture),
  softDeleteLecture: jest.fn().mockResolvedValue(mockLecture),
  createLecture: jest.fn().mockResolvedValue(mockLecture),
  saveQRCode: jest.fn(),
};
