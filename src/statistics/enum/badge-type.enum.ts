export enum BadgeType {
  // 출석 관련
  FIRST_CLASS = 'first_class', // 첫 수업 등록
  ATTENDANCE_7 = 'attendance_7', // 7일 연속 활동
  ATTENDANCE_30 = 'attendance_30', // 30일 연속 활동
  ATTENDANCE_100 = 'attendance_100', // 100일 연속 활동

  // 피드백 관련
  FIRST_FEEDBACK = 'first_feedback', // 첫 피드백 받기
  FEEDBACK_10 = 'feedback_10', // 피드백 10회 받기
  FEEDBACK_50 = 'feedback_50', // 피드백 50회 받기
  FEEDBACK_100 = 'feedback_100', // 피드백 100회 받기

  // 커뮤니티 관련
  FIRST_POST = 'first_post', // 첫 게시글 작성
  POST_10 = 'post_10', // 게시글 10개 작성
  POST_50 = 'post_50', // 게시글 50개 작성
  COMMENT_100 = 'comment_100', // 댓글 100개 작성
  POPULAR_POST = 'popular_post', // 좋아요 100개 이상 게시글
  HELPFUL_MEMBER = 'helpful_member', // 수영팁 10개 작성

  // 강사 관련
  FIRST_STUDENT = 'first_student', // 첫 수강생
  STUDENTS_10 = 'students_10', // 수강생 10명
  STUDENTS_50 = 'students_50', // 수강생 50명
  FEEDBACK_MASTER = 'feedback_master', // 피드백 100회 제공
  POPULAR_INSTRUCTOR = 'popular_instructor', // 커뮤니티 좋아요 500개 이상

  // 특수 배지
  EARLY_BIRD = 'early_bird', // 서비스 초기 가입자
  VETERAN = 'veteran', // 1년 이상 활동
  LEGEND = 'legend', // 레벨 50 달성
}

