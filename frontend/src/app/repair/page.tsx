'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import RightSection from '../../components/RightSection';
import BottomInquire from '../../components/BottomInquire';

export default function RepairPage() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [arrivalTime, setArrivalTime] = useState(3);

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

    // 도착 시간 카운트다운
    const arrivalInterval = setInterval(() => {
      setArrivalTime(prev => {
        if (prev > 0) {
          return prev - 1;
        }
        return 0;
      });
    }, 60000); // 1분마다 감소

    return () => {
      clearInterval(timeInterval);
      clearInterval(arrivalInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-darkblue-950 text-white">
      {/* 헤더 */}
      <Header currentTime={currentTime} />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* 좌우 분할 레이아웃 */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 왼쪽 - 지도 영역 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl overflow-hidden h-96 relative">
                {/* 지도 배경 */}
                <div className="w-full h-full bg-gradient-to-br from-green-200 via-green-300 to-green-100 relative">
                  {/* 도로 라인들 */}
                  <svg className="absolute inset-0 w-full h-full">
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="3" />
                    <line x1="30%" y1="0" x2="30%" y2="100%" stroke="white" strokeWidth="3" />
                    <line x1="70%" y1="0" x2="70%" y2="100%" stroke="white" strokeWidth="3" />
                    <line x1="0" y1="20%" x2="100%" y2="20%" stroke="white" strokeWidth="2" />
                    <line x1="0" y1="80%" x2="100%" y2="80%" stroke="white" strokeWidth="2" />
                  </svg>
                  
                  {/* 내 위치 마커 */}
                  <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-black text-white px-3 py-1 rounded-lg text-sm font-medium">
                      내 위치
                    </div>
                  </div>
                  
                  {/* 출동 중 마커 */}
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                      출동 중
                    </div>
                  </div>
                </div>
                
                {/* 하단 정보 */}
                <div className="absolute bottom-0 left-0 right-0 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-blue-600 font-semibold">페트몬 매니저가 출동 중입니다.</p>
                        <p className="text-gray-600">잠시만 기다려주세요.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{arrivalTime}</div>
                      <div className="text-sm text-gray-600">분 후 도착 예정</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

                         {/* 오른쪽 - 사이드바 */}
             <RightSection />
          </div>
        </div>
      </main>

      {/* 하단 */}
      <BottomInquire 
        rightButton={{
          text: "수리 중",
          className: "bg-gray-600 hover:bg-gray-700 px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
        }}
      />
    </div>
  );
}
