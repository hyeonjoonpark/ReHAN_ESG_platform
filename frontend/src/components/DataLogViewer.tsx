import React, { useState, useEffect, useRef } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'receive' | 'send';
  data: string;
  source: string;
}

interface DataLogViewerProps {
  isVisible: boolean;
  onToggle: () => void;
}

const DataLogViewer: React.FC<DataLogViewerProps> = ({ isVisible, onToggle }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤 처리
  useEffect(() => {
    if (isAutoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  // 로그 추가 함수 (외부에서 호출)
  const addLog = (type: 'receive' | 'send', data: string, source: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      data,
      source
    };
    
    setLogs(prev => [...prev.slice(-99), newLog]); // 최대 100개 로그 유지
  };

  // 전역 콜백 설정
  useEffect(() => {
    window.dataLogCallback = (logData: any) => {
      addLog(logData.type, logData.data, logData.source);
    };

    return () => {
      window.dataLogCallback = undefined;
    };
  }, []);

  // 로그 클리어
  const clearLogs = () => {
    setLogs([]);
  };

  // 스크롤 이벤트 처리
  const handleScroll = () => {
    if (logContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAutoScroll(isAtBottom);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors z-50"
      >
        📊 데이터 로그 보기
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">데이터 로그</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearLogs}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            🗑️
          </button>
          <button
            onClick={onToggle}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 로그 컨테이너 */}
      <div
        ref={logContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2 space-y-1"
      >
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
            데이터 로그가 없습니다
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded text-xs ${
                log.type === 'receive'
                  ? 'bg-purple-500 text-white'
                  : 'bg-pink-500 text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">
                  {log.type === 'receive' ? '📥 수신' : '📤 송신'}
                </span>
                <span className="opacity-75">{log.timestamp}</span>
              </div>
              <div className="text-xs opacity-90 mb-1">{log.source}</div>
              <div className="font-mono text-xs break-all">{log.data}</div>
            </div>
          ))
        )}
      </div>

      {/* 하단 컨트롤 */}
      <div className="flex items-center justify-between p-2 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          총 {logs.length}개 로그
        </div>
        <button
          onClick={() => setIsAutoScroll(!isAutoScroll)}
          className={`text-xs px-2 py-1 rounded ${
            isAutoScroll
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          {isAutoScroll ? '자동스크롤 ON' : '자동스크롤 OFF'}
        </button>
      </div>
    </div>
  );
};

export default DataLogViewer;
