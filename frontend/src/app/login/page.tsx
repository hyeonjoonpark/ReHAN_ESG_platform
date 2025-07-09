'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import BottomInquire from '../../components/BottomInquire';
import ErrorInquireModal from '@/components/ErrorInquireModal';

export default function LoginPage() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('010-0000-0000');
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
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

  const handleNumberClick = (num: string) => {
    if (phoneNumber === '010-0000-0000') {
      setPhoneNumber(`010-${num}`);
    } else {
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      if (cleanNumber.length < 11) {
        const newNumber = cleanNumber + num;
        const formatted = formatPhoneNumber(newNumber);
        setPhoneNumber(formatted);
      }
    }
  };

  const handleDelete = () => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length > 3) {
      const newNumber = cleanNumber.slice(0, -1);
      const formatted = formatPhoneNumber(newNumber);
      setPhoneNumber(formatted);
    } else {
      setPhoneNumber('010-0000-0000');
    }
  };

  const handleClear = () => {
    setPhoneNumber('010-0000-0000');
  };

  const formatPhoneNumber = (number: string) => {
    if (number.length <= 3) {
      return number;
    } else if (number.length <= 7) {
      return `${number.slice(0, 3)}-${number.slice(3)}`;
    } else {
      return `${number.slice(0, 3)}-${number.slice(3, 7)}-${number.slice(7, 11)}`;
    }
  };

  const handleConfirm = () => {
    if (phoneNumber && phoneNumber !== '010-0000-0000') {
      router.replace('/');
    }
  };

  const handlePrevious = () => {
    router.back();
  };

  // 키패드 컴포넌트
  const Keypad = ({ size = 'large' }: { size?: 'small' | 'large' }) => {
    const buttonSize = size === 'small' ? 'w-12 h-12 text-lg' : 'w-20 h-20 text-2xl';
    const containerPadding = size === 'small' ? 'p-4' : 'p-6';
    const gap = size === 'small' ? 'gap-2' : 'gap-4';

    return (
      <div className={`bg-gray-800 rounded-2xl ${containerPadding}`}>
        {/* 전화번호 표시 (작은 키패드에만) */}
        {size === 'small' && (
          <div className="bg-gray-700 rounded-xl p-2 mb-4 text-center">
            <div className="text-sm font-bold text-white">{phoneNumber}</div>
          </div>
        )}
        
        {/* 숫자 키패드 */}
        <div className={`grid grid-cols-3 ${gap}`}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className={`${buttonSize} bg-gray-600 hover:bg-gray-500 rounded-xl font-bold text-white transition-colors`}
            >
              {num}
            </button>
          ))}
          
          {/* 하단 행 */}
          <button
            onClick={handleDelete}
            className={`${buttonSize} bg-gray-600 hover:bg-gray-500 rounded-xl text-xs font-bold text-white transition-colors`}
          >
            지움
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            className={`${buttonSize} bg-gray-600 hover:bg-gray-500 rounded-xl font-bold text-white transition-colors`}
          >
            0
          </button>
          <button
            onClick={handleClear}
            className={`${buttonSize} bg-gray-600 hover:bg-gray-500 rounded-xl text-xs font-bold text-white transition-colors leading-tight`}
          >
            전체<br/>지움
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <Header currentTime={mounted ? currentTime : ''} />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 px-8 py-6 overflow-hidden">
        <div className="h-full">
          {/* 3열 레이아웃 */}
          <div className="w-full h-full justify-around items-center flex">

            {/* 가운데 - 로그인 영역 */}
            <div className="flex flex-col justify-start items-center space-y-8">
              <div className="bg-gray-800 rounded-3xl p-12 w-[800px] min-w-[800px] h-[500px] text-center">
                <h1 className="text-6xl font-bold text-white mb-8">로그인</h1>
                <p className="text-2xl text-gray-300 leading-relaxed mb-12">
                  기업 시 업력한 휴대폰 번호 입력하고<br />
                  회원 정보 확인 후 로그인하세요.
                </p>
                
                {/* QR코드 영역 */}
                <div className="flex items-center justify-center space-x-6">
                  <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-16 h-16 bg-black grid grid-cols-8 gap-0.5 p-1">
                      {Array.from({ length: 64 }).map((_, i) => {
                        const pattern = [1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0];
                        return (
                          <div 
                            key={i} 
                            className={`w-1 h-1 ${pattern[i] ? 'bg-white' : 'bg-black'}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-semibold text-white">회원이 아니시라면?</p>
                    <p className="text-lg text-gray-300">QR코드 촬영하고 회원가입 진행하기</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽 - 큰 키패드 영역 (4/12) */}
            <div className="col-span-4 flex flex-col justify-center space-y-6">
              {/* 전화번호 표시 */}
              <div className="bg-gray-800 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{phoneNumber}</div>
              </div>

              {/* 큰 키패드 */}
              <Keypad size="large" />
            </div>
          </div>
        </div>
      </main>

      {/* 하단 */}
      <BottomInquire 
        onInquireClick={() => setIsModalOpen(true)}
        rightButtons={[
          {
            text: "이전",
            className: "bg-gray-600 hover:bg-gray-700 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300",
            onClick: handlePrevious
          },
          {
            text: "확인",
            className: `px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              phoneNumber === '010-0000-0000'
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white'
            }`,
            onClick: handleConfirm,
            disabled: phoneNumber === '010-0000-0000'
          }
        ]}
      />

      {/* 모달 */}
      <ErrorInquireModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
