# Build stage
# 사용하는 node 버전
FROM node:18-alpine AS build

# RUN,CMD의 명령이 실행될 디렉토리 경로
WORKDIR /usr/src/app

# COPY (복사할 파일 경로) (이미지에서 파일이 위치할 경로)
COPY package*.json ./

# 이미지 실행 시 사용될 명령어
RUN npm install
COPY . .

# .env 파일 복사
COPY .env .env

# test 진행
RUN npm run test

# FROM에서 설정한 이미지 위에서 스크립트 혹은 명령을 실행
RUN npm run build

# prod stage
FROM node:22-alpine
WORKDIR /usr/src/app
ARG NODE_ENV=production
# 환경변수 설정
ENV NODE_ENV=${NODE_ENV}
# Copy the built files from the build stage
COPY --from=build /usr/src/app/.env ./.env
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./

# 호스트와 연결할 포트 번호
EXPOSE 80
# 컨테이너가 시작되었을 때 실행하는 명령
CMD ["node", "dist/main.js"]
