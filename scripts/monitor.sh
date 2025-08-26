#!/bin/bash

# Monitoring Script for Jetwon Orin Nano
# ARM64 환경 최적화

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

# 시스템 리소스 모니터링
monitor_system() {
    log_info "=== System Resources ==="
    
    # CPU 사용률
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    log_info "CPU Usage: ${CPU_USAGE}%"
    
    # 메모리 사용률
    MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
    log_info "Memory Usage: ${MEMORY_USAGE}%"
    
    # 디스크 사용률
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1)
    log_info "Disk Usage: ${DISK_USAGE}%"
    
    # 온도 (Jetson 특화)
    if [ -f "/sys/class/thermal/thermal_zone0/temp" ]; then
        TEMP=$(cat /sys/class/thermal/thermal_zone0/temp)
        TEMP_C=$((TEMP / 1000))
        log_info "Temperature: ${TEMP_C}°C"
    fi
}

# Docker 컨테이너 모니터링
monitor_containers() {
    log_info "=== Docker Containers ==="
    
    # 실행 중인 컨테이너 수
    RUNNING_CONTAINERS=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -v "NAMES")
    if [ -n "$RUNNING_CONTAINERS" ]; then
        echo "$RUNNING_CONTAINERS"
    else
        log_warning "No running containers found"
    fi
    
    # 컨테이너 리소스 사용량
    log_info "Container Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# 애플리케이션 헬스 체크
health_check() {
    log_info "=== Application Health Check ==="
    
    # 백엔드 헬스 체크
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log_success "Backend: Healthy"
    else
        log_error "Backend: Unhealthy"
    fi
    
    # 프론트엔드 헬스 체크
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "Frontend: Healthy"
    else
        log_error "Frontend: Unhealthy"
    fi
    
    # MySQL 헬스 체크
    if docker-compose exec -T mysql mysqladmin ping -h localhost -u root -psrv123! > /dev/null 2>&1; then
        log_success "MySQL: Healthy"
    else
        log_error "MySQL: Unhealthy"
    fi
}

# 로그 모니터링
monitor_logs() {
    log_info "=== Recent Logs ==="
    
    # 최근 에러 로그
    log_info "Recent Error Logs:"
    docker-compose logs --tail=10 --timestamps | grep -i error || log_info "No recent errors found"
}

# 메인 모니터링 함수
main() {
    echo "🔍 System Monitoring - $(date)"
    echo "=================================="
    
    monitor_system
    echo
    monitor_containers
    echo
    health_check
    echo
    monitor_logs
    echo
    log_info "Monitoring completed at $(date)"
}

# 스크립트 실행
main
