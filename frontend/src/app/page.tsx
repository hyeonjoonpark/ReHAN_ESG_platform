'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // 현재 시간 업데이트
    const updateTime = () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const weekday = weekdays[now.getDay()];
      const hour = now.getHours();
      const minute = now.getMinutes();
      const period = hour < 12 ? '오전' : '오후';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      
      setCurrentTime(`${month}월 ${day}일(${weekday}) ${period} ${displayHour}:${minute.toString().padStart(2, '0')}`);
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* 헤더 */}
      <header className="flex justify-between items-center p-6 lg:p-8">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            PETMON
          </h1>
          <p className="text-sm text-gray-300">기기명(위치)</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-medium text-gray-200">
            {currentTime}
          </div>
          {/* <div className="flex justify-center mt-2">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            </div>
          </div> */}
          <div className="text-sm text-gray-400 mt-2">
            자원순환의 새로운 시작
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* 메인 타이틀 */}
          <div className="text-left mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              페트몬 입문자를 위한 안내 가이드
            </h2>
            <div className="w-full h-0.5 bg-white mb-6"></div>
            <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
              투명 생수병 ai 무인회수기 페트몬을 찾아주셔서 감사합니다.<br />
              궁금하신 내용을 아래 버튼을 터치해 알아보세요.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* 왼쪽 - 기능 카드들 */}
            <div className="lg:col-span-2">
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <button className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <h3 className="text-2xl font-bold text-white">회원가입하기</h3>
                </button>

                <button className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <h3 className="text-2xl font-bold text-white">이용 방법</h3>
                </button>

                <button className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <h3 className="text-2xl font-bold text-white">포인트 적립<br />안내</h3>
                </button>

                <button className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <h3 className="text-2xl font-bold text-white">투입 가능 물품</h3>
                </button>
              </div>
            </div>

            {/* 오른쪽 - 상태 정보 */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-2">
                  안녕하세요
                </h3>
                <h4 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                  페트몬입니다
                </h4>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>기기운영시간:</span>
                    <span className="text-white">평일 08:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>일일최대투입:</span>
                    <span className="text-white">최대 100개</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center mr-3">
                    <span className="text-white text-2xl">🏢</span>
                  </div>
                  투명생수병
                  <br />
                  투입 기기
                </h4>
                <div className="mt-4 pt-4 border-t border-white/20">
                                      <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 text-sm">용량</span>
                      <span className="text-white text-sm font-medium">10%</span> {/* 나중에 실제 데이터로 변환 */}
                    </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all duration-300" style={{width: '10%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 하단 */}
      <footer className="px-6 lg:px-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📞</span>
                </div>
                <div>
                  <p className="text-sm text-gray-300">고객센터</p>
                  <p className="text-white font-medium">1644-1224</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📱</span>
                </div>
                <div>
                  <p className="text-sm text-gray-300">카카오 채널</p>
                  <p className="text-white font-medium">QR코드</p>
                </div>
              </div>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105">
                오류/고장 문의하기
              </button>
            </div>
            <div className="relative">
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                시작하기
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
