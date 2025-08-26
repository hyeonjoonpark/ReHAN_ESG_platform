# CI/CD Pipeline for PETMON Platform

Jetwon Orin Nano (ARM64) 환경에서 실행되는 CI/CD 파이프라인입니다.

## 🚀 빠른 시작

### 1. CI/CD 파이프라인 실행
```bash
# 전체 CI/CD 파이프라인 실행
./scripts/ci.sh

# 배포만 실행
./scripts/deploy.sh

# 시스템 모니터링
./scripts/monitor.sh
```

### 2. 자동 배포 활성화
```bash
# 환경 변수 설정으로 자동 배포 활성화
export AUTO_DEPLOY=true
```

## 📁 파일 구조

```
scripts/
├── ci.sh          # CI/CD 파이프라인
├── deploy.sh      # 배포 스크립트
└── monitor.sh     # 모니터링 스크립트

.git/hooks/
├── pre-commit     # 커밋 전 코드 품질 검사
└── post-commit    # 커밋 후 자동 배포

docker-compose.prod.yml  # 프로덕션 환경 설정
nginx.conf               # Nginx 리버스 프록시 설정
ssl/                     # SSL 인증서
backups/                 # 백업 파일
```

## 🔧 CI/CD 파이프라인 단계

### 1. 코드 품질 검사
- TypeScript 타입 체크
- ESLint 검사
- Prettier 포맷팅 검사

### 2. 테스트 실행
- Frontend 테스트
- Backend 테스트
- 통합 테스트

### 3. 빌드 및 배포
- Docker 이미지 빌드
- 컨테이너 재시작
- 헬스 체크

### 4. 모니터링
- 시스템 리소스 모니터링
- 컨테이너 상태 확인
- 애플리케이션 헬스 체크

## 🛠️ 환경별 설정

### 개발 환경
```bash
# 개발 환경 실행
docker-compose up -d
```

### 프로덕션 환경
```bash
# 프로덕션 환경 실행
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 모니터링

### 시스템 리소스
- CPU 사용률
- 메모리 사용률
- 디스크 사용률
- 온도 (Jetson 특화)

### 애플리케이션 상태
- Frontend 헬스 체크
- Backend 헬스 체크
- MySQL 헬스 체크

### 로그 모니터링
- 최근 에러 로그
- 컨테이너 로그

## 🔒 보안

### SSL/TLS
- 자체 서명 인증서 사용
- HTTPS 강제 리다이렉트
- 보안 헤더 설정

### 환경 변수
- 민감한 정보는 환경 변수로 관리
- `.env` 파일은 Git에서 제외

## 📦 백업

### 자동 백업
- MySQL 데이터베이스 백업
- 환경 변수 백업
- 타임스탬프 기반 백업 디렉토리

### 백업 복원
```bash
# MySQL 백업 복원
docker-compose exec -T mysql mysql -u root -psrv123! petmon < backups/mysql_backup.sql
```

## 🚨 문제 해결

### 일반적인 문제들

1. **포트 충돌**
   ```bash
   # 포트 사용 확인
   sudo netstat -tulpn | grep :3000
   ```

2. **권한 문제**
   ```bash
   # 스크립트 실행 권한 부여
   chmod +x scripts/*.sh
   ```

3. **Docker 문제**
   ```bash
   # Docker 서비스 재시작
   sudo systemctl restart docker
   ```

### 로그 확인
```bash
# 컨테이너 로그 확인
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f frontend
docker-compose logs -f backend
```

## 🔄 자동화

### Git Hooks
- `pre-commit`: 코드 품질 검사
- `post-commit`: 자동 배포 (선택적)

### 스케줄링
```bash
# crontab에 모니터링 추가
0 */6 * * * /path/to/scripts/monitor.sh >> /var/log/monitoring.log 2>&1
```

## 📈 성능 최적화

### ARM64 최적화
- ARM64 호환 이미지 사용
- 리소스 사용량 최적화
- Jetson 특화 설정

### Docker 최적화
- 멀티 스테이지 빌드
- 이미지 크기 최소화
- 레이어 캐싱 활용

## 🤝 기여

1. 코드 변경
2. 테스트 실행: `./scripts/ci.sh`
3. 커밋 및 푸시
4. 자동 배포 확인

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 시스템 리소스 상태
2. 컨테이너 로그
3. 네트워크 연결
4. 권한 설정
