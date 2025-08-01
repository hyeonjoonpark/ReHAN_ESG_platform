# Node.js 22.15.0 베이스 이미지 사용
FROM node:20.14.0

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 3001

# 애플리케이션 실행
CMD ["npm", "start"]
