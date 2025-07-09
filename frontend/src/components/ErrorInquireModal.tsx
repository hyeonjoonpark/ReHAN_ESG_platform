'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ErrorInquireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ErrorInquireModal({ isOpen, onClose }: ErrorInquireModalProps) {
  const [displayNumber, setDisplayNumber] = useState('010-1234-1234');
  const [modalStep, setModalStep] = useState<'phone-input' | 'confirmation'>('phone-input');
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setDisplayNumber('010-1234-1234');
      setModalStep('phone-input');
    }
  }, [isOpen]);

  const handleNumberClick = (number: string) => {
    if (number === '지움') {
      if (displayNumber.length > 0) {
        let newNumber = displayNumber.slice(0, -1);
        // 하이픈 자동 제거
        if (newNumber.endsWith('-')) {
          newNumber = newNumber.slice(0, -1);
        }
        setDisplayNumber(newNumber);
      }
    } else if (number === '전체지움') {
      setDisplayNumber('');
    } else {
      let newNumber = displayNumber + number;
      // 하이픈 자동 추가
      if (newNumber.length === 3 && !newNumber.includes('-')) {
        newNumber = newNumber + '-';
      } else if (newNumber.length === 8 && newNumber.split('-').length === 2) {
        newNumber = newNumber + '-';
      }
      setDisplayNumber(newNumber);
    }
  };

  const keypadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['지움', '0', '전체지움']
  ];

  if (!isOpen) return null;

  // 현재 날짜와 시간 가져오기
  const getCurrentDateTime = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    
    return `${month.toString().padStart(2, '0')}월 ${day.toString().padStart(2, '0')}일 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        {modalStep === 'phone-input' ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                자세한 문의를 위해 연락받으실<br />
                휴대번호를 입력해 주세요.
              </h2>
              <div className="text-2xl font-bold text-gray-900 mt-6 mb-8">
                {displayNumber}
              </div>
            </div>

            {/* 숫자 키패드 */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {keypadNumbers.map((row, rowIndex) => (
                row.map((number, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleNumberClick(number)}
                    className="bg-sky-500 hover:bg-blue-600 text-white font-semibold text-lg py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    {number}
                  </button>
                ))
              ))}
            </div>

            {/* 하단 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                이전으로
              </button>
              <button
                onClick={() => {
                  setModalStep('confirmation');
                }}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                완료
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                해당 내용이 고객센터로 전송됩니다.
              </h2>
              <div className="text-left space-y-2 mb-6">
                <p className="text-gray-700"><strong>위치:</strong> --</p>
                <p className="text-gray-700"><strong>내용:</strong> 페트병 인식 오류</p>
                <p className="text-gray-700"><strong>시기:</strong> {getCurrentDateTime()}</p>
              </div>
              <p className="text-lg font-semibold text-gray-800 mb-6">
                작성하신 내용과 일치한가요?
              </p>
            </div>

            {/* 확인 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => setModalStep('phone-input')}
                className="flex-1 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                아니요
              </button>
              <button
                onClick={() => {
                  // 최종 제출 로직
                  console.log('전화번호:', displayNumber);
                  console.log('제출 완료');
                  onClose();
                  router.replace('/repair');
                }}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                예 맞습니다.
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 