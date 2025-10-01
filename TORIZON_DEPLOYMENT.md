# Torizon OS 배포 가이드

ReHAN ESG Platform을 Toradex 모듈의 Torizon OS에 배포하는 가이드입니다.

## 📋 목차
1. [개요](#개요)
2. [사전 요구사항](#사전-요구사항)
3. [Torizon OS 설정](#torizon-os-설정)
4. [프로젝트 배포](#프로젝트-배포)
5. [하드웨어 통합](#하드웨어-통합)
6. [네트워크 설정](#네트워크-설정)
7. [문제 해결](#문제-해결)

---

## 개요

### Torizon OS란?
- **Toradex**에서 제공하는 산업용 임베디드 Linux OS
- Docker 컨테이너 기반 애플리케이션 실행
- Over-The-Air (OTA) 업데이트 지원
- Debian 기반으로 친숙한 개발 환경

### 현재 프로젝트 구조
```
ReHAN ESG Platform
├── Frontend (Next.js + nginx)
├── Backend (Node.js + Express)
└── MySQL (Database)
```

이 구조는 Torizon OS의 Docker Compose로 **그대로 실행 가능**합니다!

---

## 사전 요구사항

### 1. 하드웨어
- **Toradex 모듈** (권장):
  - Verdin iMX8M Plus (ARM64) - **추천**
  - Apalis iMX8 (ARM64)
  - Verdin AM62 (ARM64)
- **최소 사양**:
  - RAM: 2GB 이상 (권장: 4GB)
  - 스토리지: 16GB 이상
  - 네트워크: 이더넷 또는 Wi-Fi

### 2. 소프트웨어
- Torizon OS 6.x 이상 설치됨
- SSH 접속 가능
- 인터넷 연결

### 3. 개발 머신
- Docker 설치
- Git 설치
- SSH 클라이언트

---

## Torizon OS 설정

### 1. Torizon OS 이미지 설치

#### Easy Installer 사용 (권장)
```bash
# 1. Toradex Easy Installer 다운로드
# https://developer.toradex.com/easy-installer

# 2. USB에 이미지 플래시
# balenaEtcher 또는 dd 명령어 사용

# 3. Toradex 모듈에 설치
# Easy Installer 부팅 → Torizon OS 선택 → 설치
```

#### Torizon OS 버전 확인
```bash
# SSH로 Toradex 모듈 접속
ssh torizon@<YOUR_DEVICE_IP>

# OS 버전 확인
cat /etc/os-release
# PRETTY_NAME="TorizonCore 6.x.x"
```

### 2. Docker 및 Docker Compose 확인

Torizon OS에는 Docker가 기본 설치되어 있습니다:

```bash
# Docker 버전 확인
docker --version

# Docker Compose 확인
docker compose version
```

### 3. 시스템 업데이트

⚠️ **중요**: Torizon OS는 OSTree 기반이므로 `apt` 명령어가 **없습니다**!

```bash
# ❌ 작동하지 않음
apt update  # sh: apt: command not found

# ✅ Torizon OS 업데이트 방법
# 1. Torizon Platform을 통한 OTA 업데이트 (권장)
# 2. 또는 새 이미지 플래시

# 시스템 정보 확인
cat /etc/os-release
ostree admin status

# 재부팅
sudo reboot
```

**Torizon OS 특징**:
- **읽기 전용 루트 파일시스템**: 보안과 안정성을 위해
- **OSTree 기반**: Git처럼 OS 버전 관리
- **컨테이너 중심**: 모든 애플리케이션은 Docker 컨테이너로 실행

---

## 프로젝트 배포

### 1. 프로젝트 전송

#### 방법 A: Git Clone (권장)
```bash
# Toradex 모듈에 SSH 접속
ssh torizon@<YOUR_DEVICE_IP>

# 프로젝트 클론
cd ~
git clone <YOUR_REPOSITORY_URL> ReHAN_ESG_platform
cd ReHAN_ESG_platform
```

#### 방법 B: SCP로 전송
```bash
# 개발 머신에서 실행
scp -r /path/to/ReHAN_ESG_platform torizon@<YOUR_DEVICE_IP>:~/
```

### 2. Torizon용 Docker Compose 설정

기존 `docker-compose.yaml`을 Torizon에 맞게 수정합니다:

```bash
# Torizon용 설정 파일 생성
nano docker-compose.torizon.yaml
```

**docker-compose.torizon.yaml** 파일 내용:

```yaml
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
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      SERIAL_PORT: ${SERIAL_PORT}
      ENABLE_HARDWARE: ${ENABLE_HARDWARE}
      NODE_ENV: ${NODE_ENV}
    volumes:
      - ./backend:/app
      - /app/node_modules
    # Torizon에서는 network_mode: host 대신 포트 매핑 사용
    ports:
      - "3001:3001"
    restart: unless-stopped
    # USB 디바이스 마운트 (시리얼 통신용)
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0
    # 컨테이너에 필요한 권한 부여
    privileged: false
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
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
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
      NODE_ENV: ${NODE_ENV}
      NEXT_PUBLIC_BACKEND_URL: ${NEXT_PUBLIC_BACKEND_URL}
      NEXT_PUBLIC_SOCKET_URL: ${NEXT_PUBLIC_SOCKET_URL}
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: ${GOOGLE_MAPS_API_KEY}
    ports:
      - "80:3000"
      - "443:3000"
    restart: unless-stopped
    # nginx SSL 설정
    volumes:
      - ./ssl:/etc/nginx/ssl:ro

volumes:
  mysql_data:
    driver: local
```

### 3. 환경 변수 설정

```bash
# .env 파일 생성
nano .env
```

**.env 파일 내용**:
```bash
# 데이터베이스 설정
DB_HOST=mysql
DB_PORT=3306
DB_NAME=rehan_esg_platform
DB_USER=app_user
DB_PASSWORD=SecurePassword123!

# JWT 설정
JWT_SECRET=your_secure_jwt_secret_key_here

# 하드웨어 설정
SERIAL_PORT=/dev/ttyUSB0
ENABLE_HARDWARE=true

# Node 환경
NODE_ENV=production

# API URL (Torizon 디바이스 IP로 변경)
NEXT_PUBLIC_BACKEND_URL=http://192.168.1.100:3001
NEXT_PUBLIC_SOCKET_URL=ws://192.168.1.100:3001

# Google Maps API (선택사항)
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 4. 애플리케이션 빌드 및 실행

```bash
# 1. Docker 이미지 빌드
docker compose -f docker-compose.torizon.yaml build

# 2. 컨테이너 실행
docker compose -f docker-compose.torizon.yaml up -d

# 3. 로그 확인
docker compose -f docker-compose.torizon.yaml logs -f

# 4. 컨테이너 상태 확인
docker compose -f docker-compose.torizon.yaml ps
```

### 5. 배포 확인

```bash
# 서비스 접속 테스트
curl http://localhost:3001/health    # Backend
curl http://localhost:3000           # Frontend

# 또는 브라우저에서 접속
# http://<TORIZON_DEVICE_IP>
```

---

## 하드웨어 통합

### 1. 시리얼 포트 설정

Toradex 모듈의 시리얼 포트 확인:

```bash
# 사용 가능한 시리얼 포트 확인
ls -l /dev/tty*

# 일반적인 시리얼 포트:
# /dev/ttyUSB0  - USB to Serial 어댑터
# /dev/ttymxc0  - 온보드 UART (Verdin iMX8M Plus)
# /dev/ttyS0    - 일반 시리얼 포트
```

시리얼 포트 권한 설정:
```bash
# dialout 그룹에 사용자 추가
sudo usermod -aG dialout $USER

# 또는 직접 권한 부여
sudo chmod 666 /dev/ttyUSB0
```

### 2. USB 디바이스 연결

Docker Compose에서 USB 디바이스 자동 인식:

```yaml
services:
  backend:
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0  # USB 시리얼
      - /dev/ttyACM0:/dev/ttyACM0  # USB CDC
```

### 3. GPIO 및 하드웨어 인터페이스

Toradex 모듈의 GPIO 사용:

```bash
# GPIO 확인
cat /sys/kernel/debug/gpio

# 특정 GPIO 내보내기
echo 123 > /sys/class/gpio/export
echo out > /sys/class/gpio/gpio123/direction
echo 1 > /sys/class/gpio/gpio123/value
```

Docker 컨테이너에서 GPIO 접근:
```yaml
services:
  backend:
    volumes:
      - /sys/class/gpio:/sys/class/gpio
    privileged: true
```

---

## 네트워크 설정

### 1. 고정 IP 설정

```bash
# NetworkManager 사용
sudo nmtui

# 또는 설정 파일 직접 수정
sudo nano /etc/network/interfaces
```

**interfaces 파일 예시**:
```
auto eth0
iface eth0 inet static
    address 192.168.1.100
    netmask 255.255.255.0
    gateway 192.168.1.1
    dns-nameservers 8.8.8.8 8.8.4.4
```

### 2. 방화벽 설정

```bash
# UFW 설치 (기본적으로 설치되어 있음)
sudo apt install ufw

# 필요한 포트 허용
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw allow 3001    # Backend API

# 방화벽 활성화
sudo ufw enable

# 상태 확인
sudo ufw status
```

### 3. Wi-Fi 설정 (선택사항)

```bash
# Wi-Fi 스캔
sudo nmcli device wifi list

# Wi-Fi 연결
sudo nmcli device wifi connect "SSID_NAME" password "PASSWORD"

# 연결 확인
nmcli connection show
```

---

## 자동 시작 설정

### 1. Systemd 서비스 생성

재부팅 시 자동으로 애플리케이션 시작:

```bash
# Systemd 서비스 파일 생성
sudo nano /etc/systemd/system/rehan-esg.service
```

**rehan-esg.service** 내용:
```ini
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
```

서비스 활성화:
```bash
# 서비스 등록
sudo systemctl daemon-reload

# 자동 시작 활성화
sudo systemctl enable rehan-esg.service

# 서비스 시작
sudo systemctl start rehan-esg.service

# 상태 확인
sudo systemctl status rehan-esg.service
```

### 2. 자동 재시작 스크립트

컨테이너 장애 시 자동 재시작:

```bash
# 모니터링 스크립트 생성
nano ~/monitor_app.sh
```

**monitor_app.sh** 내용:
```bash
#!/bin/bash

cd /home/torizon/ReHAN_ESG_platform

while true; do
    # 백엔드 컨테이너 상태 확인
    if ! docker ps | grep -q petmon_backend; then
        echo "$(date): Backend down, restarting..."
        docker compose -f docker-compose.torizon.yaml restart backend
    fi
    
    # 프론트엔드 컨테이너 상태 확인
    if ! docker ps | grep -q petmon_frontend; then
        echo "$(date): Frontend down, restarting..."
        docker compose -f docker-compose.torizon.yaml restart frontend
    fi
    
    # 5분마다 체크
    sleep 300
done
```

실행 권한 부여 및 백그라운드 실행:
```bash
chmod +x ~/monitor_app.sh

# systemd 서비스로 등록 (선택사항)
sudo nano /etc/systemd/system/app-monitor.service
```

---

## 성능 최적화

### 1. Docker 이미지 최적화

멀티스테이지 빌드 사용 (이미 적용됨):
```dockerfile
# 빌드 단계
FROM ubuntu:22.04 AS builder
...

# 실행 단계 (경량화)
FROM ubuntu:22.04 AS runner
COPY --from=builder /app/.next ./.next
...
```

### 2. 메모리 제한 설정

리소스가 제한된 임베디드 환경에서:

```yaml
services:
  backend:
    mem_limit: 512m
    memswap_limit: 1g
    cpus: 1.5
  
  frontend:
    mem_limit: 256m
    memswap_limit: 512m
    cpus: 1.0
  
  mysql:
    mem_limit: 1g
    memswap_limit: 2g
    cpus: 2.0
```

### 3. 로그 로테이션

```bash
# Docker 로그 크기 제한
sudo nano /etc/docker/daemon.json
```

**daemon.json** 내용:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Docker 재시작:
```bash
sudo systemctl restart docker
```

---

## OTA 업데이트 (선택사항)

Torizon의 강력한 기능인 Over-The-Air 업데이트:

### 1. Torizon Platform 설정

```bash
# Torizon Platform 계정 생성
# https://app.torizon.io

# 디바이스 등록
sudo torizoncore-builder platform push
```

### 2. 애플리케이션 업데이트

```bash
# 새 버전 빌드
docker compose -f docker-compose.torizon.yaml build

# 이미지 태그 지정
docker tag petmon_frontend:latest <registry>/petmon_frontend:v1.0.1

# 레지스트리에 푸시
docker push <registry>/petmon_frontend:v1.0.1

# Torizon Platform에서 OTA 배포
```

---

## 백업 및 복원

### 1. 데이터 백업

```bash
# MySQL 데이터 백업
docker exec petmon_mysql mysqldump -u root -p rehan_esg_platform > backup_$(date +%Y%m%d).sql

# 볼륨 백업
docker run --rm -v rehan_esg_platform_mysql_data:/data -v $(pwd):/backup ubuntu tar czf /backup/mysql_backup.tar.gz /data
```

### 2. 데이터 복원

```bash
# MySQL 데이터 복원
docker exec -i petmon_mysql mysql -u root -p rehan_esg_platform < backup_20240101.sql

# 볼륨 복원
docker run --rm -v rehan_esg_platform_mysql_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/mysql_backup.tar.gz -C /
```

---

## 문제 해결

### 1. 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker compose -f docker-compose.torizon.yaml logs

# 특정 서비스 로그
docker compose -f docker-compose.torizon.yaml logs backend

# 컨테이너 재시작
docker compose -f docker-compose.torizon.yaml restart
```

### 2. 네트워크 연결 문제

```bash
# 네트워크 상태 확인
ip addr show
ping 8.8.8.8

# DNS 확인
cat /etc/resolv.conf
nslookup google.com

# Docker 네트워크 재생성
docker compose -f docker-compose.torizon.yaml down
docker network prune -f
docker compose -f docker-compose.torizon.yaml up -d
```

### 3. 시리얼 포트 접근 불가

```bash
# 권한 확인
ls -l /dev/ttyUSB0

# 권한 부여
sudo chmod 666 /dev/ttyUSB0

# 그룹 추가 확인
groups

# dialout 그룹 추가 후 재로그인
sudo usermod -aG dialout $USER
exit
# SSH 재접속
```

### 4. 디스크 공간 부족

```bash
# 디스크 사용량 확인
df -h

# Docker 정리
docker system prune -a --volumes

# 사용하지 않는 이미지 삭제
docker image prune -a

# 로그 정리
sudo journalctl --vacuum-time=7d
```

### 5. 메모리 부족

```bash
# 메모리 사용량 확인
free -h

# 컨테이너별 메모리 사용량
docker stats

# 불필요한 프로세스 종료
# 또는 docker-compose.torizon.yaml에서 메모리 제한 추가
```

---

## 모니터링 및 디버깅

### 1. 실시간 모니터링

```bash
# 컨테이너 상태 실시간 확인
watch docker compose -f docker-compose.torizon.yaml ps

# 리소스 사용량 모니터링
docker stats

# 시스템 리소스
htop  # 또는 top
```

### 2. 로그 모니터링

```bash
# 실시간 로그 확인
docker compose -f docker-compose.torizon.yaml logs -f

# 특정 서비스만
docker compose -f docker-compose.torizon.yaml logs -f backend

# 마지막 100줄
docker compose -f docker-compose.torizon.yaml logs --tail=100
```

### 3. 원격 접속

```bash
# SSH 터널링으로 안전한 접속
ssh -L 3000:localhost:3000 -L 3001:localhost:3001 torizon@<DEVICE_IP>

# 개발 머신 브라우저에서
# http://localhost:3000 접속
```

---

## 보안 권장사항

### 1. SSH 보안

```bash
# SSH 키 기반 인증 설정
ssh-copy-id torizon@<DEVICE_IP>

# 비밀번호 인증 비활성화
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication no 설정

sudo systemctl restart sshd
```

### 2. 기본 비밀번호 변경

```bash
# torizon 사용자 비밀번호 변경
passwd

# MySQL root 비밀번호는 .env 파일에서 변경
```

### 3. 방화벽 활성화

```bash
# 위의 "네트워크 설정" 섹션 참조
sudo ufw enable
```

---

## 체크리스트

배포 전 확인사항:

- [ ] Torizon OS 6.x 이상 설치
- [ ] Docker 및 Docker Compose 작동 확인
- [ ] 네트워크 연결 확인 (이더넷 또는 Wi-Fi)
- [ ] 시리얼 포트 권한 설정
- [ ] .env 파일 생성 및 설정
- [ ] SSL 인증서 준비 (HTTPS 사용 시)
- [ ] 방화벽 포트 개방
- [ ] 자동 시작 서비스 설정
- [ ] 백업 전략 수립

---

## 자주 묻는 질문 (FAQ)

### Q1: `apt update` 명령어가 작동하지 않습니다!

**증상**:
```bash
root@apalis-imx8-14754147:/# apt update
sh: apt: command not found
```

**원인**: Torizon OS는 일반적인 Debian/Ubuntu와 다르게 **OSTree 기반**입니다.

**해결책**:
```bash
# ❌ Torizon OS 호스트에서는 apt 사용 불가
apt update

# ✅ 방법 1: 필요한 도구는 Docker 컨테이너 안에서 설치
docker run -it --rm ubuntu:22.04 bash
# 컨테이너 내부에서
apt update && apt install <package>

# ✅ 방법 2: 영구 컨테이너 생성
docker run -d --name tools ubuntu:22.04 sleep infinity
docker exec -it tools bash
apt update && apt install vim curl wget

# ✅ 방법 3: 프로젝트의 Dockerfile에 패키지 추가
# backend/Dockerfile 또는 frontend/Dockerfile 수정
```

### Q2: git을 설치하고 싶습니다!

**증상**: Torizon OS 호스트에는 git이 기본 설치되어 있지 않습니다.

**해결책**:

#### ✅ 방법 1: Docker 컨테이너로 git 사용 (권장)

```bash
# 임시 git 컨테이너 사용
docker run -it --rm \
  -v $(pwd):/workspace \
  -w /workspace \
  alpine/git:latest \
  clone https://github.com/your-repo.git

# Ubuntu 기반 컨테이너로 git 사용
docker run -it --rm \
  -v $(pwd):/workspace \
  -w /workspace \
  ubuntu:22.04 bash

# 컨테이너 내부에서
apt update && apt install -y git
git clone https://github.com/your-repo.git
exit
```

#### ✅ 방법 2: 영구 개발 컨테이너 생성

```bash
# 개발 도구가 포함된 컨테이너 생성
cat > Dockerfile.devtools << 'EOF'
FROM ubuntu:22.04

# 타임존 설정
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Seoul

# 개발 도구 설치
RUN apt update && apt install -y \
    git \
    vim \
    curl \
    wget \
    htop \
    net-tools \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
CMD ["/bin/bash"]
EOF

# 이미지 빌드
docker build -t devtools -f Dockerfile.devtools .

# 컨테이너 실행 (프로젝트 디렉토리 마운트)
docker run -it --rm \
  -v /home/torizon:/workspace \
  --network host \
  devtools

# 컨테이너 내부에서 git 사용
cd /workspace
git clone https://github.com/your-repo.git ReHAN_ESG_platform
```

#### ✅ 방법 3: 개발 머신에서 clone 후 전송

```bash
# 개발 머신 (Mac/PC)에서 실행
git clone https://github.com/your-repo.git ReHAN_ESG_platform
cd ReHAN_ESG_platform

# Torizon 디바이스로 전송
scp -r ../ReHAN_ESG_platform torizon@<DEVICE_IP>:/home/torizon/

# 또는 rsync 사용 (더 빠름)
rsync -avz --progress ../ReHAN_ESG_platform torizon@<DEVICE_IP>:/home/torizon/
```

#### ✅ 방법 4: wget/curl로 소스코드 다운로드

```bash
# GitHub에서 zip 다운로드 (git 불필요)
cd /home/torizon
wget https://github.com/your-username/ReHAN_ESG_platform/archive/refs/heads/main.zip

# unzip 설치 (Docker 컨테이너에서)
docker run -it --rm -v $(pwd):/workspace -w /workspace ubuntu:22.04 bash
apt update && apt install -y unzip
unzip main.zip
mv ReHAN_ESG_platform-main ReHAN_ESG_platform
exit
```

#### 🎯 실전 예제: 프로젝트 Clone

```bash
# Torizon 디바이스에서 실행

# 1. 개발 컨테이너로 git clone
docker run -it --rm \
  -v /home/torizon:/workspace \
  -w /workspace \
  alpine/git:latest \
  clone https://github.com/your-username/ReHAN_ESG_platform.git

# 2. 프로젝트 디렉토리 확인
ls -la /home/torizon/ReHAN_ESG_platform

# 3. 프로젝트 실행
cd /home/torizon/ReHAN_ESG_platform
docker compose -f docker-compose.torizon.yaml up -d
```

### Q3: 파일을 편집하고 싶은데 vim/nano가 없습니다!

**해결책**:
```bash
# 방법 1: vi 사용 (기본 설치됨)
vi /path/to/file

# 방법 2: Docker 컨테이너에서 파일 편집
docker run -it --rm -v $(pwd):/workspace ubuntu:22.04 bash
apt update && apt install vim
cd /workspace
vim your-file.txt

# 방법 3: 호스트에서 echo로 파일 생성
echo "content" > file.txt
cat >> file.txt << 'EOF'
multi
line
content
EOF

# 방법 4: 개발 머신에서 편집 후 scp로 전송
# (개발 머신에서)
scp file.txt torizon@<DEVICE_IP>:/home/torizon/
```

### Q3: 시스템에 패키지를 설치하고 싶습니다

**원칙**: Torizon OS는 **호스트 OS를 불변(immutable)**으로 유지합니다.

**올바른 방법**:
```bash
# 1. Docker 컨테이너 생성
cat > Dockerfile.tools << 'EOF'
FROM ubuntu:22.04
RUN apt update && apt install -y \
    vim \
    curl \
    wget \
    git \
    htop \
    net-tools
CMD ["/bin/bash"]
EOF

docker build -t my-tools -f Dockerfile.tools .
docker run -it --rm --network host my-tools

# 2. 또는 기존 컨테이너에 설치
docker exec -it petmon_backend bash
apt update && apt install <package>
```

### Q4: 프로젝트 파일을 어디에 두어야 하나요?

**권장 위치**:
```bash
# 홈 디렉토리 (영구 저장)
/home/torizon/ReHAN_ESG_platform

# 또는 별도 파티션
/var/rootdirs/home/torizon/projects/

# ❌ 피해야 할 위치
/root/  # 재부팅 시 변경사항이 사라질 수 있음
/tmp/   # 임시 디렉토리
```

**확인 방법**:
```bash
# 현재 마운트 포인트 확인
df -h

# 영구 저장 위치 확인
ls -la /home/torizon/
```

### Q5: Docker가 "permission denied" 오류를 냅니다

**증상**:
```bash
docker ps
# permission denied while trying to connect to the Docker daemon socket
```

**해결책**:
```bash
# 1. docker 그룹에 사용자 추가
sudo usermod -aG docker $USER

# 2. 재로그인
exit
# SSH 재접속

# 3. 확인
docker ps
groups  # docker 그룹이 표시되어야 함
```

### Q6: 컨테이너 내부에서 호스트 하드웨어에 접근하고 싶습니다

**시리얼 포트 접근**:
```yaml
services:
  backend:
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0
    # 또는 privileged 모드 (주의해서 사용)
    # privileged: true
```

**GPIO 접근**:
```yaml
services:
  backend:
    devices:
      - /dev/gpiochip0:/dev/gpiochip0
    volumes:
      - /sys/class/gpio:/sys/class/gpio
```

**USB 디바이스 접근**:
```yaml
services:
  backend:
    devices:
      - /dev/bus/usb:/dev/bus/usb
    privileged: true
```

### Q7: Torizon OS 버전을 업데이트하려면?

**방법 1: Torizon Cloud (OTA 업데이트)**
```bash
# 1. 디바이스를 Torizon Cloud에 등록
# https://app.torizon.io

# 2. 업데이트 확인
sudo systemctl status aktualizr

# 3. 수동 업데이트 확인
sudo aktualizr-torizon check

# 4. 업데이트 설치
sudo aktualizr-torizon update
```

**방법 2: 새 이미지 플래시**
```bash
# Toradex Easy Installer를 사용하여 새 버전 설치
```

### Q8: 디스크 공간이 부족합니다

**확인**:
```bash
df -h
du -sh /var/lib/docker/*
docker system df
```

**정리**:
```bash
# Docker 정리 (안전)
docker system prune

# Docker 정리 (모두 삭제)
docker system prune -a --volumes

# 특정 컨테이너/이미지 삭제
docker rm <container_id>
docker rmi <image_id>

# 로그 정리
sudo journalctl --vacuum-time=7d
sudo journalctl --vacuum-size=100M
```

### Q9: 네트워크 설정을 변경하려면?

**NetworkManager 사용 (권장)**:
```bash
# TUI 인터페이스
sudo nmtui

# CLI로 Wi-Fi 연결
sudo nmcli device wifi connect "SSID" password "PASSWORD"

# 고정 IP 설정
sudo nmcli connection modify "Wired connection 1" \
    ipv4.addresses "192.168.1.100/24" \
    ipv4.gateway "192.168.1.1" \
    ipv4.dns "8.8.8.8" \
    ipv4.method "manual"

sudo nmcli connection up "Wired connection 1"
```

### Q10: 재부팅 후 변경사항이 사라집니다

**원인**: 읽기 전용 파일시스템 또는 임시 디렉토리 사용

**해결책**:
```bash
# 1. 영구 저장 위치 사용
/home/torizon/          # 사용자 홈
/var/rootdirs/home/     # 영구 저장
/etc/                   # 설정 파일 (일부만 가능)

# 2. Docker 볼륨 사용
volumes:
  my_data:
    driver: local

# 3. systemd 서비스로 등록
sudo systemctl enable my-service.service
```

---

## Torizon OS vs 일반 Linux 비교

| 기능 | 일반 Linux (Ubuntu/Debian) | Torizon OS |
|------|---------------------------|------------|
| 패키지 관리 | `apt install` | ❌ 없음 (컨테이너 사용) |
| 루트 파일시스템 | 읽기/쓰기 | **읽기 전용** |
| 애플리케이션 설치 | 직접 설치 가능 | **Docker 컨테이너만** |
| OS 업데이트 | `apt upgrade` | **OTA 업데이트** |
| 시스템 안정성 | 보통 | **매우 높음** (불변 OS) |
| 개발 편의성 | 높음 | 중간 (컨테이너 이해 필요) |
| 보안 | 보통 | **높음** (최소 공격 표면) |

---

## 추가 리소스

### Toradex 공식 문서
- [Torizon 개발자 가이드](https://developer.toradex.com/torizon)
- [Docker 컨테이너 가이드](https://developer.toradex.com/torizon/application-development/working-with-containers)
- [하드웨어 데이터시트](https://www.toradex.com/computer-on-modules)

### 커뮤니티
- [Toradex Community](https://community.toradex.com/)
- [Torizon Support](https://support.toradex.com/)

---

## 문의 및 지원

문제가 발생하면 다음을 확인하세요:
1. 로그 파일 검토
2. 위의 "문제 해결" 섹션 참조
3. Toradex 커뮤니티 포럼 검색

---

**작성일**: 2025-10-01  
**대상 OS**: Torizon OS 6.x  
**대상 하드웨어**: Toradex Verdin/Apalis ARM64 모듈

