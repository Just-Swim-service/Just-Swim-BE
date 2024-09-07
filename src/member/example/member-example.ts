export const allMembersByFeedback = [
  {
    userId: '2',
    memberId: '1',
    lectureTitle: 'asdf',
    memberNickname: '홍길동',
    profileImage: 'asdf',
  },
  {
    userId: '3',
    memberId: '2',
    lectureTitle: 'asdf',
    memberNickname: '홍길순',
    profileImage: 'asdf',
  },
];

export const memberInfo = {
  userId: '2',
  profileImage:
    'http://k.kakaocdn.net/dn/d3UHmi/btsH8xClKxG/jGQI0gBeKrlOkneK7KYIbK/img_640x640.jpg',
  name: '홍길동',
  birth: '1995.01.02',
  email:
    'http://k.kakaocdn.net/dn/d3UHmi/btsH8xClKxG/jGQI0gBeKrlOkneK7KYIbK/img_640x640.jpg',
  phoneNumber:
    'http://k.kakaocdn.net/dn/d3UHmi/btsH8xClKxG/jGQI0gBeKrlOkneK7KYIbK/img_640x640.jpg',
  lectures: [
    {
      lectureId: '33',
      lectureTitle: '수업 수정 테스트 중',
      lectureContent: '이 강의는 고급자를 대상으로 합니다. 페이지 이동 확인',
      lectureLocation: '강동구 실내 수영장',
      lectureDays: '화목',
      lectureTime: '13:00~14:00',
    },
    {
      lectureId: '75',
      lectureTitle: '수강생 테스트',
      lectureContent: '이 강의는 고급자를 대상으로 합니다. 응용을 다룹니다.',
      lectureLocation: '강동구 실내 수영장',
      lectureDays: '화목',
      lectureTime: '12:00-14:00',
    },
  ],
  feedback: [
    {
      feedbackId: '14',
      feedbackDate: '2024.04.22',
      feedbackType: 'personal',
      feedbackContent:
        '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
      images: [
        {
          imagePath:
            'https://s3.ap-northeast-2.amazonaws.com/just-swim-bucket/feedback/1/1718800708145-1.png',
        },
        {
          imagePath:
            'https://s3.ap-northeast-2.amazonaws.com/just-swim-bucket/feedback/1/1718800708147-6.png',
        },
      ],
    },
  ],
};
