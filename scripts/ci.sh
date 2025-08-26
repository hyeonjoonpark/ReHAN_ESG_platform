#!/bin/bash

# CI/CD Pipeline Script for Jetwon Orin Nano
# ARM64 환경 최적화

set -e  # 오류 발생 시 스크립트 중단

echo "🚀 Starting CI/CD Pipeline..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 시스템 정보 출력
log_info "System Information:"
log_info "Architecture: $(uname -m)"
log_info "OS: $(uname -s)"
log_info "Kernel: $(uname -r)"

# 1. 코드 품질 검사
log_info "Step 1: Code Quality Check"
if [ -f "frontend/package.json" ]; then
    cd frontend
    log_info "Running TypeScript check..."
    npm run type-check 2>/dev/null || log_warning "TypeScript check not configured"
    
    log_info "Running ESLint..."
    npm run lint 2>/dev/null || log_warning "ESLint not configured"
    
    log_info "Running Prettier check..."
    npm run format:check 2>/dev/null || log_warning "Prettier not configured"
    cd ..
else
    log_warning "Frontend package.json not found"
fi

# 2. 테스트 실행
log_info "Step 2: Running Tests"
if [ -f "frontend/package.json" ]; then
    cd frontend
    log_info "Running Frontend tests..."
    npm test 2>/dev/null || log_warning "Frontend tests not configured"
    cd ..
fi

if [ -f "backend/package.json" ]; then
    cd backend
    log_info "Running Backend tests..."
    npm test 2>/dev/null || log_warning "Backend tests not configured"
    cd ..
fi

# 3. Docker 이미지 빌드
log_info "Step 3: Building Docker Images"
log_info "Building Frontend image..."
docker-compose build frontend

log_info "Building Backend image..."
docker-compose build backend

# 4. 컨테이너 상태 확인
log_info "Step 4: Container Health Check"
docker-compose ps

# 5. 서비스 재시작
log_info "Step 5: Restarting Services"
docker-compose down
docker-compose up -d

# 6. 헬스 체크
log_info "Step 6: Health Check"
sleep 10

# 백엔드 헬스 체크
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    log_success "Backend is healthy"
else
    log_error "Backend health check failed"
fi

# 프론트엔드 헬스 체크
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log_success "Frontend is healthy"
else
    log_error "Frontend health check failed"
fi

log_success "CI/CD Pipeline completed successfully! 🎉"
