'use client';

import { useState } from 'react';

const CommingSoon = () => {
  const [isClicked, setIsClicked] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleCharacterClick = () => {
    setIsClicked(true);
    setClickCount(prev => prev + 1);
    
    // 애니메이션 후 상태 리셋
    setTimeout(() => {
      setIsClicked(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white text-center px-4">
      {/* 펫몬 캐릭터 */}
      <div className="relative mb-20">
        <div className="petmon-character">
          {/* 몸체 */}
          <div 
            className={`w-40 h-40 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full relative shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 ${
              isClicked ? 'animate-easter-egg' : 'animate-bounce-slow'
            }`}
            onClick={handleCharacterClick}
          >
            {/* 귀 */}
            <div className="absolute -top-6 left-8 w-10 h-16 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full transform rotate-12 shadow-lg"></div>
            <div className="absolute -top-6 right-8 w-10 h-16 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full transform -rotate-12 shadow-lg"></div>
            
            {/* 귀 안쪽 */}
            <div className="absolute -top-2 left-10 w-6 h-10 bg-pink-100 rounded-full transform rotate-12"></div>
            <div className="absolute -top-2 right-10 w-6 h-10 bg-pink-100 rounded-full transform -rotate-12"></div>
            
            {/* 눈 */}
            <div className="absolute top-10 left-10 w-8 h-8 bg-white rounded-full flex items-center justify-center animate-blink shadow-lg">
              <div className="w-4 h-4 bg-black rounded-full"></div>
              <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="absolute top-10 right-10 w-8 h-8 bg-white rounded-full flex items-center justify-center animate-blink shadow-lg">
              <div className="w-4 h-4 bg-black rounded-full"></div>
              <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
            </div>
            
            {/* 코 */}
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-pink-200 rounded-full"></div>
            
            {/* 입 */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-10 h-6 border-2 border-white rounded-full border-t-0 shadow-lg"></div>
            
            {/* 볼 */}
            <div className="absolute top-12 left-3 w-6 h-6 bg-pink-200 rounded-full opacity-70"></div>
            <div className="absolute top-12 right-3 w-6 h-6 bg-pink-200 rounded-full opacity-70"></div>
            
            {/* 하이라이트 */}
            <div className="absolute top-6 left-6 w-4 h-4 bg-white rounded-full opacity-50"></div>
            <div className="absolute top-8 left-8 w-2 h-2 bg-white rounded-full opacity-30"></div>
          </div>
        </div>
      </div>
      
      {/* 텍스트 섹션 */}
      <div className="space-y-8 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-wider animate-fade-in">
          Coming Soon
        </h1>
        
        {/* 프로그레스 게이지 */}
        <div className="flex flex-col items-center space-y-4 animate-fade-in-delay">
          <div className="relative w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full animate-progress-fill"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300 font-light">준비 중...</span>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
        
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 font-light tracking-widest animate-fade-in-delay">
          Petmon
        </p>
        <p className="text-base bg-gray-800 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/20 text-white font-light max-w-sm mx-auto leading-relaxed animate-fade-in-delay">
          페트몬과 함께하는 새로운 경험을 준비하고 있습니다
        </p>
      </div>
      
      <style jsx>{`
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-blink {
          animation: blink 2s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1.2s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 1.2s ease-out 0.8s both;
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        
        @keyframes blink {
          0%, 90%, 100% {
            opacity: 1;
          }
          95% {
            opacity: 0;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes progress-fill {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-progress-fill {
          animation: progress-fill 3s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        .animate-easter-egg {
          animation: easter-egg 1s ease-in-out;
        }
        
        @keyframes easter-egg {
          0% {
            transform: scale(1) rotate(0deg);
            filter: hue-rotate(0deg);
          }
          25% {
            transform: scale(1.3) rotate(90deg);
            filter: hue-rotate(90deg);
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            filter: hue-rotate(180deg);
          }
          75% {
            transform: scale(1.3) rotate(270deg);
            filter: hue-rotate(270deg);
          }
          100% {
            transform: scale(1) rotate(360deg);
            filter: hue-rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default CommingSoon;