# 하드웨어 연결 설정 가이드

## USB 디바이스 없이 실행하기

USB 디바이스가 연결되지 않은 상태에서도 애플리케이션을 실행할 수 있습니다.

### 방법 1: 환경 변수로 비활성화
```bash
ENABLE_HARDWARE=false docker compose up
```

### 방법 2: 오버라이드 파일 사용
```bash
# docker-compose.override.yaml 파일이 자동으로 적용됩니다
docker compose up
```

### 방법 3: 하드웨어 연결 시
```bash
# 하드웨어가 연결된 경우
docker compose -f docker-compose.yaml -f docker-compose.hardware.yaml up
```

## 환경 변수 설명

- `ENABLE_HARDWARE`: 하드웨어 활성화 여부 (true/false)
  - `true`: 시리얼 포트 연결 시도
  - `false`: 시리얼 포트 연결 없이 실행

- `SERIAL_PORT`: 시리얼 포트 경로 (기본값: /dev/ttyUSB0)

## 문제 해결

### USB 디바이스가 없을 때 에러가 발생하는 경우
1. `ENABLE_HARDWARE=false` 환경 변수 설정
2. 또는 `docker-compose.override.yaml` 파일 사용

### 권한 문제가 발생하는 경우
```bash
sudo chmod 666 /dev/ttyUSB0
```

## 개발 모드
개발 환경에서는 자동으로 테스트 모드가 활성화되어 하드웨어 없이도 실행됩니다.
