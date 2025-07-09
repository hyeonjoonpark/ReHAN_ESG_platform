# ReHAN ESG Platform

ReHAN ESG 플랫폼 - Node.js + Express + Next.js + MySQL 기반 웹 애플리케이션

## 🚀 빠른 시작

### 사전 요구사항
- Docker 및 Docker Compose 설치
- Git 설치

### 설치 및 실행

1. **저장소 클론**
```bash
git clone <repository-url>
cd ReHAN_ESG_platform
```

2. **환경 변수 설정 (선택사항)**
```bash
# backend 디렉토리에 .env 파일 생성
cp backend/config.example.js backend/config.js
# 또는 .env 파일 생성:
# DB_HOST=mysql
# DB_PORT=3306
# DB_NAME=rehan_esg_platform
# DB_USER=app_user
# DB_PASSWORD=app_password
```

3. **Docker Compose로 전체 서비스 실행**
```bash
# 백그라운드에서 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그 확인
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

4. **서비스 접속**
- **Frontend (HTTPS)**: https://localhost 🔒
- **Frontend (도메인)**: https://rehan.local 🔒
- **Backend**: http://localhost:3001
- **API (HTTPS)**: https://localhost/api/ 🔒
- **MySQL**: localhost:3306

> 📌 **HTTP 자동 리다이렉트**: http://localhost 접속 시 자동으로 https://localhost로 리다이렉트됩니다.

### 서비스 관리

```bash
# 모든 서비스 중지
docker-compose down

# 볼륨까지 완전 삭제
docker-compose down -v

# 특정 서비스만 재시작
docker-compose restart backend

# 서비스 상태 확인
docker-compose ps
```

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   MySQL         │
│   (nginx)       │───▶│   (Express)     │───▶│   (Database)    │
│   Port: 80      │    │   Port: 3001    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 주요 특징
- **Frontend**: Next.js 정적 빌드 + nginx 배포
- **Backend**: Express.js API 서버
- **Database**: MySQL 8.0
- **배포**: Docker Compose 기반 오케스트레이션

## 📁 프로젝트 구조

```
ReHAN_ESG_platform/
├── backend/                 # Node.js + Express 서버
│   ├── backup/              # 백업 파일들
│   ├── sql/                 # SQL 스크립트
│   │   └── create_user.sql  # 사용자 생성 스크립트
│   ├── src/                 # 백엔드 소스 코드
│   │   ├── auth/            # 인증 관련 모듈
│   │   ├── models/          # 데이터 모델
│   │   ├── routes/          # API 라우트
│   │   ├── service/         # 비즈니스 로직
│   │   └── utils/           # 유틸리티 함수
│   ├── Dockerfile           # Docker 빌드 설정
│   ├── package.json         # 의존성 관리
│   ├── index.js             # 서버 엔트리 포인트
│   └── config.example.js    # 설정 파일 예제
├── frontend/                # Next.js 프론트엔드 (nginx 배포)
│   ├── src/                 # 프론트엔드 소스 코드
│   │   ├── app/             # Next.js App Router
│   │   │   ├── repair/      # 수리 페이지
│   │   │   │   └── page.tsx # 수리 트래킹 페이지
│   │   │   ├── page.tsx     # 메인 가이드 페이지
│   │   │   ├── layout.tsx   # 루트 레이아웃
│   │   │   ├── globals.css  # 글로벌 스타일
│   │   │   └── favicon.ico  # 파비콘
│   │   └── components/      # 재사용 가능한 컴포넌트
│   │       ├── Header.tsx           # 공통 헤더
│   │       ├── RightSection.tsx     # 우측 사이드바
│   │       ├── BottomInquire.tsx    # 하단 문의 영역
│   │       └── ErrorInquireModal.tsx # 오류 문의 모달
│   ├── public/              # 정적 파일
│   │   ├── file.svg         # 파일 아이콘
│   │   ├── globe.svg        # 글로브 아이콘
│   │   ├── next.svg         # Next.js 로고
│   │   ├── vercel.svg       # Vercel 로고
│   │   └── window.svg       # 윈도우 아이콘
│   ├── Dockerfile           # Multi-stage build (Node.js → nginx)
│   ├── nginx.conf           # nginx 설정 파일
│   ├── package.json         # 의존성 관리
│   ├── next.config.ts       # Next.js 설정 (정적 빌드)
│   ├── tsconfig.json        # TypeScript 설정
│   ├── eslint.config.mjs    # ESLint 설정
│   └── postcss.config.mjs   # PostCSS 설정
├── ssl/                     # SSL 인증서
├── docker-compose.yaml      # Docker Compose 설정
└── README.md               # 프로젝트 문서
```

## 🔧 개발 환경 설정

### 로컬 개발 실행
```bash
# Backend 개발 서버
cd backend
npm install
npm run start

# Frontend 개발 서버 (개발 모드)
cd frontend
npm install
npm run dev
```

### nginx 배포 특징
- **정적 파일 서빙**: 빌드된 정적 파일을 nginx가 직접 서빙
- **API 프록시**: `/api/*` 경로를 Backend로 자동 프록시
- **SPA 라우팅**: 클라이언트 사이드 라우팅 지원
- **성능 최적화**: gzip 압축, 캐싱 헤더 자동 설정
- **보안 강화**: 보안 헤더 자동 추가

### 빌드 과정
1. **Node.js 빌드**: Next.js 프로젝트를 정적 파일로 빌드
2. **nginx 배포**: 빌드된 파일을 nginx 컨테이너로 복사
3. **설정 적용**: nginx.conf 설정 파일 적용

### 도메인 설정 (선택사항)
실제 도메인처럼 사용하고 싶다면 hosts 파일을 수정하세요:
```bash
# /etc/hosts 파일에 도메인 추가
echo "127.0.0.1 rehan.local" | sudo tee -a /etc/hosts

# 브라우저에서 접속
# https://rehan.local
```

## 🔒 HTTPS 설정

### 자체 서명 인증서 (현재 설정)
- **개발/테스트 환경**에 적합
- 브라우저에서 "안전하지 않음" 경고 표시 (정상)
- 인증서 위치: `./ssl/server.crt`, `./ssl/server.key`

### 브라우저 경고 해결(MacOS)

#### 방법 1: mkcert로 신뢰할 수 있는 인증서 생성 (권장)
```bash
# 1. mkcert 설치
brew install mkcert

# 2. 로컬 CA 설치
mkcert -install

# 3. 인증서 생성
mkcert localhost rehan.local

# 4. 인증서 복사
cp localhost+1.pem ssl/server.crt
cp localhost+1-key.pem ssl/server.key

# 5. 서비스 재시작
docker-compose restart frontend

# 6. 임시 파일 정리
rm localhost+1.pem localhost+1-key.pem
```

#### 방법 2: 브라우저 경고 무시
1. **Chrome/Safari**: "고급" → "안전하지 않은 사이트로 이동" 클릭
2. **Firefox**: "고급" → "위험을 감수하고 계속" 클릭

### 프로덕션 인증서 설정

#### Let's Encrypt (무료, 권장)
```bash
# 1. Certbot 설치 및 인증서 발급
sudo certbot certonly --standalone -d yourdomain.com

# 2. 인증서를 ssl 디렉토리로 복사
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/server.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/server.key

# 3. 권한 설정
sudo chown $USER:$USER ./ssl/server.*
```

#### 상용 인증서
```bash
# 1. 인증서 파일을 ssl 디렉토리에 배치
cp your-certificate.crt ./ssl/server.crt
cp your-private-key.key ./ssl/server.key

# 2. 권한 설정
chmod 600 ./ssl/server.key
chmod 644 ./ssl/server.crt
```

### 데이터베이스 설정
- **Database**: rehan_esg_platform
- **Username**: app_user
- **Password**: app_password
- **Root Password**: root_password

## 🐛 문제 해결

### 포트 충돌 시
```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :3001
lsof -i :3306

# Docker 컨테이너 완전 정리
docker system prune -a
```

### 데이터베이스 초기화
```bash
# MySQL 데이터 볼륨 삭제 후 재생성
docker-compose down -v
docker-compose up -d
```

## 📝 환경 변수

### Backend 환경 변수
| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| DB_HOST | mysql | 데이터베이스 호스트 |
| DB_PORT | 3306 | 데이터베이스 포트 |
| DB_NAME | rehan_esg_platform | 데이터베이스 이름 |
| DB_USER | app_user | 데이터베이스 사용자 |
| DB_PASSWORD | app_password | 데이터베이스 비밀번호 |
| NODE_ENV | development | 실행 환경 |
| PORT | 3001 | 서버 포트 |

## 🔒 보안 고려사항

### 기본 보안 설정
- 프로덕션 환경에서는 기본 비밀번호 변경 필수
- JWT 시크릿 키 변경 필요
- 환경 변수 파일(.env)은 Git에 커밋하지 않음

### HTTPS 보안
- **TLS 1.2/1.3**: 최신 보안 프로토콜 사용
- **HSTS**: Strict-Transport-Security 헤더 적용
- **자동 HTTP→HTTPS 리다이렉트**: 모든 HTTP 요청 자동 전환
- **보안 헤더**: X-Frame-Options, X-Content-Type-Options, XSS-Protection 등

### nginx 보안 최적화
- **정적 파일 캐싱**: 정적 리소스 캐싱으로 성능 최적화
- **API 프록시**: CORS 문제 해결 및 백엔드 보안 강화
- **gzip 압축**: 데이터 전송 최적화
- **보안 헤더 자동 적용**: 일반적인 웹 공격 방어

## 🚀 성능 최적화

### nginx 최적화 기능
- **gzip 압축**: 텍스트 파일 압축 전송
- **정적 파일 캐싱**: 1년간 캐싱 설정
- **Keep-Alive**: 연결 재사용으로 성능 향상
- **sendfile**: 효율적인 파일 전송 