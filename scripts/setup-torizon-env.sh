#!/bin/bash

# Torizon OS용 환경 설정 스크립트
# 각 보드의 IP 주소를 자동으로 감지하여 환경 변수를 설정합니다.

echo "========================================"
echo "Torizon OS 환경 설정"
echo "========================================"

# 현재 IP 주소 감지
echo "1. IP 주소 감지 중..."

# 여러 방법으로 IP 주소 감지
IP=""
if command -v ip >/dev/null 2>&1; then
    IP=$(ip addr show | grep 'inet ' | grep -v '127.0.0.1' | head -1 | awk '{print $2}' | cut -d/ -f1)
elif command -v ifconfig >/dev/null 2>&1; then
    IP=$(ifconfig | grep 'inet ' | grep -v '127.0.0.1' | head -1 | awk '{print $2}')
fi

# IP가 감지되지 않은 경우 기본값 사용
if [ -z "$IP" ]; then
    echo "   ⚠️ IP 자동 감지 실패, 기본값 사용"
    IP="localhost"
else
    echo "   ✅ 감지된 IP: $IP"
fi

# 환경 변수 설정
echo ""
echo "2. 환경 변수 설정..."

# .env 파일 생성
cat > .env << EOF
# ===== ReHAN ESG Platform Environment Variables =====
# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_NAME=petmon
DB_USER=root
DB_PASSWORD=srv123!

# JWT Secret
JWT_SECRET=pEtMon_rEhAN_esG_PLatFoRM_Authorization_Secret_KEY

# Hardware Configuration
SERIAL_PORT=/dev/ttyUSB0
ENABLE_HARDWARE=false

# Node Environment
NODE_ENV=development

# Frontend URLs (자동 감지된 IP 사용)
NEXT_PUBLIC_BACKEND_URL=http://$IP:3001
NEXT_PUBLIC_SOCKET_URL=ws://$IP:3001

# Google Maps API Key
GOOGLE_MAPS_API_KEY=AIzaSyDNEghHTtMne3FIsRdJ4lRj9uoN4O_Zqls
# =====================================================
EOF

echo "   ✅ .env 파일 생성 완료"

# bashrc 업데이트
echo ""
echo "3. .bashrc 업데이트..."

# 기존 환경 변수 제거
sed -i '/# ===== ReHAN ESG Platform Environment Variables =====/,/# =====================================================/d' ~/.bashrc

# 새로운 환경 변수 추가
cat >> ~/.bashrc << EOF

# ===== ReHAN ESG Platform Environment Variables =====
# Database Configuration
export DB_HOST=mysql
export DB_PORT=3306
export DB_NAME=petmon
export DB_USER=root
export DB_PASSWORD=srv123!

# JWT Secret
export JWT_SECRET=pEtMon_rEhAN_esG_PLatFoRM_Authorization_Secret_KEY

# Hardware Configuration
export SERIAL_PORT=/dev/ttyUSB0
export ENABLE_HARDWARE=false

# Node Environment
export NODE_ENV=development

# Frontend URLs (자동 감지된 IP 사용)
export NEXT_PUBLIC_BACKEND_URL=http://$IP:3001
export NEXT_PUBLIC_SOCKET_URL=ws://$IP:3001

# Google Maps API Key
export GOOGLE_MAPS_API_KEY=AIzaSyDNEghHTtMne3FIsRdJ4lRj9uoN4O_Zqls
# =====================================================
EOF

echo "   ✅ .bashrc 업데이트 완료"

# 환경 변수 적용
echo ""
echo "4. 환경 변수 적용..."
source ~/.bashrc

# 설정 확인
echo ""
echo "5. 설정 확인:"
echo "   DB_HOST: $DB_HOST"
echo "   NEXT_PUBLIC_BACKEND_URL: $NEXT_PUBLIC_BACKEND_URL"
echo "   NEXT_PUBLIC_SOCKET_URL: $NEXT_PUBLIC_SOCKET_URL"
echo "   감지된 IP: $IP"

echo ""
echo "========================================"
echo "✅ 환경 설정 완료!"
echo "========================================"
echo ""
echo "다음 명령어로 프로젝트를 시작하세요:"
echo "  docker compose -f docker-compose.torizon.yaml up -d --build"
echo ""
echo "접속 URL: http://$IP"
echo "Backend API: http://$IP:3001"
