#!/bin/bash

# Deployment Script for Jetwon Orin Nano
# ARM64 환경 최적화

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 환경 변수 설정
ENVIRONMENT=${1:-production}
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

log_info "Starting deployment for environment: $ENVIRONMENT"

# 1. 백업 생성
log_info "Step 1: Creating backup"
mkdir -p "$BACKUP_DIR"

# MySQL 데이터 백업
log_info "Backing up MySQL data..."
docker-compose exec -T mysql mysqldump -u root -psrv123! petmon > "$BACKUP_DIR/mysql_backup.sql" 2>/dev/null || log_warning "MySQL backup failed"

# 환경 변수 백업
log_info "Backing up environment variables..."
cp .env "$BACKUP_DIR/" 2>/dev/null || log_warning "No .env file found"

log_success "Backup created in: $BACKUP_DIR"

# 2. 기존 서비스 중지
log_info "Step 2: Stopping existing services"
docker-compose down

# 3. 이미지 풀 및 빌드
log_info "Step 3: Pulling and building images"
docker-compose pull
docker-compose build --no-cache

# 4. 서비스 시작
log_info "Step 4: Starting services"
docker-compose up -d

# 5. 헬스 체크
log_info "Step 5: Health check"
sleep 15

# 백엔드 헬스 체크
for i in {1..5}; do
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log_success "Backend is healthy"
        break
    else
        log_warning "Backend health check attempt $i failed, retrying..."
        sleep 5
    fi
done

# 프론트엔드 헬스 체크
for i in {1..5}; do
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "Frontend is healthy"
        break
    else
        log_warning "Frontend health check attempt $i failed, retrying..."
        sleep 5
    fi
done

# 6. 성능 모니터링
log_info "Step 6: Performance monitoring"
docker stats --no-stream

log_success "Deployment completed successfully! 🎉"
log_info "Services are running on:"
log_info "Frontend: http://localhost:3000"
log_info "Backend: http://localhost:3001"
