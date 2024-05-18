export const lecturesByInstructor = {
  value: [
    {
      lectureId: '1',
      lectureTitle: '아침 5반',
      lectureContent: '초보반으로 발차기 및 자유형 위주로 수업합니다.',
      lectureTime: '11:00 ~ 12:00',
      lectureDays: '화목',
      lectureLocation: '강동구 실내 수영장',
      lectureColor: '#F1554C',
      lectureQRCode: 'QR 코드',
      lectureEndDate: '2024.10.31',
      lectureMembers: [
        {
          memberUserId: 2,
          memberProfileImage: 'image1',
        },
        {
          memberUserId: 3,
          memberProfileImage: 'image2',
        },
      ],
    },
    {
      lectureId: '30',
      lectureTitle: '생존 수영반',
      lectureContent: '생존 수영 위주로 수업합니다.',
      lectureTime: '09:00 ~ 10:00',
      lectureDays: '월수금',
      lectureLocation: '고양체육관',
      lectureColor: '#F1547C',
      lectureQRCode: 'QR 코드',
      lectureEndDate: '2024.10.31',
      lectureMembers: [
        {
          memberUserId: 2,
          memberProfileImage: 'image1',
        },
        {
          memberUserId: 3,
          memberProfileImage: 'image2',
        },
      ],
    },
  ],
};

export const lecturesByCustomer = {
  value: [
    {
      lectureId: '1',
      lectureTitle: '아침 5반',
      lectureContent: '초보반으로 발차기 및 자유형 위주로 수업합니다.',
      lectureTime: '11:00 ~ 12:00',
      lectureDays: '화목',
      lectureLocation: '강동구 실내 수영장',
      lectureColor: '#F1554C',
      lectureQRCode: 'QR 코드',
      lectureEndDate: '2024.10.31',
      instructorName: '홍길순',
      instructorProfileImage: 'image1',
    },
    {
      lectureId: '30',
      lectureTitle: '생존 수영반',
      lectureContent: '생존 수영 위주로 수업합니다.',
      lectureTime: '09:00 ~ 10:00',
      lectureDays: '월수금',
      lectureLocation: '고양체육관',
      lectureColor: '#F1547C',
      lectureQRCode: 'QR 코드',
      lectureEndDate: '2024.10.31',
      instructorName: '홍길동',
      instructorProfileImage: 'image3',
    },
  ],
};

export const lectureDetailByInstructor = {
  value: {
    lecture: {
      lectureTitle: '아침 5반',
      lectureContent: '초보반으로 발차기 및 자유형 위주로 수업합니다.',
      lectureTime: '11:00 ~ 12:00',
      lectureDays: '화목',
      lectureLocation: '강동구 실내 수영장',
      lectureColor: '#F1554C',
      lectureQRCode: 'QR 코드',
      lectureEndDate: '2024.10.31',
    },
    lectureMembers: [
      {
        memberId: '1',
        userId: '3',
        nickName: '홍길동',
        profileImage: 'image1',
      },
      {
        memberId: '2',
        userId: '4',
        nickName: '홍길순',
        profileImage: 'image2',
      },
    ],
  },
};

export const lectureDetailByCustomer = {
  value: {
    lectureTitle: '아침 5반',
    lectureContent: '초보반으로 발차기 및 자유형 위주로 수업합니다.',
    lectureTime: '11:00 ~ 12:00',
    lectureDays: '화목',
    lectureLocation: '강동구 실내 수영장',
    lectureColor: '#F1554C',
    lectureQRCode: 'QR 코드',
    lectureEndDate: '2024.10.31',
    instructorName: '홍길동',
    instructorProfileImage: 'image1',
  },
};
