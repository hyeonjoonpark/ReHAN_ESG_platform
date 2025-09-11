/**
 * @file useSocket.ts
 * @description WebSocket을 통한 하드웨어 상태 관리 커스텀 훅
 * 
 * 이 파일은 ReHAN ESG 플랫폼의 하드웨어 장비(시리얼 통신)와
 * 프론트엔드 간의 실시간 통신을 담당하는 React 훅을 제공합니다.
 * 
 * 주요 기능:
 * - Socket.IO를 통한 백엔드 WebSocket 서버와의 실시간 연결
 * - 하드웨어 상태 이벤트 수신 및 상태 관리
 * - 띠분리기 및 투입구 상태 추적
 * - 페이지별 룸 기능으로 특정 페이지에만 이벤트 전송
 * 
 * @author ReHAN ESG Platform Team
 * @version 1.0.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * 하드웨어 상태 정보 타입
 * 백엔드에서 전송되는 하드웨어 이벤트 데이터 구조
 */
interface HardwareStatus {
  type: string; // 하드웨어 이벤트 타입 (예: 'belt_separator_complete', 'hopper_open')
  data: Record<string, unknown>; // 하드웨어 데이터 (JSON 객체)
  timestamp: string; // 이벤트 발생 시간 (ISO 형식)
}

/**
 * useSocket 훅의 반환 타입
 * WebSocket 연결 및 하드웨어 상태 관리 기능을 제공
 */
interface UseSocketReturn {
  socket: Socket | null; // Socket.IO 클라이언트 인스턴스
  isConnected: boolean; // WebSocket 연결 상태
  beltSeparatorCompleted: boolean; // 띠분리 완료 상태
  hopperOpened: boolean; // 투입구 열림 상태
  petInserted: boolean; // 페트병 투입 상태
  normallyEnd: boolean; // 정상 종료 상태
  hardwareStatus: HardwareStatus | null; // 최근 하드웨어 상태 데이터
  connect: () => void; // WebSocket 연결 함수
  disconnect: () => void; // WebSocket 연결 해제 함수
  joinPage: (page: string) => void; // 특정 페이지 룸 참여 함수
  leavePage: (page: string) => void; // 특정 페이지 룸 나가기 함수
  requestHardwareStatus: () => void; // 현재 하드웨어 상태 요청 함수
  resetFlags: () => void; // 내부 플래그 초기화 함수
}

/**
 * WebSocket을 통한 하드웨어 상태 관리 훅
 * 
 * 이 훅은 다음 기능을 제공합니다:
 * - 백엔드 서버와 WebSocket 연결 관리
 * - 하드웨어 상태 실시간 수신 및 관리
 * - 페이지별 룸 기능으로 특정 페이지에만 이벤트 전송
 * - 띠분리 및 투입구 상태 추적
 * 
 * @returns UseSocketReturn 객체 (연결 상태, 하드웨어 상태, 제어 함수들)
 */
export const useSocket = (): UseSocketReturn => {
  // WebSocket 연결 상태 관리
  const [isConnected, setIsConnected] = useState(false);
  
  // 하드웨어 상태 관리
  const [beltSeparatorCompleted, setBeltSeparatorCompleted] = useState(false); // 띠분리 완료 상태
  const [hopperOpened, setHopperOpened] = useState(false); // 투입구 열림 상태
  const [petInserted, setPetInserted] = useState(false); // 페트병 투입 상태
  const [normallyEnd, setNormallyEnd] = useState(false); // 정상 종료 상태
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus | null>(null); // 최근 하드웨어 이벤트
  
  // Socket.IO 클라이언트 참조 저장
  const socketRef = useRef<Socket | null>(null);
  
  // 백엔드 서버 URL (환경변수 또는 기본값)
  const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

  /**
   * WebSocket 서버에 연결하는 함수
   * 이미 연결되어 있으면 무시하고, 새로운 연결을 생성하여 이벤트 리스너를 설정합니다.
   */
  const connect = useCallback(() => {
    // 이미 연결되어 있으면 중복 연결 방지
    if (socketRef.current?.connected) return;

    // Socket.IO 클라이언트 생성 및 연결
    socketRef.current = io(serverUrl, {
      withCredentials: true, // 인증 정보 포함
      transports: ['websocket', 'polling'], // 전송 방식 (WebSocket 우선, Polling 대체)
    });

    // 연결 성공 시 상태 업데이트
    socketRef.current.on('connect', () => setIsConnected(true));
    
    // 연결 해제 시 상태 업데이트
    socketRef.current.on('disconnect', () => setIsConnected(false));
    
    // 투입구 준비 완료 이벤트 수신 처리
    socketRef.current.on('hopper_ready', (data) => {
      console.log('✅ 투입구 준비 완료 이벤트 수신:', data);
      console.log('🔧 투입구 열림 상태 설정 중...');
      setHopperOpened(true);
      console.log('✅ 투입구 열림 상태 설정 완료');
    });
    
    // 하드웨어 상태 이벤트 수신 처리
    socketRef.current.on('hardware_status', (data: HardwareStatus) => {
      setHardwareStatus(data); // 최근 하드웨어 상태 저장
      
      // 띠분리 완료 이벤트 처리 - 즉시 상태 변경
      if (data.type === 'belt_separator_complete') {
        console.log('✅ 띠분리 완료 데이터 수신:', data);
        console.log('🔧 띠분리 완료 상태 설정 중...');
        setBeltSeparatorCompleted(true);
        console.log('✅ 띠분리 완료 상태 설정 완료');
        // 투입구 열림 상태는 투입구가 실제로 열린 후에만 설정
      }

      // belt_separator: 1 데이터 처리 (새로운 띠 분리 시작 시에만 상태 초기화) - 즉시 상태 변경
      if (data.type === 'belt_separator' && data.data && typeof data.data === 'object' && 'value' in data.data && data.data.value === 1) {
        console.log('🔄 belt_separator: 1 수신 - 즉시 새로운 띠 분리 시작');
        // 정상 종료 상태가 아닐 때만 상태 초기화 (정상 배출 완료 후에는 초기화하지 않음)
        setBeltSeparatorCompleted(false); // 띠분리 상태 초기화
        setHopperOpened(false); // 투입구 상태 초기화
        setPetInserted(false); // 페트병 투입 상태 초기화
        // normallyEnd는 정상 배출 완료 후에는 초기화하지 않음
      }

      // 투입구 열림 이벤트 처리 - 즉시 상태 변경
      if (data.type === 'hopper_opened') {
        console.log('✅ 투입구 열림 데이터 수신 - 즉시 상태 변경');
        setHopperOpened(true);
      }

      // 페트병 투입 이벤트 처리 - 즉시 상태 변경
      if (data.type === 'pet_inserted') {
        console.log('✅ 페트병 투입 데이터 수신 - 즉시 상태 변경');
        setPetInserted(true);
      }
      
      // 정상 종료 이벤트 처리 - 즉시 상태 변경
      if (data.type === 'normally_end') {
        console.log('✅ 정상 종료 데이터 수신 - 즉시 상태 변경');
        setNormallyEnd(true);
      }
    });
  }, [serverUrl]);

  /**
   * WebSocket 연결을 해제하는 함수
   * 서버와의 연결을 끊고 연결 상태를 false로 설정합니다.
   */
  const disconnect = () => {
    socketRef.current?.disconnect(); // 소켓 연결 해제
    setIsConnected(false); // 연결 상태 업데이트
  };

  /**
   * 특정 페이지 룸에 참여하는 함수
   * 백엔드에서 해당 페이지에 특화된 이벤트를 수신할 수 있게 됩니다.
   * 
   * @param page 참여할 페이지 이름 (예: 'band-split', 'repair')
   */
  const joinPage = (page: string) => {
    socketRef.current?.emit('join_page', { page });
  };

  /**
   * 특정 페이지 룸에서 나가는 함수
   * 해당 페이지의 이벤트 수신을 중단합니다.
   * 
   * @param page 나갈 페이지 이름
   */
  const leavePage = (page: string) => {
    socketRef.current?.emit('leave_page', { page });
  };

  /**
   * 현재 하드웨어 상태를 백엔드에 요청하는 함수
   * 백엔드에서 저장된 현재 하드웨어 상태를 응답으로 받습니다.
   */
  const requestHardwareStatus = () => {
    socketRef.current?.emit('request_hardware_status');
  };

  /**
   * 컴포넌트 마운트 시 자동으로 WebSocket 연결을 시작하고,
   * 언마운트 시 연결을 해제하는 Effect
   */
  useEffect(() => {
    connect(); // 컴포넌트 마운트 시 연결
    return () => disconnect(); // 컴포넌트 언마운트 시 연결 해제
  }, [connect]);

  /**
   * 플래그 초기화: 다음 사이클을 belt_separator부터 다시 받기 위해 상태를 비움
   */
  const resetFlags = useCallback(() => {
    setBeltSeparatorCompleted(false);
    setHopperOpened(false);
    setPetInserted(false);
    setNormallyEnd(false);
    setHardwareStatus(null);
  }, []);

  // 훅에서 제공하는 상태와 함수들을 반환
  return {
    socket: socketRef.current, // Socket.IO 클라이언트 인스턴스
    isConnected, // WebSocket 연결 상태
    beltSeparatorCompleted, // 띠분리 완료 상태
    hopperOpened, // 투입구 열림 상태
    petInserted,
    normallyEnd,
    hardwareStatus, // 최근 하드웨어 상태 데이터
    connect, // WebSocket 연결 함수
    disconnect, // WebSocket 연결 해제 함수
    joinPage, // 페이지 룸 참여 함수
    leavePage, // 페이지 룸 나가기 함수
    requestHardwareStatus, // 하드웨어 상태 요청 함수
    resetFlags // 내부 플래그 초기화 함수
  };
};