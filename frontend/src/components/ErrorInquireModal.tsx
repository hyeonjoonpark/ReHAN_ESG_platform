'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Keypad from './Keypad';
import { KeypadSizeType } from '@/types/KeypadSizeType';

interface ErrorInquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorType?: string;
  location?: {
    latitude: number;
    longitude: number;
  } | null;
  locationError?: string | null;
  address?: string | null;
  addressError?: string | null;
}

export default function ErrorInquireModal({ 
  isOpen, 
  onClose, 
  errorType, 
  location, 
  locationError,
  address,
  addressError
}: ErrorInquireModalProps) {
  const [displayNumber, setDisplayNumber] = useState('');
  const [modalStep, setModalStep] = useState<'phone-input' | 'confirmation'>('phone-input');
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setDisplayNumber('');
      setModalStep('phone-input');
    }
  }, [isOpen]);

  const handleNumberInput = (num: string) => {
    // 현재 숫자만 카운트 (하이픈 제외)
    const currentDigits = displayNumber.replace(/[^0-9]/g, '');
    
    // 숫자 11자리 제한
    if (currentDigits.length >= 11) {
      return; // 더 이상 입력 불가
    }
    
    let newNumber = displayNumber + num;
    // 하이픈 자동 추가
    if (newNumber.length === 3 && !newNumber.includes('-')) {
      newNumber = newNumber + '-';
    } else if (newNumber.length === 8 && newNumber.split('-').length === 2) {
      newNumber = newNumber + '-';
    }
    setDisplayNumber(newNumber);
  };

  const handleDelete = () => {
    if (displayNumber.length > 0) {
      let newNumber = displayNumber.slice(0, -1);
      // 하이픈 자동 제거
      if (newNumber.endsWith('-')) {
        newNumber = newNumber.slice(0, -1);
      }
      setDisplayNumber(newNumber);
    }
  };

  const handleClear = () => {
    setDisplayNumber('');
  };

  // 완성된 번호 검증
  const isPhoneNumberComplete = () => {
    const digits = displayNumber.replace(/[^0-9]/g, '');
    return digits.length === 11;
  };

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

  // 위치 정보 포맷팅
  const formatLocation = () => {
    if (address) {
      return address; // 도로명 주소 우선
    }
    if (location) {
      return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`; // 좌표 (fallback)
    }
    if (addressError) {
      return addressError;
    }
    return locationError || '위치 정보 가져오는 중...';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
        {modalStep === 'phone-input' ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                자세한 문의를 위해 연락받으실<br />
                휴대번호를 입력해 주세요.
              </h2>
              <input
                type="text"
                value={displayNumber}
                placeholder="010-0000-0000"
                readOnly
                className="w-full text-2xl font-bold text-gray-900 dark:text-white text-center mt-6 mb-8 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none"
              />
            </div>

            {/* 숫자 키패드 */}
            <Keypad 
              size={KeypadSizeType.LARGE} 
              colorScheme="blue"
              onNumberClick={handleNumberInput}
              onDelete={handleDelete}
              onClear={handleClear}
            />

            {/* 하단 버튼 */}
            <div className="flex gap-4 mt-4">
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
                disabled={!isPhoneNumberComplete()}
                className={`flex-1 ${
                  isPhoneNumberComplete() 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' 
                    : 'bg-black-100 dark:bg-black-200 text-gray-400 dark:text-gray-400 cursor-not-allowed'
                } text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300`}
              >
                완료
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                해당 내용이 고객센터로 전송됩니다.
              </h2>
              <div className="text-left space-y-2 mb-6 flex flex-col item-start justify-between">
                <p className="text-gray-700 dark:text-gray-300"><strong>위치:</strong> {formatLocation()}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>내용:</strong> {errorType || '페트병 인식 오류'}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>시기:</strong> {getCurrentDateTime()}</p>
              </div>
              <p className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
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