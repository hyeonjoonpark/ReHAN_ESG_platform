import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface HardwareStatus {
  type: string;
  data: any;
  timestamp: string;
}

interface UseSocketOptions {
  serverUrl?: string;
  autoConnect?: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  beltSeparatorCompleted: boolean;
  hopperOpened: boolean;
  hardwareStatus: HardwareStatus | null;
  connect: () => void;
  disconnect: () => void;
  joinPage: (page: string) => void;
  leavePage: (page: string) => void;
  requestHardwareStatus: () => void;
}

export const useSocket = (options: UseSocketOptions = {}): UseSocketReturn => {
  const {
    serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
    autoConnect = true
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [beltSeparatorCompleted, setBeltSeparatorCompleted] = useState(false);
  const [hopperOpened, setHopperOpened] = useState(false);
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const currentPageRef = useRef<string | null>(null);

  const connect = () => {
    if (socketRef.current?.connected) {
      console.log('Socket이 이미 연결되어 있습니다.');
      return;
    }

    console.log('Socket 연결 시도:', serverUrl);
    
    socketRef.current = io(serverUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // 연결 이벤트
    socketRef.current.on('connect', () => {
      console.log('Socket 연결됨:', socketRef.current?.id);
      setIsConnected(true);
    });

    // 연결 해제 이벤트
    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket 연결 해제됨:', reason);
      setIsConnected(false);
    });

    // 하드웨어 상태 수신
    socketRef.current.on('hardware_status', (data: HardwareStatus) => {
      console.log('하드웨어 상태 수신:', data);
      setHardwareStatus(data);
      
      // 띠분리 완료 상태 업데이트
      if (data.type === 'belt_separator_complete') {
        setBeltSeparatorCompleted(true);
        console.log('🎯 띠분리 완료 상태 활성화');
      }
      
      // 투입구 열림 상태 업데이트
      if (data.type === 'hopper_open') {
        setHopperOpened(true);
        console.log('🚪 투입구 열림 상태 활성화');
      }
    });

    // 현재 하드웨어 상태 수신
    socketRef.current.on('current_hardware_status', (data) => {
      console.log('현재 하드웨어 상태:', data);
      setBeltSeparatorCompleted(data.belt_separator_complete || false);
    });

    // 하드웨어 상태 응답
    socketRef.current.on('hardware_status_response', (data) => {
      console.log('하드웨어 상태 응답:', data);
      setBeltSeparatorCompleted(data.belt_separator_complete || false);
    });

    // 시리얼 데이터 수신 (디버깅용)
    socketRef.current.on('serial_data', (data) => {
      console.log('시리얼 데이터 수신:', data);
    });

    // 연결 에러
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket 연결 에러:', error);
      setIsConnected(false);
    });

    // 일반 에러
    socketRef.current.on('error', (error) => {
      console.error('Socket 에러:', error);
    });
  };

  const disconnect = () => {
    if (socketRef.current) {
      console.log('Socket 연결 해제');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const joinPage = (page: string) => {
    if (socketRef.current?.connected) {
      console.log(`페이지 참여: ${page}`);
      currentPageRef.current = page;
      socketRef.current.emit('join_page', { page });
    }
  };

  const leavePage = (page: string) => {
    if (socketRef.current?.connected) {
      console.log(`페이지 떠남: ${page}`);
      socketRef.current.emit('leave_page', { page });
      if (currentPageRef.current === page) {
        currentPageRef.current = null;
      }
    }
  };

  const requestHardwareStatus = () => {
    if (socketRef.current?.connected) {
      console.log('하드웨어 상태 요청');
      socketRef.current.emit('request_hardware_status');
    }
  };

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      // 현재 페이지에서 나가기
      if (currentPageRef.current) {
        leavePage(currentPageRef.current);
      }
      disconnect();
    };
  }, [autoConnect, serverUrl]);

  return {
    socket: socketRef.current,
    isConnected,
    beltSeparatorCompleted,
    hopperOpened,
    hardwareStatus,
    connect,
    disconnect,
    joinPage,
    leavePage,
    requestHardwareStatus
  };
};