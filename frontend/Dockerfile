FROM node:20.14.0 AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --production

FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# 빌드 전 필수 디렉토리 및 파일 존재 확인
RUN echo "=== 빌드 전 파일 구조 확인 ===" && \
    ls -la && \
    echo "=== src 디렉토리 확인 ===" && \
    ls -la src/ && \
    echo "=== src/app 디렉토리 확인 ===" && \
    ls -la src/app/ && \
    echo "=== src/app 내부 파일 확인 ===" && \
    find src/app -type f && \
    echo "=== Next.js 빌드 시작 ==="

RUN npm run build

FROM base AS runner
WORKDIR /app

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm install --production

# 빌드된 애플리케이션 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package.json ./

# 포트 3000 노출
EXPOSE 3000

# Next.js 프로덕션 서버 실행
CMD ["npm", "start"]