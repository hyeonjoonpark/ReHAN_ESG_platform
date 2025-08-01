import Keypad from "@/components/Keypad";
import { KeypadSizeType } from "@/types/KeypadSizeType";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import AlertModal from "@/components/AlertModal";

interface RegisterProps {
  onBack: () => void;
  keypadSize?: KeypadSizeType
}

export default function Register({ onBack, keypadSize = KeypadSizeType.LARGE }: RegisterProps) {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error'>("success");

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

  const handleSignUp = async () => {
    const digits = phoneNumber.replace(/-/g, "");

    // 최소 10자리(지역번호 포함) 검증
    if (digits.length < 10 || digits.length > 11) {
      alert("유효한 전화번호를 입력해주세요.");
      return;
    }

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const res = await axios.post(
        `${baseURL}/api/v1/signup`,
        { phone_number: digits },
        { withCredentials: true }
      );

      if (res.data && res.data.success) {
        setAlertMsg(res.data.message || "회원가입이 완료되었습니다.");
        setAlertType("success");
        setAlertOpen(true);
        // 성공 후 뒤로 가기 콜백은 모달 닫힌 뒤 수행
        return;
      } else {
        setAlertMsg(res.data?.error || "회원가입에 실패했습니다.");
        setAlertType("error");
        setAlertOpen(true);
      }
    } catch (err: unknown) {
      console.error("회원가입 요청 오류:", err);
      if (axios.isAxiosError(err) && err.response) {
        setAlertMsg((err.response.data as { error?: string })?.error || "서버 오류가 발생했습니다.");
      } else {
        setAlertMsg("서버 오류가 발생했습니다.");
      }
      setAlertType("error");
      setAlertOpen(true);
    }
  }

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
            <button className="w-full h-12 bg-gray-700 hover:bg-gradient-to-r from-cyan-500 to-purple-500 px-6 rounded-full text-white font-semibold transition-all duration-300 whitespace-nowrap"
            onClick={handleSignUp}>
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
      <AlertModal
    isOpen={alertOpen}
    message={alertMsg}
    type={alertType}
    onClose={() => {
      setAlertOpen(false);
      if (alertType === 'success') {
        onBack();
      }
    }}
  />
    </div>
  );
} 