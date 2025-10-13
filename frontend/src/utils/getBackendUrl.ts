/**
 * Backend URL을 동적으로 가져오는 유틸리티 함수
 * 환경 변수 또는 자동 감지를 통해 Backend URL을 결정합니다.
 */

/**
 * 현재 호스트의 IP 주소를 자동으로 감지합니다.
 * @returns Promise<string> - 감지된 IP 주소 또는 localhost
 */
export const getCurrentHostIP = async (): Promise<string> => {
  try {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') {
      return 'localhost';
    }

    // 현재 페이지의 호스트 정보 사용
    const hostname = window.location.hostname;
    
    // localhost가 아닌 경우 해당 IP 사용
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return hostname;
    }

    // localhost인 경우 항상 localhost 반환 (포트 정보 제거)
    return 'localhost';
  } catch (error) {
    console.warn('IP 자동 감지 실패:', error);
    return 'localhost';
  }
};

/**
 * Backend URL을 가져옵니다.
 * 1. 환경 변수 NEXT_PUBLIC_BACKEND_URL 사용
 * 2. 자동 IP 감지
 * 3. 기본값 localhost:3001
 */
export const getBackendUrl = async (): Promise<string> => {
  // 환경 변수가 설정된 경우 사용
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  // 자동 IP 감지
  const detectedIP = await getCurrentHostIP();
  
  // 감지된 IP가 localhost가 아닌 경우 해당 IP 사용
  if (detectedIP !== 'localhost') {
    return `http://${detectedIP}:3001`;
  }

  // 기본값
  return 'http://localhost:3001';
};

/**
 * WebSocket URL을 가져옵니다.
 * 1. 환경 변수 NEXT_PUBLIC_SOCKET_URL 사용
 * 2. Backend URL 기반으로 WebSocket URL 생성
 */
export const getSocketUrl = async (): Promise<string> => {
  // 환경 변수가 설정된 경우 사용
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  // Backend URL 기반으로 WebSocket URL 생성
  const backendUrl = await getBackendUrl();
  return backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
};

/**
 * 개발/프로덕션 환경에 따른 기본 설정
 */
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    isDevelopment,
    defaultBackendUrl: isDevelopment ? 'http://localhost:3001' : 'http://localhost:3001',
    defaultSocketUrl: isDevelopment ? 'ws://localhost:3001' : 'ws://localhost:3001',
  };
};
