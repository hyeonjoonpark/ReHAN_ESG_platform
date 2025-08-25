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
RUN npm run build

FROM base AS runner
WORKDIR /app

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm install --production

# 빌드된 애플리케이션 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 포트 3000 노출
EXPOSE 3000

# Next.js 개발 서버 실행
CMD ["npm", "run", "dev"]