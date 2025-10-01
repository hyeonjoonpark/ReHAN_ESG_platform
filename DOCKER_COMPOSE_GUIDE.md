# Docker Compose 사용 가이드

ReHAN ESG Platform의 다양한 Docker Compose 설정 파일 사용 방법입니다.

## 📁 Docker Compose 파일 종류

```
ReHAN_ESG_platform/
├── docker-compose.yaml                      # Jetson Orin Nano용 (기본)
├── docker-compose.hardware.yaml             # Jetson용 하드웨어 오버라이드
├── docker-compose.torizon.yaml              # Torizon OS용 (신규)
└── docker-compose.hardware-torizon.yaml     # Torizon용 하드웨어 오버라이드 (신규)
```

---

## 🚀 사용 방법

### 1️⃣ Torizon OS - 하드웨어 **있을 때** (권장)

```bash
# .env 파일 생성 (한 번만)
cat > .env << 'EOF'
DB_HOST=mysql
DB_PORT=3306
DB_NAME=rehan_esg_platform
DB_USER=app_user
DB_PASSWORD=SecurePassword123!
JWT_SECRET=your_secure_jwt_secret_change_this
SERIAL_PORT=/dev/ttyUSB0
ENABLE_HARDWARE=true
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001
GOOGLE_MAPS_API_KEY=
EOF

# 빌드 및 실행
docker compose \
  -f docker-compose.torizon.yaml \
  -f docker-compose.hardware-torizon.yaml \
  up -d --build

# 로그 확인
docker compose \
  -f docker-compose.torizon.yaml \
  -f docker-compose.hardware-torizon.yaml \
  logs -f
```

### 2️⃣ Torizon OS - 하드웨어 **없을 때**

```bash
# .env 파일에서 ENABLE_HARDWARE=false 설정
cat > .env << 'EOF'
DB_HOST=mysql
DB_PORT=3306
DB_NAME=rehan_esg_platform
DB_USER=app_user
DB_PASSWORD=SecurePassword123!
JWT_SECRET=your_secure_jwt_secret_change_this
SERIAL_PORT=/dev/ttyUSB0
ENABLE_HARDWARE=false
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001
GOOGLE_MAPS_API_KEY=
EOF

# docker-compose.torizon.yaml만 사용
docker compose -f docker-compose.torizon.yaml up -d --build

# 로그 확인
docker compose -f docker-compose.torizon.yaml logs -f
```

### 3️⃣ Jetson Orin Nano - 하드웨어 있을 때

```bash
# 기본 + 하드웨어 설정
docker compose \
  -f docker-compose.yaml \
  -f docker-compose.hardware.yaml \
  up -d --build
```

### 4️⃣ Jetson Orin Nano - 하드웨어 없을 때

```bash
# 기본 설정만
docker compose -f docker-compose.yaml up -d
```

---

## 🔧 주요 명령어

### 빌드 및 실행

```bash
# Torizon + 하드웨어
docker compose -f docker-compose.torizon.yaml -f docker-compose.hardware-torizon.yaml up -d --build

# Torizon 단독
docker compose -f docker-compose.torizon.yaml up -d --build

# Jetson + 하드웨어
docker compose -f docker-compose.yaml -f docker-compose.hardware.yaml up -d --build

# Jetson 단독
docker compose -f docker-compose.yaml up -d
```

### 상태 확인

```bash
# 컨테이너 상태
docker compose -f docker-compose.torizon.yaml ps

# 실시간 로그
docker compose -f docker-compose.torizon.yaml logs -f

# 특정 서비스 로그
docker compose -f docker-compose.torizon.yaml logs -f backend
docker compose -f docker-compose.torizon.yaml logs -f frontend
docker compose -f docker-compose.torizon.yaml logs -f mysql

# 리소스 사용량
docker stats
```

### 재시작

```bash
# 전체 재시작
docker compose -f docker-compose.torizon.yaml restart

# 특정 서비스만
docker compose -f docker-compose.torizon.yaml restart backend

# 하드웨어 포함 시
docker compose -f docker-compose.torizon.yaml -f docker-compose.hardware-torizon.yaml restart
```

### 중지 및 삭제

```bash
# 중지
docker compose -f docker-compose.torizon.yaml stop

# 컨테이너 삭제 (데이터 유지)
docker compose -f docker-compose.torizon.yaml down

# 컨테이너 + 볼륨 삭제 (데이터 초기화)
docker compose -f docker-compose.torizon.yaml down -v

# 하드웨어 포함 시
docker compose -f docker-compose.torizon.yaml -f docker-compose.hardware-torizon.yaml down
```

### 재빌드

```bash
# 캐시 무시 재빌드
docker compose -f docker-compose.torizon.yaml build --no-cache

# 특정 서비스만
docker compose -f docker-compose.torizon.yaml build --no-cache backend

# 재빌드 후 실행
docker compose -f docker-compose.torizon.yaml up -d --build
```

---

## 📝 .env 파일 설정

### 필수 환경 변수

`.env` 파일을 프로젝트 루트에 생성하세요:

```bash
# Torizon 디바이스에서 실행
cd /home/torizon/ReHAN_ESG_platform

# .env 파일 생성
cat > .env << 'EOF'
# 데이터베이스
DB_HOST=mysql
DB_PORT=3306
DB_NAME=rehan_esg_platform
DB_USER=app_user
DB_PASSWORD=SecurePassword123!

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key_here_change_this_in_production

# 하드웨어
SERIAL_PORT=/dev/ttyUSB0
ENABLE_HARDWARE=true

# 환경
NODE_ENV=production

# API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001

# Google Maps (선택)
GOOGLE_MAPS_API_KEY=
EOF

# 권한 설정 (보안)
chmod 600 .env
```

### 환경별 설정 예시

#### 🖥️ 개발 환경 (하드웨어 없음)
```env
ENABLE_HARDWARE=false
NODE_ENV=development
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001
```

#### 🏭 프로덕션 (Torizon, 하드웨어 있음)
```env
ENABLE_HARDWARE=true
SERIAL_PORT=/dev/ttyUSB0
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=http://192.168.1.100:3001
NEXT_PUBLIC_SOCKET_URL=ws://192.168.1.100:3001
```

#### 🔧 Verdin/Apalis 온보드 UART 사용
```env
ENABLE_HARDWARE=true
SERIAL_PORT=/dev/ttymxc0
NODE_ENV=production
```

---

## 🔍 파일별 차이점

### docker-compose.yaml (Jetson용)
- `network_mode: host` 사용
- Jetson Orin Nano 환경 최적화
- 환경 변수 기본값 포함

### docker-compose.torizon.yaml (Torizon용)
- Bridge 네트워크 사용 (Torizon 권장)
- `.env` 파일 **필수**
- 네트워크 격리 및 보안 강화

### docker-compose.hardware.yaml (Jetson용)
- USB 디바이스 마운트
- `privileged: true` 사용

### docker-compose.hardware-torizon.yaml (Torizon용)
- USB 디바이스 마운트
- `cap_add: SYS_RAWIO` 사용 (최소 권한)
- 온보드 UART 설정 예시 포함

---

## 💡 실전 사용 예시

### 예시 1: Torizon에서 처음 배포

```bash
# 1. 프로젝트 Clone
cd /home/torizon
docker run -it --rm -v /home/torizon:/workspace -w /workspace alpine/git:latest \
  clone https://github.com/hyeonjoonpark/ReHAN_ESG_platform.git
cd ReHAN_ESG_platform

# 2. .env 파일 생성
cat > .env << 'EOF'
DB_HOST=mysql
DB_PORT=3306
DB_NAME=rehan_esg_platform
DB_USER=app_user
DB_PASSWORD=SecurePassword123!
JWT_SECRET=my_secure_jwt_secret_key_12345678
SERIAL_PORT=/dev/ttyUSB0
ENABLE_HARDWARE=true
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001
GOOGLE_MAPS_API_KEY=
EOF

# 3. 하드웨어와 함께 빌드 및 실행
docker compose \
  -f docker-compose.torizon.yaml \
  -f docker-compose.hardware-torizon.yaml \
  up -d --build

# 4. 로그 확인
docker compose \
  -f docker-compose.torizon.yaml \
  -f docker-compose.hardware-torizon.yaml \
  logs -f
```

### 예시 2: 코드 업데이트 후 재배포

```bash
# 1. Git Pull (컨테이너 사용)
docker run -it --rm -v $(pwd):/workspace -w /workspace alpine/git:latest pull

# 2. 재빌드 및 재시작
docker compose \
  -f docker-compose.torizon.yaml \
  -f docker-compose.hardware-torizon.yaml \
  up -d --build

# 또는 특정 서비스만
docker compose -f docker-compose.torizon.yaml build --no-cache backend
docker compose -f docker-compose.torizon.yaml up -d backend
```

### 예시 3: 개발 모드로 전환 (하드웨어 없음)

```bash
# 1. .env 파일 수정
sed -i 's/ENABLE_HARDWARE=true/ENABLE_HARDWARE=false/' .env
sed -i 's/NODE_ENV=production/NODE_ENV=development/' .env

# 2. 하드웨어 설정 없이 실행
docker compose -f docker-compose.torizon.yaml down
docker compose -f docker-compose.torizon.yaml up -d
```

---

## 🛠️ 문제 해결

### 1. "environment variable not set" 오류

**증상**:
```
WARN[0000] environment variable "DB_NAME" not set
```

**해결**:
```bash
# .env 파일이 있는지 확인
ls -la .env

# 없으면 생성
cat > .env << 'EOF'
DB_NAME=rehan_esg_platform
DB_USER=app_user
DB_PASSWORD=app_password
# ... 나머지 변수
EOF
```

### 2. 시리얼 포트 접근 불가

**증상**:
```
Error: Cannot access /dev/ttyUSB0
```

**해결**:
```bash
# 포트 확인
ls -l /dev/ttyUSB0

# 권한 부여
sudo chmod 666 /dev/ttyUSB0

# dialout 그룹 추가
sudo usermod -aG dialout $USER
exit
# SSH 재접속
```

### 3. 포트 충돌

**증상**:
```
Error: port 3001 already in use
```

**해결**:
```bash
# 실행 중인 컨테이너 확인
docker ps

# 모든 컨테이너 중지
docker compose -f docker-compose.torizon.yaml down

# 또는 프로세스 종료
sudo lsof -ti:3001 | xargs sudo kill -9
```

### 4. 디스크 공간 부족

**해결**:
```bash
# Docker 정리
docker system prune -a --volumes

# 빌드 캐시 정리
docker builder prune -a

# 디스크 사용량 확인
df -h
docker system df
```

---

## 📋 체크리스트

### Torizon 배포 전 확인사항

- [ ] `.env` 파일 생성 및 설정
- [ ] 시리얼 포트 경로 확인 (`ls /dev/tty*`)
- [ ] 하드웨어 연결 여부 확인
- [ ] Docker 작동 확인 (`docker ps`)
- [ ] 네트워크 연결 확인
- [ ] 디스크 공간 확인 (`df -h`)

### 빌드 후 확인사항

- [ ] 모든 컨테이너 실행 중 (`docker compose ps`)
- [ ] Backend 응답 확인 (`curl localhost:3001/health`)
- [ ] Frontend 접속 확인 (브라우저)
- [ ] 시리얼 통신 확인 (로그)
- [ ] 데이터베이스 연결 확인

---

## 🔗 관련 문서

- **빠른 시작**: `TORIZON_QUICK_START.md`
- **상세 배포 가이드**: `TORIZON_DEPLOYMENT.md`
- **하드웨어 통합**: `HARDWARE_INTEGRATION.md`
- **CI/CD**: `CI_CD_README.md`

---

**최종 업데이트**: 2025-10-01  
**작성자**: ReHAN ESG Platform Team

