"use client";
import { useState } from "react";

interface RightSectionProps {
  mode?: 'percent' | 'counts';
  remainingCount?: number;
  currentCount?: number;
}

export default function RightSection({ mode = 'percent', remainingCount = 100, currentCount = 0 }: RightSectionProps) {
  const [percent, setPercent] = useState<number>(0);

  return (
    <section className="space-y-6">
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

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-inner">
        {mode === 'percent' ? (
          <>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 2C8 1.45 8.45 1 9 1h6c0.55 0 1 0.45 1 1v1h1c0.55 0 1 0.45 1 1s-0.45 1-1 1h-1v14c0 1.1-0.9 2-2 2H10c-1.1 0-2-0.9-2-2V5H7C6.45 5 6 4.55 6 4s0.45-1 1-1h1V2zm2 3v14h4V5h-4zm1-2h2V2h-2v1z"/>
                </svg>
              </div>
              투명생수병<br />투입 기기
            </h4>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">용량</span>
                <span className="text-white text-sm font-medium">{percent}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${percent}%`}}
                ></div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col space-y-8">
            {/* 오늘 남은 투입 개수 */}
            <div className="flex justify-between items-center">
              <p className="text-gray-300 text-sm font-medium mb-2">오늘 남은 투입 개수</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold text-white">{remainingCount}</span>
                <span className="text-xl text-white ml-1">개</span>
              </div>
            </div>

            {/* 현재 투입 개수 */}
            <div className="border-t border-white/10 pt-8 flex justify-between items-center">
              <p className="text-gray-300 text-sm font-medium mb-2">현재 투입 개수</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold text-white">{currentCount}</span>
                <span className="text-xl text-white ml-1">개</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 