# Torizon OS 빠른 시작 가이드

ReHAN ESG Platform을 Torizon OS에 배포하는 빠른 시작 가이드입니다.

## 🎯 1단계: 프로젝트 Clone

Torizon 디바이스에 SSH 접속 후 실행:

```bash
# SSH 접속
ssh torizon@<YOUR_DEVICE_IP>
# 기본 비밀번호: torizon

# 홈 디렉토리로 이동
cd /home/torizon

# Git 컨테이너로 프로젝트 Clone
docker run -it --rm \
  -v /home/torizon:/workspace \
  -w /workspace \
  alpine/git:latest \
  clone https://github.com/hyeonjoonpark/ReHAN_ESG_platform.git

# 프로젝트 디렉토리로 이동
cd ReHAN_ESG_platform

# 파일 확인
ls -la
```

## 🔧 2단계: Docker Compose 설정 파일 생성

```bash
# docker-compose.torizon.yaml 파일 생성
cat > docker-compose.torizon.yaml << 'EOF'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: petmon_backend
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: rehan_esg_platform
      DB_USER: app_user
      DB_PASSWORD: app_password
      JWT_SECRET: your_jwt_secret_change_this
      SERIAL_PORT: /dev/ttyUSB0
      ENABLE_HARDWARE: "true"
      NODE_ENV: production
    volumes:
      - ./backend:/app
      - /app/node_modules
    ports:
      - "3001:3001"
    restart: unless-stopped
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0
    cap_add:
      - SYS_RAWIO

  mysql:
    image: mysql:8.0
    container_name: petmon_mysql
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -p$$MYSQL_ROOT_PASSWORD"]
      interval: 10s
      timeout: 5s
      retries: 5
    environment:
      MYSQL_ROOT_PASSWORD: app_password
      MYSQL_DATABASE: rehan_esg_platform
      MYSQL_CHARACTER_SET_SERVER: utf8mb4
      MYSQL_COLLATION_SERVER: utf8mb4_unicode_ci
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci --default-authentication-plugin=caching_sha2_password
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: petmon_frontend
    depends_on:
      - backend
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_BACKEND_URL: http://localhost:3001
      NEXT_PUBLIC_SOCKET_URL: ws://localhost:3001
    ports:
      - "80:3000"
      - "443:3000"
    restart: unless-stopped

volumes:
  mysql_data:
    driver: local
EOF

echo "✅ docker-compose.torizon.yaml 파일 생성 완료"
```

## 🚀 3단계: 애플리케이션 빌드 및 실행

```bash
# 현재 위치 확인
pwd
# /home/torizon/ReHAN_ESG_platform

# Docker Compose로 빌드 및 실행
docker compose -f docker-compose.torizon.yaml up -d --build

# 빌드 진행 상황 확인 (5-10분 소요)
docker compose -f docker-compose.torizon.yaml logs -f
```

## 📊 4단계: 상태 확인

```bash
# 컨테이너 상태 확인
docker compose -f docker-compose.torizon.yaml ps

# 실시간 로그 확인
docker compose -f docker-compose.torizon.yaml logs -f

# 특정 서비스 로그만 확인
docker compose -f docker-compose.torizon.yaml logs -f backend
docker compose -f docker-compose.torizon.yaml logs -f frontend
docker compose -f docker-compose.torizon.yaml logs -f mysql

# 리소스 사용량 확인
docker stats
```

## 🌐 5단계: 애플리케이션 접속

브라우저에서 접속:

```
Frontend: http://<TORIZON_DEVICE_IP>
Backend:  http://<TORIZON_DEVICE_IP>:3001
```

또는 터미널에서 테스트:

```bash
# Backend 헬스 체크
curl http://localhost:3001/health

# Frontend 확인
curl http://localhost:3000
```

## ⚙️ 6단계: 환경 변수 설정 (선택사항)

보안을 위해 .env 파일로 관리:

```bash
# .env 파일 생성
cat > .env << 'EOF'
# 데이터베이스
DB_HOST=mysql
DB_PORT=3306
DB_NAME=rehan_esg_platform
DB_USER=app_user
DB_PASSWORD=SecurePassword123!

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key_here_change_this

# 하드웨어
SERIAL_PORT=/dev/ttyUSB0
ENABLE_HARDWARE=true

# 환경
NODE_ENV=production

# API URL
NEXT_PUBLIC_BACKEND_URL=http://192.168.1.100:3001
NEXT_PUBLIC_SOCKET_URL=ws://192.168.1.100:3001
EOF

echo "✅ .env 파일 생성 완료"
```

그리고 docker-compose.torizon.yaml에서 환경 변수 참조:

```yaml
environment:
  DB_PASSWORD: ${DB_PASSWORD:-app_password}
  JWT_SECRET: ${JWT_SECRET:-default_secret}
```

## 🔄 유용한 명령어

### 재시작
```bash
# 전체 재시작
docker compose -f docker-compose.torizon.yaml restart

# 특정 서비스만 재시작
docker compose -f docker-compose.torizon.yaml restart backend
```

### 중지 및 시작
```bash
# 중지
docker compose -f docker-compose.torizon.yaml stop

# 시작
docker compose -f docker-compose.torizon.yaml start

# 완전히 종료 (컨테이너 삭제)
docker compose -f docker-compose.torizon.yaml down

# 볼륨까지 삭제 (데이터베이스 초기화)
docker compose -f docker-compose.torizon.yaml down -v
```

### 재빌드
```bash
# 특정 서비스만 재빌드
docker compose -f docker-compose.torizon.yaml build backend
docker compose -f docker-compose.torizon.yaml up -d backend

# 전체 재빌드
docker compose -f docker-compose.torizon.yaml build --no-cache
docker compose -f docker-compose.torizon.yaml up -d
```

### 컨테이너 내부 접속
```bash
# Backend 컨테이너 접속
docker exec -it petmon_backend bash

# MySQL 컨테이너 접속
docker exec -it petmon_mysql bash
mysql -u root -p

# Frontend 컨테이너 접속
docker exec -it petmon_frontend bash
```

## 🔧 문제 해결

### 포트가 이미 사용 중
```bash
# 사용 중인 포트 확인
netstat -tulpn | grep 3001

# Docker 컨테이너 모두 중지
docker stop $(docker ps -aq)
```

### 빌드 실패
```bash
# Docker 이미지 정리
docker system prune -a

# 다시 빌드
docker compose -f docker-compose.torizon.yaml build --no-cache
```

### 디스크 공간 부족
```bash
# Docker 정리
docker system prune -a --volumes

# 디스크 사용량 확인
df -h
docker system df
```

### 시리얼 포트 권한 문제
```bash
# 시리얼 포트 확인
ls -l /dev/ttyUSB0

# 권한 부여
sudo chmod 666 /dev/ttyUSB0

# dialout 그룹 추가
sudo usermod -aG dialout torizon
```

## 🔐 보안 설정

### 1. 기본 비밀번호 변경
```bash
# torizon 사용자 비밀번호 변경
passwd

# MySQL root 비밀번호는 .env 파일에서 변경
```

### 2. 방화벽 설정
```bash
# UFW 설치 확인
which ufw

# Docker 컨테이너에서 설치
docker run -it --rm --network host ubuntu:22.04 bash
apt update && apt install -y ufw
```

### 3. SSH 키 기반 인증
```bash
# 개발 머신에서
ssh-copy-id torizon@<DEVICE_IP>
```

## 📦 자동 시작 설정

재부팅 시 자동으로 애플리케이션 시작:

```bash
# Systemd 서비스 파일 생성
sudo tee /etc/systemd/system/rehan-esg.service > /dev/null << 'EOF'
[Unit]
Description=ReHAN ESG Platform
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/torizon/ReHAN_ESG_platform
ExecStart=/usr/bin/docker compose -f docker-compose.torizon.yaml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.torizon.yaml down
User=torizon
Group=torizon

[Install]
WantedBy=multi-user.target
EOF

# 서비스 활성화
sudo systemctl daemon-reload
sudo systemctl enable rehan-esg.service
sudo systemctl start rehan-esg.service

# 상태 확인
sudo systemctl status rehan-esg.service

# 재부팅 테스트
sudo reboot
```

## 📝 하드웨어 설정

### 시리얼 포트 확인
```bash
# 사용 가능한 시리얼 포트 목록
ls -l /dev/tty*

# USB 시리얼 디바이스
ls -l /dev/ttyUSB*  # USB to Serial
ls -l /dev/ttyACM*  # USB CDC
```

### Verdin/Apalis 온보드 UART
```bash
# Verdin iMX8M Plus
/dev/ttymxc0  # UART_1
/dev/ttymxc1  # UART_2
/dev/ttymxc2  # UART_3

# Apalis iMX8
/dev/ttymxc0
/dev/ttymxc1
```

docker-compose.torizon.yaml에서 포트 변경:
```yaml
devices:
  - /dev/ttymxc0:/dev/ttymxc0  # 온보드 UART 사용
```

## 🎯 완료 체크리스트

- [ ] Torizon OS 설치 및 부팅 확인
- [ ] SSH 접속 성공
- [ ] Docker 작동 확인 (`docker ps`)
- [ ] 프로젝트 Clone 완료
- [ ] docker-compose.torizon.yaml 생성
- [ ] Docker Compose 빌드 성공
- [ ] 컨테이너 실행 확인
- [ ] Frontend 접속 가능 (http://DEVICE_IP)
- [ ] Backend API 응답 확인
- [ ] 시리얼 포트 연결 확인 (하드웨어 사용 시)
- [ ] 자동 시작 서비스 설정
- [ ] 재부팅 테스트

## 📚 추가 자료

- 상세 가이드: `TORIZON_DEPLOYMENT.md`
- 하드웨어 통합: `HARDWARE_INTEGRATION.md`
- CI/CD 파이프라인: `CI_CD_README.md`

---

**작성일**: 2025-10-01  
**대상**: Toradex Apalis/Verdin 모듈  
**프로젝트**: https://github.com/hyeonjoonpark/ReHAN_ESG_platform

