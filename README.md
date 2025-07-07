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
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **MySQL**: localhost:3306

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
│   (Next.js)     │───▶│   (Express)     │───▶│   (Database)    │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 프로젝트 구조

```
ReHAN_ESG_platform/
├── backend/                 # Node.js + Express 서버
│   ├── Dockerfile
│   ├── package.json
│   ├── index.js
│   └── config.example.js
├── frontend/                # Next.js 프론트엔드
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── docker-compose.yaml      # Docker Compose 설정
└── README.md
```

## 🔧 개발 환경 설정

### 로컬 개발 실행
```bash
# Backend 개발 서버
cd backend
npm install
npm run start

# Frontend 개발 서버
cd frontend
npm install
npm run dev
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

- 프로덕션 환경에서는 기본 비밀번호 변경 필수
- JWT 시크릿 키 변경 필요
- 환경 변수 파일(.env)은 Git에 커밋하지 않음 