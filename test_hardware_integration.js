#!/usr/bin/env node

/**
 * 하드웨어 통합 테스트 스크립트
 * 
 * 이 스크립트는 다음을 테스트합니다:
 * 1. 백엔드 서버 연결 상태
 * 2. 하드웨어 상태 API
 * 3. 테스트 신호 전송
 * 4. WebSocket 연결 (간접적)
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api/v1`;

// 색상 출력을 위한 ANSI 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testServerHealth() {
  log('cyan', '\n=== 서버 상태 테스트 ===');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.status === 200) {
      log('green', '✓ 서버가 정상적으로 실행중입니다');
      log('blue', `  응답: ${JSON.stringify(response.data, null, 2)}`);
      return true;
    }
  } catch (error) {
    log('red', '✗ 서버 연결 실패');
    log('red', `  에러: ${error.message}`);
    return false;
  }
}

async function testHardwareStatus() {
  log('cyan', '\n=== 하드웨어 상태 API 테스트 ===');
  
  try {
    const response = await axios.get(`${API_BASE}/hardware/status`);
    if (response.status === 200) {
      log('green', '✓ 하드웨어 상태 API 응답 성공');
      log('blue', `  Serial 연결: ${response.data.serial.isConnected ? '연결됨' : '연결 안됨'}`);
      log('blue', `  Serial 포트: ${response.data.serial.portPath || 'N/A'}`);
      log('blue', `  WebSocket 클라이언트: ${response.data.websocket.connectedClients}개`);
      return true;
    }
  } catch (error) {
    log('red', '✗ 하드웨어 상태 API 실패');
    log('red', `  에러: ${error.message}`);
    return false;
  }
}

async function testBeltSeparatorSignal() {
  log('cyan', '\n=== 띠분리 완료 신호 테스트 ===');
  
  try {
    const response = await axios.post(`${API_BASE}/hardware/test`, {
      command: 'belt_separator_complete'
    });
    
    if (response.status === 200) {
      log('green', '✓ 띠분리 완료 테스트 신호 전송 성공');
      log('blue', `  응답: ${response.data.message}`);
      return true;
    }
  } catch (error) {
    log('red', '✗ 띠분리 완료 신호 전송 실패');
    log('red', `  에러: ${error.message}`);
    return false;
  }
}

async function testHopperOpenSignal() {
  log('cyan', '\n=== 투입구 열림 신호 테스트 ===');
  
  try {
    const response = await axios.post(`${API_BASE}/hardware/test`, {
      command: 'hopper_open'
    });
    
    if (response.status === 200) {
      log('green', '✓ 투입구 열림 테스트 신호 전송 성공');
      log('blue', `  응답: ${response.data.message}`);
      return true;
    }
  } catch (error) {
    log('red', '✗ 투입구 열림 신호 전송 실패');
    log('red', `  에러: ${error.message}`);
    return false;
  }
}

async function testFullSequence() {
  log('cyan', '\n=== 전체 시퀀스 테스트 (띠분리 → 투입구 열림) ===');
  
  try {
    const response = await axios.post(`${API_BASE}/hardware/test`, {
      command: 'full_sequence'
    });
    
    if (response.status === 200) {
      log('green', '✓ 전체 시퀀스 테스트 시작');
      log('blue', `  응답: ${response.data.message}`);
      log('yellow', '  🎯 띠분리 완료 신호 전송됨');
      log('yellow', '  ⏳ 2초 후 투입구 열림 신호 전송 예정...');
      return true;
    }
  } catch (error) {
    log('red', '✗ 전체 시퀀스 테스트 실패');
    log('red', `  에러: ${error.message}`);
    return false;
  }
}

async function runTests() {
  log('cyan', '🧪 ReHAN ESG 플랫폼 하드웨어 통합 테스트 시작\n');
  
  const results = {
    server: false,
    hardware: false,
    beltSeparator: false,
    hopperOpen: false,
    fullSequence: false
  };
  
  // 1. 서버 상태 테스트
  results.server = await testServerHealth();
  
  if (!results.server) {
    log('red', '\n❌ 서버가 실행되지 않았습니다. 다음 명령어로 서버를 시작하세요:');
    log('yellow', '   cd backend && npm start');
    return;
  }
  
  await delay(1000);
  
  // 2. 하드웨어 상태 테스트
  results.hardware = await testHardwareStatus();
  await delay(1000);
  
  // 3. 띠분리 완료 신호 테스트
  results.beltSeparator = await testBeltSeparatorSignal();
  await delay(1000);
  
  // 4. 투입구 열림 신호 테스트
  results.hopperOpen = await testHopperOpenSignal();
  await delay(2000);
  
  // 5. 전체 시퀀스 테스트
  results.fullSequence = await testFullSequence();
  await delay(3000);
  
  // 결과 요약
  log('cyan', '\n=== 테스트 결과 요약 ===');
  log(results.server ? 'green' : 'red', `서버 상태: ${results.server ? '✓ 통과' : '✗ 실패'}`);
  log(results.hardware ? 'green' : 'red', `하드웨어 API: ${results.hardware ? '✓ 통과' : '✗ 실패'}`);
  log(results.beltSeparator ? 'green' : 'red', `띠분리 완료: ${results.beltSeparator ? '✓ 통과' : '✗ 실패'}`);
  log(results.hopperOpen ? 'green' : 'red', `투입구 열림: ${results.hopperOpen ? '✓ 통과' : '✗ 실패'}`);
  log(results.fullSequence ? 'green' : 'red', `전체 시퀀스: ${results.fullSequence ? '✓ 통과' : '✗ 실패'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    log('green', '\n🎉 모든 테스트가 성공했습니다!');
    log('cyan', '\n✨ 하드웨어 시퀀스 흐름:');
    log('yellow', '   1️⃣  {"belt_separator":1} → 띠분리 완료 → 투입 완료 버튼 활성화');
    log('yellow', '   2️⃣  {"hopper_open":1} → 투입구 열림 → 다음 단계 진행');
    log('cyan', '\n🚀 다음 단계:');
    log('yellow', '1. 프론트엔드 서버 실행: cd frontend && npm run dev');
    log('yellow', '2. 브라우저에서 http://localhost:3000/login 접속');
    log('yellow', '3. 로그인 후 band-split 페이지로 이동');
    log('yellow', '4. 개발자 도구에서 실시간 상태 변화 확인');
  } else {
    log('red', '\n❌ 일부 테스트가 실패했습니다. 문제 해결이 필요합니다.');
    log('cyan', '\n문제 해결 가이드:');
    log('yellow', '- HARDWARE_INTEGRATION.md 파일의 "문제 해결" 섹션 참조');
    log('yellow', '- 백엔드 콘솔 로그 확인');
    log('yellow', '- 시리얼 포트 설정 확인 (.env 파일)');
  }
}

// 메인 실행 (ES 모듈 방식)
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    log('red', `\n💥 예상치 못한 오류 발생: ${error.message}`);
    process.exit(1);
  });
}

export { runTests };