'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<string>('확인 중...');

  useEffect(() => {
    // 현재 시간 업데이트
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('ko-KR'));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // 백엔드 API 상태 확인
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('/api/');
        if (response.ok) {
          setBackendStatus('✅ 연결됨');
        } else {
          setBackendStatus('❌ 연결 실패');
        }
      } catch {
        setBackendStatus('❌ 연결 실패');
      }
    };

    checkBackendStatus();
    const statusInterval = setInterval(checkBackendStatus, 30000); // 30초마다 확인

    return () => {
      clearInterval(timeInterval);
      clearInterval(statusInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* 헤더 */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
              ReHAN ESG Platform
            </h1>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {currentTime}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            지속 가능한 미래를 위한
            <span className="text-green-600 dark:text-green-400 block">
              ESG 경영 플랫폼
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            환경(Environmental), 사회(Social), 지배구조(Governance) 데이터를 통합 관리하고 
            지속가능한 경영을 실현하세요.
          </p>
        </div>

        {/* 기능 카드 */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-green-500 text-3xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              환경 관리
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              탄소 배출량, 에너지 효율성, 폐기물 관리 등 환경 지표를 체계적으로 관리합니다.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-blue-500 text-3xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              사회적 책임
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              직원 복지, 지역사회 기여, 인권 존중 등 사회적 가치를 추구합니다.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-purple-500 text-3xl mb-4">⚖️</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              투명한 지배구조
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              윤리적 경영, 투명한 의사결정, 리스크 관리를 통한 신뢰받는 기업을 만듭니다.
            </p>
          </div>
        </div>

        {/* 시스템 상태 */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            시스템 상태
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Frontend:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">✅ 정상</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Backend:</span>
              <span className="font-medium">{backendStatus}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">HTTPS:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">🔒 보안</span>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p className="mb-2">© 2025 ReHAN ESG Platform. All rights reserved.</p>
            <p className="text-sm">
              지속 가능한 미래를 위한 ESG 경영 솔루션
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
