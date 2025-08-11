import React from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface CompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  userHavedPoints?: number;
  earnedPoints: number;
  totalPoints: number;
}

const CompleteModal: React.FC<CompleteModalProps> = ({ isOpen, onClose, userHavedPoints = 0, earnedPoints, totalPoints }) => {
  const router = useRouter();
  if (!isOpen) return null;

  const handleComplete = async () => {
    try {
      const phoneNumber = localStorage.getItem('phone_number');
      if (phoneNumber) {
        // 프록시(nginx/next rewrites)를 통해 상대경로 호출
        await axios
        .post('/api/v1/usage', 
          { 
            phone_number: phoneNumber,
            user_point: userHavedPoints + earnedPoints
          }, 
          { withCredentials: true }
        );
      }
    } catch (e) {
      // 로깅만 하고 UX는 계속 진행
      console.error('사용 이력 저장 실패:', e);
    } finally {
      // 로그인에서 저장한 키(accessToken)에 맞춰 삭제
      localStorage.removeItem('access_token');
      localStorage.removeItem('phone_number');
      localStorage.removeItem('user_point');
      localStorage.removeItem('address');
      router.replace('/');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 w-96 text-center space-y-8">
        <h2 className="text-2xl font-extrabold leading-tight text-gray-900 dark:text-white">
          자원순환에<br />참여해주셔서<br />감사합니다
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between text-lg">
            <span className="font-semibold text-gray-600 dark:text-gray-300">적립 포인트</span>
            <span className="font-semibold text-gray-900 dark:text-white">{userHavedPoints + earnedPoints} P</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="font-semibold text-gray-600 dark:text-gray-300">누적 포인트</span>
            <span className="font-semibold text-cyan-500 dark:text-cyan-400">{totalPoints} P</span>
          </div>
        </div>

        <button
          onClick={handleComplete}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold text-lg hover:scale-105 transition-all duration-300"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default CompleteModal; 