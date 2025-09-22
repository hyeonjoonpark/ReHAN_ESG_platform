"use client";

import React, { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  useEffect(() => {
    // 전역 렌더링 에러가 발생했을 때 콘솔에 기록
    // 필요 시 서버 로깅 API 호출로 확장 가능
    console.error('Global rendering error:', error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="max-w-md w-[92vw] rounded-2xl border dark:border-gray-700 p-6 bg-white dark:bg-gray-800 text-center space-y-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">문제가 발생했습니다</h1>
          <p className="text-sm text-gray-700 dark:text-gray-300">예상치 못한 오류가 발생했어요. 잠시 후 다시 시도해주세요.</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:opacity-95"
            >
              다시 시도
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg border dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              새로고침
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}


