# ReHAN ESG Platform - PETMON 키오스크 UI

PETMON 키오스크 사용자 인터페이스 - Node.js + Express + Next.js + MySQL 기반 웹 애플리케이션

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
- **UI/UX**: 키오스크 터치 인터페이스 최적화
- **배포**: Docker Compose 기반 오케스트레이션

## 🖥️ PETMON 키오스크 UI 구조

### 주요 페이지
1. **메인 페이지** (`/`): 사용자 가이드 및 기능 안내
2. **로그인 페이지** (`/login`): 휴대폰 번호 기반 로그인
3. **수리 페이지** (`/repair`): 실시간 수리 상태 트래킹

### 키오스크 최적화 기능
- **터치 친화적 UI**: 큰 버튼과 명확한 터치 영역
- **실시간 시간 표시**: 헤더에 현재 시간 표시
- **스크롤 방지**: 모든 페이지가 화면에 맞도록 최적화
- **반응형 디자인**: 다양한 키오스크 화면 크기 지원

## 📁 프로젝트 구조

```
ReHAN_ESG_platform/
├── backend/                  # Node.js + Express 서버
│   ├── sql/                  # SQL 스크립트
│   │   ├── create_user.sql   # 사용자 생성
│   │   └── usage_count.sql   # 사용량 조회
│   ├── src/
│   │   ├── database/
│   │   │   └── sequelize.js  # DB 연결
│   │   ├── models/
│   │   │   ├── index.js
│   │   │   ├── user/User.js
│   │   │   └── usage_user/UsageUser.js
│   │   └── seedUsers.js      # 예시 시드 스크립트
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx      # 메인 가이드
│   │   │   ├── login/page.tsx
│   │   │   ├── repair/page.tsx
│   │   │   ├── band-split/page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── globals.css
│   │   ├── utils/
│   │   │   ├── getAddressFromCoords.ts
│   │   │   └── updateTime.ts
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── RightSection.tsx
│   │   │   ├── BottomInquire.tsx
│   │   │   ├── Keypad.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── HowToUse.tsx
│   │   │   ├── PointGuide.tsx
│   │   │   ├── ErrorTypeSelect.tsx
│   │   │   ├── ErrorInquireModal.tsx
│   │   │   ├── UserInfoModal.tsx
│   │   │   └── CompleteModal.tsx
│   │   └── types/
│   │       └── ScreenType.ts
│   ├── public/               # 정적 리소스(svg)
│   ├── Dockerfile            # nginx 멀티스테이지
│   └── next.config.ts
│
├── docker-compose.yaml       # 전체 스택 구성
└── README.md
```

## 🎨 UI 컴포넌트 구조

### 📱 페이지별 특징

#### 메인 페이지 (`/`)
- **기능**: 사용자 가이드 및 기능 안내
- **레이아웃**: 좌측 기능 카드, 우측 사이드바
- **특징**: 
  - 4개의 기능 카드 (회원가입, 이용방법, 포인트 적립, 투입 가능 물품)
  - 시작하기 버튼으로 로그인 페이지 이동
  - 오류/고장 문의 모달
  - 화면별 컴포넌트 분리 (Register, HowToUse, PointGuide)

#### 로그인 페이지 (`/login`)
- **기능**: 휴대폰 번호 기반 로그인
- **레이아웃**: 가운데 로그인 패널, 우측 키패드
- **특징**: 
  - 3열 레이아웃 (왼쪽 작은 키패드, 가운데 로그인 영역, 오른쪽 큰 키패드)
  - 실시간 전화번호 입력 및 포맷팅
  - QR코드 회원가입 안내
  - 터치 친화적 큰 버튼

#### 수리 페이지 (`/repair`)
- **기능**: 실시간 수리 상태 트래킹
- **레이아웃**: 좌측 지도 영역, 우측 사이드바
- **특징**: 
  - 실시간 위치 추적 지도
  - 도착 예정 시간 카운트다운
  - 수리 상태 표시

### 🧩 공통 컴포넌트

#### Header.tsx
- **기능**: 로고, 시간 표시, 상태 인디케이터
- **특징**: 
  - PETMON 로고 클릭 시 메인 페이지 이동
  - 실시간 시간 업데이트
  - 자원순환 메시지 표시

#### BottomInquire.tsx
- **기능**: 하단 문의 영역 및 액션 버튼
- **특징**: 
  - 고객센터 연락처 표시
  - 카카오 채널 QR코드
  - 오류/고장 문의 버튼
  - 페이지별 커스텀 액션 버튼

#### RightSection.tsx
- **기능**: 우측 사이드바 정보 표시
- **특징**: 페이지별 맞춤 정보 제공

#### ErrorInquireModal.tsx
- **기능**: 오류 문의 모달
- **특징**: 팝업 형태의 문의 인터페이스

#### Register.tsx
- **기능**: 회원가입 화면 컴포넌트
- **특징**: 
  - QR코드 표시 및 가입 안내
  - 독립적인 컴포넌트로 분리
  - onBack prop으로 이전 화면 이동

#### HowToUse.tsx
- **기능**: 이용방법 화면 컴포넌트
- **특징**: 
  - 7단계 사용법 가로 스크롤 카드
  - 스크롤바 숨김 기능
  - 반응형 카드 레이아웃

#### PointGuide.tsx
- **기능**: 포인트 적립 안내 컴포넌트
- **특징**: 
  - 체크리스트 형태의 포인트 안내
  - 4가지 포인트 정책 표시
  - 직관적인 체크 아이콘 UI

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

### 키오스크 UI 개발 고려사항
- **화면 크기**: 대부분의 키오스크는 1920x1080 해상도
- **터치 인터페이스**: 최소 44px × 44px 터치 영역
- **시각적 피드백**: 버튼 클릭 시 즉각적인 반응
- **스크롤 방지**: 모든 컨텐츠가 화면에 맞도록 설계
- **컴포넌트 분리**: 화면별 독립적인 컴포넌트로 관리
- **타입 안전성**: TypeScript enum 및 interface 활용

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

#### 주요 테이블 구조
- **USER**: 사용자 정보 테이블
  - phone_number (VARCHAR(11), PRIMARY KEY)
  - created_at, updated_at
- **USAGE_COUNT**: 사용 횟수 테이블
  - id (AUTO_INCREMENT)
  - phone_number (VARCHAR(11), FOREIGN KEY)
  - created_at, updated_at

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

### 키오스크 UI 문제 해결
- **화면 크기 문제**: 브라우저 전체 화면 모드(F11) 사용
- **터치 반응 문제**: 터치 이벤트 디버깅 도구 사용
- **스크롤 발생**: 각 페이지의 `overflow: hidden` 설정 확인

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

## 📋 개발 아키텍처 패턴

### 컴포넌트 아키텍처
```
페이지 (page.tsx)
├── 화면별 컴포넌트 (Register, HowToUse, PointGuide)
├── 공통 컴포넌트 (Header, Footer, Modal)
└── 타입 정의 (types/)
    └── ScreenType.ts
```

### 상태 관리 패턴
- **로컬 상태**: useState를 통한 컴포넌트 상태 관리
- **화면 전환**: enum 기반 화면 타입 관리
- **Props 전달**: 컴포넌트 간 콜백 함수를 통한 상태 전달

### 폴더 구조 원칙
- **pages/**: 라우팅 기반 페이지 파일
- **components/**: 재사용 가능한 UI 컴포넌트
- **types/**: TypeScript 타입 정의
- **public/**: 정적 파일 (이미지, 아이콘)

### 코딩 컨벤션
- **명명 규칙**: PascalCase (컴포넌트), camelCase (변수/함수)
- **파일 명명**: 컴포넌트 파일은 대문자로 시작
- **TypeScript**: 엄격한 타입 검사 적용
- **ESLint**: 코드 품질 관리

## 🚀 성능 최적화

### nginx 최적화 기능
- **gzip 압축**: 텍스트 파일 압축 전송
- **정적 파일 캐싱**: 1년간 캐싱 설정
- **Keep-Alive**: 연결 재사용으로 성능 향상
- **sendfile**: 효율적인 파일 전송

### 키오스크 성능 최적화
- **이미지 최적화**: WebP 형식 사용 및 적절한 크기 조절
- **JavaScript 최적화**: 코드 분할 및 lazy loading
- **CSS 최적화**: 불필요한 스타일 제거 및 미니파이
- **캐싱 전략**: 정적 리소스 장기간 캐싱
- **컴포넌트 분리**: 화면별 독립적인 렌더링으로 성능 향상
- **타입 안전성**: TypeScript 컴파일 시 오류 사전 방지 