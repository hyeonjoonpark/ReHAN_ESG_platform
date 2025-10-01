# Ubuntu 22.04 베이스 이미지 사용
FROM ubuntu:22.04

# 타임존 설정 (대화형 프롬프트 방지)
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Seoul

# 시스템 업데이트 및 필수 패키지 설치
RUN apt-get update && \
    apt-get install -y curl gnupg ca-certificates tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    rm -rf /var/lib/apt/lists/*

# Node.js 20.x 설치 (NodeSource 공식 저장소)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest && \
    rm -rf /var/lib/apt/lists/*

# Node.js 버전 확인 (20.14.0으로 고정)
RUN node --version && npm --version

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
