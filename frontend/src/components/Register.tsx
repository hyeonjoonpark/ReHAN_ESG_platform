import Keypad from "@/components/Keypad";
import { KeypadSizeType } from "@/types/KeypadSizeType";
import { useState, useRef, useEffect } from "react";

interface RegisterProps {
  onBack: () => void;
  keypadSize?: KeypadSizeType
}

export default function Register({ onBack, keypadSize = KeypadSizeType.LARGE }: RegisterProps) {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 컴포넌트 마운트 시 자동 포커스
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 전화번호 포매팅 (3-4-4)
  const formatPhone = (digits: string) => {
    const len = digits.length;
    if (len <= 3) return digits;
    if (len <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  // 숫자 버튼 클릭
  const handleNumberClick = (num: string) => {
    setPhoneNumber(prev => {
      const digits = prev.replace(/-/g, '');
      if (digits.length >= 11) return prev; // 최대 11자리
      const newDigits = digits + num;
      return formatPhone(newDigits);
    });
    inputRef.current?.focus();
  };

  // 삭제 버튼 클릭 (마지막 숫자 제거)
  const handleDelete = () => {
    setPhoneNumber(prev => {
      const digits = prev.replace(/-/g, '').slice(0, -1);
      return formatPhone(digits);
    });
    inputRef.current?.focus();
  };

  // 전체 지움
  const handleClear = () => {
    setPhoneNumber('');
    inputRef.current?.focus();
  };
  return (
    <div className="relative flex flex-col items-center justify-center h-full">
      {/* 이전으로 버튼 */}
      <div className="absolute top-0 right-0">
        <button 
          onClick={onBack}
          className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-full text-white font-semibold transition-all duration-300"
        >
          이전으로
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="text-center">
        {/**
         * 회원가입 폼
         * 휴대폰번호 입력 키패드 Keypad.tsx
         * 완료 버튼
         */}
         <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex flex-col items-center justify-between gap-3 w-1/2">
            {
              /**
               * placeholder 패딩 추가
               */
            }
            <div className="text-sm text-white font-semibold">
              휴대폰번호를 입력해 회원가입을 하세요
            </div>
            <input ref={inputRef} type="text" className="w-full h-12 rounded-full text-white font-semibold transition-all duration-300 bg-gray-700 placeholder:text-gray-400 placeholder:pl-4" 
              placeholder="010-0000-0000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <button className="w-full h-12 bg-gray-700 hover:bg-gray-600 px-6 rounded-full text-white font-semibold transition-all duration-300 whitespace-nowrap">
              완료
            </button>
          </div>
          
          <Keypad size={keypadSize}
                  onNumberClick={handleNumberClick}
                  onDelete={handleDelete}
                  onClear={handleClear} 
          />
         </div>
      </div>
    </div>
  );
} 