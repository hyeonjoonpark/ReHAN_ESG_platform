# 하드웨어 통합 가이드

## 개요
이 가이드는 ReHAN ESG 플랫폼에서 하드웨어와의 SerialPort 통신 및 실시간 WebSocket 연동 구현에 대해 설명합니다.

## 구현된 기능

### 1. 로그인 → 띠분리 페이지 이동
- 로그인 성공 시 `/band-split` 페이지로 자동 이동
- 사용자 정보 확인 후 페이지 전환

### 2. 하드웨어 통신
- **SerialPort**: 하드웨어와 직렬 통신
- **WebSocket**: 실시간 데이터 전송
- **데이터 형식**: `{"belt_separator":1}` 수신 시 띠분리 완료 처리

### 3. 실시간 버튼 활성화
- 하드웨어에서 띠분리 완료 신호 수신 시
- `투입 완료` 버튼이 즉시 활성화
- 실시간 상태 변경 반영

## 아키텍처

```
하드웨어 → SerialPort → 백엔드 파싱 → WebSocket → 프론트엔드 → 버튼 활성화
```

## 설치 및 설정

### 1. 백엔드 의존성 설치
```bash
cd backend
npm install
```

### 2. 프론트엔드 의존성 설치
```bash
cd frontend
npm install
```

### 3. 환경 변수 설정
`.env` 파일 생성 (backend 폴더):
```env
# 시리얼 포트 설정
SERIAL_PORT=/dev/ttyUSB0
SERIAL_BAUD_RATE=115200

# 기타 설정
PORT=3001
NODE_ENV=development
```

## 실행 방법

### 1. 백엔드 서버 실행
```bash
cd backend
npm start
```

### 2. 프론트엔드 서버 실행
```bash
cd frontend
npm run dev
```

## 테스트 방법

### 1. 하드웨어 없이 테스트 (개발용)
백엔드에서 제공하는 테스트 API 사용:

```bash
curl -X POST http://localhost:3001/api/v1/hardware/test \
  -H "Content-Type: application/json" \
  -d '{"command": "belt_separator_complete"}'
```

### 2. 실제 하드웨어 테스트
1. 하드웨어를 시리얼 포트에 연결
2. 환경 변수에서 올바른 포트 설정
3. 하드웨어에서 `{"belt_separator":1}` 데이터 전송

### 3. 브라우저에서 확인
1. `http://localhost:3000/login` 접속
2. 로그인 후 `http://localhost:3000/band-split` 이동
3. 개발자 도구 콘솔에서 WebSocket 연결 확인
4. 테스트 API 호출 또는 하드웨어 신호 전송
5. '투입 완료' 버튼 활성화 확인

## 주요 파일 구조

### 백엔드
- `backend/src/serial/serialHandler.js`: 시리얼 포트 통신 처리
- `backend/src/socket/socketHandler.js`: WebSocket 서버 관리
- `backend/index.js`: 메인 서버 및 통합 설정

### 프론트엔드
- `frontend/src/hooks/useSocket.ts`: WebSocket 클라이언트 훅
- `frontend/src/app/band-split/page.tsx`: 띠분리 페이지 (버튼 활성화)
- `frontend/src/app/login/page.tsx`: 로그인 페이지

## 디버깅

### 1. WebSocket 연결 상태 확인
개발 모드에서 band-split 페이지 우측 상단에 상태 표시:
- WebSocket 연결 상태
- 띠분리 완료 상태
- 마지막 신호 수신 시간

### 2. 콘솔 로그 확인
**백엔드 콘솔:**
- 시리얼 포트 연결 상태
- 수신된 데이터 로그
- WebSocket 클라이언트 연결 상태

**프론트엔드 콘솔:**
- WebSocket 연결 이벤트
- 하드웨어 상태 변경 이벤트
- 버튼 활성화 로직

### 3. API 엔드포인트 확인
```bash
# 하드웨어 상태 확인
curl http://localhost:3001/api/v1/hardware/status

# 응답 예시:
{
  "serial": {
    "isConnected": true,
    "portPath": "/dev/ttyUSB0",
    "baudRate": 115200
  },
  "websocket": {
    "connectedClients": 1
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 문제 해결

### 1. 시리얼 포트 연결 실패
- 포트 경로 확인: `/dev/ttyUSB0`, `/dev/ttyACM0` 등
- 권한 확인: `sudo chmod 666 /dev/ttyUSB0`
- 하드웨어 연결 상태 확인

### 2. WebSocket 연결 실패
- CORS 설정 확인
- 방화벽 설정 확인
- 포트 충돌 확인 (3001번 포트)

### 3. 버튼이 활성화되지 않음
- 브라우저 콘솔에서 WebSocket 연결 확인
- 하드웨어 데이터 형식 확인: `{"belt_separator":1}`
- 백엔드 로그에서 데이터 수신 확인

## 향후 개선사항
- [ ] 하드웨어 상태 영속성 저장
- [ ] 다중 하드웨어 신호 처리
- [ ] 에러 복구 메커니즘
- [ ] 실시간 모니터링 대시보드