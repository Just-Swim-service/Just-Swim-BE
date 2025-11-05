# Just-Swim-Service (Backend)

# 목차

1. [프로젝트 소개](#loudspeaker-프로젝트-소개)
2. [개발 인원](#office-개발-인원)
3. [기술 스택](#wrench-기술-스택)
4. [라이브러리](#books-라이브러리)
5. [아키텍처](#pushpin-아키텍처)
6. [ERD](#bank-erd)
7. [통계 및 대시보드 시스템](#chart_with_upwards_trend-통계-및-대시보드-시스템)

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

#### 📊 통계 및 대시보드 시스템 (Statistics Module)

기존 데이터를 활용하여 사용자 참여도와 체류시간을 높이기 위한 통계 및 게이미피케이션 시스템

- **수강생 대시보드**: 피드백 통계, 강의 정보, 커뮤니티 활동, 운동 기록, 레벨 & 배지
- **강사 대시보드**: 강의 통계, 피드백 현황, 수강생 성과 관리, 커뮤니티 영향력
- **배지 시스템**: 22종의 배지로 사용자 활동 보상 (출석, 피드백, 커뮤니티, 강사 활동 등)
- **레벨 시스템**: 경험치 기반 레벨업, 6단계 칭호 (초보~전설 수영러), 스트릭 시스템
- **랭킹 시스템**: 수강생 활동, 인기 강사, 커뮤니티 기여자 랭킹

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

- 최우성
- 박효경

---

## :wrench: 기술 스택

- 프레임 워크: <code>Nest.js</code>
- 패키지 매니저: <code>npm</code>
- 데이터 베이스: <code>MySQL</code>
- ORM: <code>TypeOrm</code>
- CI/CD <code>Docker</code> / <code>Git Action</code>
- RESTful API Documentation: <code>Swagger</code>

---

## :books: 라이브러리

| 라이브러리              | 설명                      |
| :---------------------- | :------------------------ |
| Nestjs                  | 서버 프레임워크           |
| express                 | 서버                      |
| swagger                 | API 명세서 관리           |
| typescript              | 유지, 보수 및 생산성 향상 |
| mysql2                  | 데이터 베이스             |
| jwt                     | 서명 암호화               |
| passport                | OAuth 2.0 사용            |
| passport-google-oauth20 | google OAuth 2.0          |
| passport-kakao          | kakao OAuth 2.0           |
| passport-naver-v2       | naver OAuth 2.0           |
| eslint                  | 정적 코드 분석            |
| typeorm                 | Object Relational Mapping |

---

## :pushpin: 아키텍처

![Architecture](https://github.com/user-attachments/assets/04e1a786-8378-4d86-b4b0-34bac489349d)

## :bank: ERD

![ERD](https://github.com/user-attachments/assets/1715a127-8760-4368-9265-5b3365604a41)
