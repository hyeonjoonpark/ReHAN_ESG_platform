# Torizon OS 멀티 보드 배포 가이드

여러 개의 Torizon 보드에 ReHAN ESG Platform을 배포하는 방법을 설명합니다.

## 🎯 개요

이 가이드는 다음 보드들에서 동작하도록 설계되었습니다:
- **Apalis iMX8** (기본)
- **Jetson Orin Nano** 
- **Colibri iMX8**
- **기타 Torizon OS 지원 보드**

## 🔧 자동 환경 설정

### 1. 스크립트 실행

```bash
# 프로젝트 디렉토리로 이동
cd /home/torizon/ReHAN_ESG_platform

# 자동 환경 설정 스크립트 실행
./scripts/setup-torizon-env.sh
```

이 스크립트는 다음을 자동으로 수행합니다:
- 현재 보드의 IP 주소 자동 감지
- 환경 변수 설정 (`.env` 파일 생성)
- `.bashrc` 업데이트
- Frontend/Backend URL 자동 설정

### 2. 수동 설정 (선택사항)

특정 IP를 사용하고 싶은 경우:

```bash
# .env 파일 직접 편집
nano .env

# 또는 환경 변수 직접 설정
export NEXT_PUBLIC_BACKEND_URL=http://192.168.1.100:3001
export NEXT_PUBLIC_SOCKET_URL=ws://192.168.1.100:3001
```

## 🚀 배포 방법

### 방법 1: 자동 설정 후 배포

```bash
# 1. 환경 설정
./scripts/setup-torizon-env.sh

# 2. 프로젝트 시작
docker compose -f docker-compose.torizon.yaml up -d --build

# 3. 상태 확인
docker compose -f docker-compose.torizon.yaml ps
```

### 방법 2: 하드웨어 포함 배포

```bash
# 하드웨어가 연결된 경우
docker compose -f docker-compose.torizon.yaml -f docker-compose.hardware-torizon.yaml up -d --build
```

## 📋 보드별 특수 설정

### Apalis iMX8
```bash
# 온보드 UART 사용
export SERIAL_PORT=/dev/ttymxc0
export ENABLE_HARDWARE=true
```

### Jetson Orin Nano
```bash
# USB Serial 사용
export SERIAL_PORT=/dev/ttyUSB0
export ENABLE_HARDWARE=true
```

### Colibri iMX8
```bash
# USB Serial 사용
export SERIAL_PORT=/dev/ttyUSB0
export ENABLE_HARDWARE=true
```

## 🔍 문제 해결

### IP 주소 확인
```bash
# 현재 IP 확인
ip addr show
# 또는
ifconfig

# 환경 변수 확인
echo $NEXT_PUBLIC_BACKEND_URL
echo $NEXT_PUBLIC_SOCKET_URL
```

### 연결 테스트
```bash
# Backend API 테스트
curl http://$(hostname -I | awk '{print $1}'):3001/api/health

# Frontend 접속 테스트
curl http://$(hostname -I | awk '{print $1}')
```

### 로그 확인
```bash
# 모든 서비스 로그
docker compose -f docker-compose.torizon.yaml logs -f

# 특정 서비스 로그
docker logs petmon_frontend
docker logs petmon_backend
docker logs petmon_mysql
```

## 🌐 네트워크 설정

### 방화벽 설정 (필요시)
```bash
# Torizon OS는 기본적으로 방화벽이 비활성화되어 있음
# 필요시 iptables 사용
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
```

### 외부 접속 허용
```bash
# 모든 인터페이스에서 접속 허용
export NEXT_PUBLIC_BACKEND_URL=http://0.0.0.0:3001
export NEXT_PUBLIC_SOCKET_URL=ws://0.0.0.0:3001
```

## 📊 모니터링

### 시스템 리소스 확인
```bash
# CPU/메모리 사용량
docker stats

# 디스크 사용량
df -h

# 네트워크 연결
netstat -tlnp
```

### 서비스 상태 확인
```bash
# 컨테이너 상태
docker compose -f docker-compose.torizon.yaml ps

# 서비스 헬스체크
docker exec petmon_mysql mysqladmin ping -h localhost -psrv123!
curl http://localhost:3001/api/health
```

## 🔄 업데이트 방법

### 코드 업데이트
```bash
# Git에서 최신 코드 가져오기
git pull origin main

# 환경 재설정
./scripts/setup-torizon-env.sh

# 서비스 재시작
docker compose -f docker-compose.torizon.yaml down
docker compose -f docker-compose.torizon.yaml up -d --build
```

### 데이터베이스 업데이트
```bash
# SQL 스크립트 실행
docker exec -i petmon_mysql mysql -u root -psrv123! petmon < backend/sql/update.sql
```

## 📝 환경 변수 참조

| 변수명 | 설명 | 기본값 | 예시 |
|--------|------|--------|------|
| `DB_HOST` | MySQL 호스트 | `mysql` | `mysql` |
| `DB_PORT` | MySQL 포트 | `3306` | `3306` |
| `DB_NAME` | 데이터베이스명 | `petmon` | `petmon` |
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | 자동 감지 | `http://192.168.1.100:3001` |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket URL | 자동 감지 | `ws://192.168.1.100:3001` |
| `SERIAL_PORT` | 시리얼 포트 | `/dev/ttyUSB0` | `/dev/ttymxc0` |
| `ENABLE_HARDWARE` | 하드웨어 활성화 | `false` | `true` |

## 🆘 지원

문제가 발생한 경우:
1. 로그 확인: `docker logs <container_name>`
2. 환경 변수 확인: `env | grep NEXT_PUBLIC`
3. 네트워크 연결 확인: `curl http://localhost:3001`
4. 이슈 리포트: GitHub Issues

---

**참고**: 이 가이드는 Torizon OS 6.x 기준으로 작성되었습니다. 다른 버전의 경우 일부 명령어가 다를 수 있습니다.
