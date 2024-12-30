# Just-Swim-Service (Backend)

# 목차

1. [프로젝트 소개](#loudspeaker-프로젝트-소개)
2. [개발 인원](#office-개발-인원)
3. [기술 스택](#wrench-기술-스택)
4. [라이브러리](#books-라이브러리)
5. [아키텍처](#pushpin-아키텍처)
6. [ERD](#bank-erd)

---

## :loudspeaker: 프로젝트 소개

- 수영 회원 VIP 관리 서비스

### 1. 프로젝트 목표

- OAuth 2.0 활용하여 Google, Kakao 및 Naver를 통해 사용자 데이터를 안전하게 받아 저장하고, 이를 기반으로 및 서비스 접근 권한을 관리
- 강의 생성 시 QR 생성을 통해 수강생에게 강의에 접근을 제공
- 등록된 수강생 정보를 강사에게 제공하여 강의 관리 및 피드백 관리를 할 수 있게 서비스 제공
- 강사가 수강생에게 피드백 제공 시 시각화에 도움이 될 수 있게 S3를 통한 image 관리 서비스 제공
- Docker와 Git Action을 통한 CI/CD 구축

#### 홈페이지:

#### :calendar: 프로젝트 기간 : 2024년 02월 06일 ~

#### :cat: [GitHub](https://github.com/Just-Swim-service)

#### :scroll: [Notion](https://burly-fridge-a81.notion.site/JUST-SWIM-3d5f114e691345e6b842a7c0e6e9dd3e?pvs=4)

#### :mag: [API Document](http://3.38.162.80/swagger)

### 2. 주요 기능

#### OAuth 2.0을 통한 사용자 데이터 저장 및 서비스 접근 권한 관리

- Google, Kakao 및 Naver의 OAuth 2.0을 통해 사용자의 데이터를 안전하게 받아오고 저장하며 이를 통해 서비스에 접근할 수 있게 관리

#### 달력을 통한 일정 확인

- 강사에게는 오늘 강습할 수업을 수강생에게는 받아야 할 수업을 달력을 통해 확인할 수 있게 데이터 제공

#### 강사가 수강생에게 편리하고 직관적이게 피드백을 제공

- 강사가 수강생에게 피드백을 생성 시 이미지를 적극적으로 활용하여 편리하고 직관적이게 제공할 수 있도록 S3 storage 서비스를 제공

#### 강사가 강습 생성 시 QR code 생성

- 강사가 강습 생성 시 QR이 생성되며 수강생에게 서비스에 편하게 접근할 수 있도록 제공

---

## :office: 개발 인원

### Front-End

- 김재환 (Next.js, React)
- 김혜빈 (Next.js, Vue.js, React)
- 박예지 (Next.js, React)
- 서동현 (Next.js, React)

### Back-End

- 박윤수 (Nest)
- 변창일 (Nest)

### Designer

-

## :wrench: 기술 스택

## :books: 라이브러리

## :pushpin: 아키텍처

## :bank: ERD
