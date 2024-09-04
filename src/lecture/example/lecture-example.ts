export const getScheuldeLecturesByInstructor = {
  value: [
    {
      lectureId: '1',
      lectureTitle: '아침 5반',
      lectureContent: '초보반으로 발차기 및 자유형 위주로 수업합니다.',
      lectureTime: '11:00 ~ 12:00',
      lectureDays: '화목',
      lectureLocation: '강동구 실내 수영장',
      lectureColor: '#F1554C',
      lectureQRCode:
        'https://just-swim-bucket.s3.ap-northeast-2.amazonaws.com/qrcodes/1.png',
      lectureEndDate: '2024.10.31',
      members: [
        {
          memberUserId: '12',
          memberProfileImage:
            'https://ssl.pstatic.net/static/pwe/address/img_profile.png',
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
      members: [],
    },
  ],
};

export const getScheduleLecturesByCustomer = {
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
      instructor: {
        instructorName: '홍길순',
        instructorProfileImage: 'image1',
      },
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
      instructor: {
        instructorName: '홍길동',
        instructorProfileImage: 'image3',
      },
    },
  ],
};

export const lectureDetailByInstructor = {
  value: [
    {
      lectureTitle: '아침 5반',
      lectureContent: '초보반으로 발차기 및 자유형 위주로 수업합니다.',
      lectureTime: '11:00 ~ 12:00',
      lectureDays: '화목',
      lectureLocation: '강동구 실내 수영장',
      lectureColor: '#F1554C',
      lectureQRCode: 'QR 코드',
      lectureEndDate: '2024.10.31',
      instructor: {
        instructorName: '홍길동',
        instructorProfileImage: 'image1',
      },
      members: [
        {
          userId: '3',
          profileImage:
            'http://t1.kakaocdn.net/account_images/default_profile.jpeg.twg.thumb.R640x640',
        },
      ],
    },
    {
      lectureTitle: '오후 3반',
      lectureContent: '존잼수업!',
      lectureTime: '11:00 ~ 12:00',
      lectureDays: '수',
      lectureLocation: '고백구 행복동 수영장',
      lectureColor: '#F1554C',
      lectureQRCode: 'QR 코드',
      lectureEndDate: '2024.10.31',
      instructor: {
        instructorName: '홍길동',
        instructorProfileImage:
          'http://k.kakaocdn.net/dn/d3UHmi/btsH8xClKxG/jGQI0gBeKrlOkneK7KYIbK/img_640x640.jpg',
      },
      members: [
        {
          userId: '16',
          profileImage:
            'http://k.kakaocdn.net/dn/hBxV7/btsH4B4E3MC/dgeYEzOWL4RO3kNvJPq8OK/img_640x640.jpg',
        },
      ],
    },
  ],
};

export const lectureDetailByCustomer = {
  value: [
    {
      lectureTitle: '아침 5반',
      lectureContent: '초보반으로 발차기 및 자유형 위주로 수업합니다.',
      lectureTime: '11:00 ~ 12:00',
      lectureDays: '화목',
      lectureLocation: '강동구 실내 수영장',
      lectureColor: '#F1554C',
      lectureQRCode: 'QR 코드',
      lectureEndDate: '2024.10.31',
      instructor: {
        instructorName: '홍길동',
        instructorProfileImage: 'image1',
      },
      members: [],
    },
  ],
};

export const lectureMemberList = {
  value: [
    {
      memberId: '1',
      userId: '1',
      memberNickname: '홍길동',
      profileImage: 'URL',
    },
    {
      memberId: '2',
      userId: '10',
      memberNickname: '홍길순',
      profileImage: 'URL',
    },
  ],
};
