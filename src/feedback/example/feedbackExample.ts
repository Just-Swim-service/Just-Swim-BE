export const feedbacksByInstructor = {
  value: [
    {
      feedbackId: '1',
      feedbackDate: '2024.04.22',
      feedbackType: 'group',
      feedbackContent:
        '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
      lectureTitle: '아침 2반',
      members: [
        {
          memberUserId: '2',
          memberProfileImage:
            'http://k.kakaocdn.net/dn/d3UHmi/btsH8xClKxG/jGQI0gBeKrlOkneK7KYIbK/img_640x640.jpg',
          memberNickname: '홍길동',
        },
      ],
    },
    {
      feedbackId: '2',
      feedbackDate: '2024.04.22',
      feedbackType: 'personal',
      feedbackContent:
        '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
      lectureTitle: '아침 1반',
      members: [
        {
          memberUserId: '2',
          memberProfileImage: 'afaf',
          memberNickname: '이홍길',
        },
      ],
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
      instructor: {
        instructorName: '이순신',
        instructorProfileImage: 'image20',
      },
    },
  ],
};

export const feedbackDetailByInstructor = {
  value: {
    feedback: [
      {
        feedbackId: '18',
        feedbackType: 'group',
        feedbackDate: '2024.04.22',
        feedbackContent:
          '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
        feedbackLink: 'URL',
        instructor: {
          instructorUserId: '1',
          instructorName: '김수영',
          instructorProfileImage: 'profileImage',
        },
        images: [
          {
            imagePath:
              'https://s3.ap-northeast-2.amazonaws.com/just-swim-bucket/feedback/1/1718800708147-6.png',
          },
        ],
      },
    ],
    feedbackTargetList: [
      {
        lectureTitle: 'asdf',
        memberUserId: '2',
        memberNickname: '홍길동',
        memberProfileImage: 'asdf',
      },
      {
        lectureTitle: 'asdf',
        memberUserId: '3',
        memberNickname: '홍길순',
        memberProfileImage: 'asdf',
      },
    ],
  },
};

export const feedbackDetailByCustomer = {
  value: {
    feedbackId: '18',
    feedbackType: 'group',
    feedbackDate: '2024.04.22',
    feedbackContent:
      '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
    feedbackLink: 'URL',
    instructor: {
      instructorUserId: '1',
      instructorName: '김수영',
      instructorProfileImage: 'profileImage',
    },
    images: [
      {
        imagePath:
          'https://s3.ap-northeast-2.amazonaws.com/just-swim-bucket/feedback/1/1718800708147-6.png',
      },
    ],
  },
};
