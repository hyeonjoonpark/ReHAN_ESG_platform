"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type ErrorType = 'server' | 'build';

interface ErrorEventPayload {
  source?: string;
  stage?: string;
  path?: string;
  method?: string;
  message?: string;
  stack?: string;
  meta?: Record<string, unknown>;
  timestamp?: string;
}

const GlobalErrorBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<ErrorType>('server');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<ErrorEventPayload | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [mounted, setMounted] = useState(false);

  const serverUrl = useMemo(() => 'http://localhost:3001', []);  // localhost 강제 설정

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const socket: Socket = io(serverUrl, {
      withCredentials: true,
      transports: ['polling', 'websocket'], // Polling 우선, WebSocket 대체
      timeout: 20000, // 연결 타임아웃 20초
      forceNew: true, // 새로운 연결 강제 생성
      reconnection: true, // 자동 재연결 활성화
      reconnectionAttempts: 5, // 재연결 시도 횟수
      reconnectionDelay: 1000, // 재연결 지연 시간
      reconnectionDelayMax: 5000, // 최대 재연결 지연 시간
    });

    const handleServerError = (payload: ErrorEventPayload) => {
      setType('server');
      setTitle('서버 오류 발생');
      setMessage(payload?.message || '서버 오류가 발생했습니다.');
      setDetails(payload || null);
      setShowDetails(false);
      setVisible(true);
    };

    const handleBuildError = (payload: ErrorEventPayload) => {
      setType('build');
      setTitle('빌드/배포 오류 발생');
      setMessage(payload?.message || '빌드/배포 오류가 발생했습니다.');
      setDetails(payload || null);
      setShowDetails(false);
      setVisible(true);
    };

    socket.on('server_error', handleServerError);
    socket.on('build_error', handleBuildError);

    return () => {
      socket.off('server_error', handleServerError);
      socket.off('build_error', handleBuildError);
      socket.disconnect();
    };
  }, [serverUrl, mounted]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 15000);
    return () => clearTimeout(timer);
  }, [visible]);

  // 서버 사이드 렌더링 시에는 아무것도 렌더링하지 않음
  if (!mounted) return null;
  if (!visible) return null;

  const theme = type === 'server' ? 'from-red-500 to-pink-500' : 'from-amber-500 to-orange-500';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-3" role="alert" aria-live="assertive">
      <div className={`w-[min(960px,95vw)] rounded-xl shadow-lg border dark:border-gray-700 bg-white dark:bg-gray-800`}>
        <div className={`px-4 py-3 rounded-t-xl text-white bg-gradient-to-r ${theme}`}>
          <div className="flex items-center justify-between">
            <strong className="text-sm sm:text-base">{title}</strong>
            <button
              onClick={() => setVisible(false)}
              className="ml-3 text-white/90 hover:text-white text-sm"
              aria-label="닫기"
            >
              닫기
            </button>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">{message}</p>
          {details && (
            <div className="mt-2">
              <button
                onClick={() => setShowDetails(v => !v)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                aria-expanded={showDetails}
              >
                {showDetails ? '세부정보 숨기기' : '세부정보 보기'}
              </button>
              {showDetails && (
                <pre className="mt-2 max-h-64 overflow-auto text-xs whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-3 rounded border dark:border-gray-700">
{JSON.stringify(details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalErrorBanner;


