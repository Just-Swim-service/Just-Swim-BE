export const feedbacksByInstructor = {
  value: [
    {
      feedbackId: '1',
      feedbackDate: '2024.04.22',
      feedbackType: 'group',
      feedbackContent:
        '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
      memberUserId: '2',
      memberNickname: '홍길동',
      lectureTitle: '아침 2반',
      memberProfileImage: 'asdf',
    },
    {
      feedbackId: '2',
      feedbackDate: '2024.04.22',
      feedbackType: 'personal',
      feedbackContent:
        '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
      memberUserId: '10',
      memberNickname: '이홍길',
      lectureTitle: '아침 1반',
      memberProfileImage: 'afaf',
    },
  ],
};

export const feedbacksByCustomer = {
  value: [
    {
      feedbackId: '13',
      lectureTitle: '생존 수영반',
      feedbackContent:
        '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
      feedbackDate: '2024.04.22',
      feedbackType: 'personal',
      instructorProfileImage: 'image20',
      instructorName: '이순신',
    },
    {
      feedbackId: '20',
      lectureTitle: '아침 1반',
      feedbackContent:
        '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
      feedbackDate: '2024.05.22',
      feedbackType: 'group',
      instructorProfileImage: 'image20',
      instructorName: '이순신',
    },
  ],
};

export const feedbackDetailByInstructor = {
  value: {
    feedback: [
      {
        userId: '1',
        feedbackId: '18',
        feedbackType: 'group',
        feedbackDate: '2024.04.22',
        feedbackContent:
          '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
        feedbackLink: 'URL',
        instructorName: '김수영',
        instructorProfileImage: 'profileImage',
        imagePath:
          'https://s3.ap-northeast-2.amazonaws.com/just-swim-bucket/feedback/1/1718800708147-6.png',
      },
    ],
    feedbackTargetList: [
      {
        lectureTitle: 'asdf',
        userId: '2',
        nickname: '홍길동',
        profileImage: 'asdf',
      },
      {
        lectureTitle: 'asdf',
        userId: '3',
        nickname: '홍길순',
        profileImage: 'asdf',
      },
    ],
  },
};

export const feedbackDetailByCustomer = {
  value: {
    userId: '1',
    feedbackId: '18',
    feedbackType: 'group',
    feedbackDate: '2024.04.22',
    feedbackContent:
      '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
    feedbackLink: 'URL',
    instructorName: '김수영',
    instructorProfileImage: 'profileImage',
    imagePath:
      'https://s3.ap-northeast-2.amazonaws.com/just-swim-bucket/feedback/1/1718800708147-6.png',
  },
};
