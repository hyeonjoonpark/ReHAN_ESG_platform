'use client';

import { useState, useEffect } from 'react';
import ErrorInquireModal from '@/components/ErrorInquireModal';
import Header from '@/components/Header';
import RightSection from '@/components/RightSection';
import BottomInquire from '@/components/BottomInquire';
import Register from '@/components/Register';
import HowToUse from '@/components/HowToUse';
import PointGuide from '@/components/PointGuide';
import ErrorTypeSelect from '@/components/ErrorTypeSelect';
import { ScreenType } from '@/types/ScreenType';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(ScreenType.MAIN);
  const [selectedErrorType, setSelectedErrorType] = useState<string>('');
  const router = useRouter();

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

    return () => clearInterval(timeInterval);
  }, []);

  const handleErrorTypeSelect = (errorType: string) => {
    setSelectedErrorType(errorType);
    setCurrentScreen(ScreenType.MAIN);
    setIsModalOpen(true);
  };

  const handleInquireClick = () => {
    if(window.location.pathname === '/login' || window.location.pathname === '/login/') {
      router.replace('/');
    }
    setCurrentScreen(ScreenType.ERROR_TYPE_SELECT);
  };

  return (
    <div className="h-screen bg-darkblue-950 text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <Header currentTime={currentTime} />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* 메인 타이틀 */}
          <div className="text-left mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              페트몬 입문자를 위한 안내 가이드
            </h2>
            <div className="w-full h-0.5 bg-white mb-4"></div>
            <p className="text-base text-gray-300 max-w-2xl leading-relaxed">
              투명 생수병 ai 무인회수기 페트몬을 찾아주셔서 감사합니다.<br />
              궁금하신 내용을 아래 버튼을 터치해 알아보세요.
            </p>
          </div>

          {/* 좌우 분할 레이아웃 */}
          <section className="grid lg:grid-cols-3 gap-8 flex-1">
            {/* 왼쪽 - 메인 컨텐츠 */}
            <section className="lg:col-span-2 flex flex-col justify-center">
              {currentScreen === ScreenType.MAIN ? (
                // 메인 화면 - 기능 카드들
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => setCurrentScreen(ScreenType.REGISTER)}
                    className="bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <h3 className="text-xl font-bold text-white">회원가입하기</h3>
                  </button>

                  <button 
                    onClick={() => setCurrentScreen(ScreenType.HOW_TO_USE)}
                    className="bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <h3 className="text-xl font-bold text-white">이용 방법</h3>
                  </button>

                  <button 
                    onClick={() => setCurrentScreen(ScreenType.POINT_GUIDE)}
                    className="bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <h3 className="text-xl font-bold text-white">포인트 적립<br />안내</h3>
                  </button>

                  <button className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <h3 className="text-xl font-bold text-white">투입 가능 물품</h3>
                  </button>
                </div>
              ) : currentScreen === ScreenType.REGISTER ? (
                // 회원가입 화면
                <Register onBack={() => setCurrentScreen(ScreenType.MAIN)} />
              ) : currentScreen === ScreenType.HOW_TO_USE ? (
                // 이용방법 화면
                <HowToUse onBack={() => setCurrentScreen(ScreenType.MAIN)} />
              ) : currentScreen === ScreenType.POINT_GUIDE ? (
                // 포인트 적립 안내 화면
                <PointGuide onBack={() => setCurrentScreen(ScreenType.MAIN)} />
              ) : currentScreen === ScreenType.ERROR_TYPE_SELECT ? (
                // 오류 유형 선택 화면
                <ErrorTypeSelect 
                  onBack={() => setCurrentScreen(ScreenType.ERROR_TYPE_SELECT)} 
                  onErrorTypeSelect={handleErrorTypeSelect}
                />
              ) : null}
            </section>

            {/* 오른쪽 - 사이드바 */}
            <RightSection />
          </section>
        </div>
      </main>

      {/* 하단 */}
      <BottomInquire 
        onInquireClick={handleInquireClick}
        rightButtons={[{
          text: "시작하기",
          onClick: () => router.replace('/login'),
          className: "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-blue-600 hover:to-cyan-600 px-8 py-4 rounded-4xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
        }]}
      />
      
      {/* 모달 */}
      <ErrorInquireModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        errorType={selectedErrorType}
      />
    </div>
  );
}
