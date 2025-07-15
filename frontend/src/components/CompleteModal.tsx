import React from 'react';
import { useRouter } from 'next/navigation';

interface CompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  earnedPoints: number;
  totalPoints: number;
}

const CompleteModal: React.FC<CompleteModalProps> = ({ isOpen, onClose, earnedPoints, totalPoints }) => {
  if (!isOpen) return null;
  const router = useRouter();

  const handleComplete = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('phone_number');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_point');
    localStorage.removeItem('address');
    router.replace('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-3xl p-10 w-96 text-center space-y-8">
        <h2 className="text-2xl font-extrabold leading-tight text-gray-900">
          자원순환에<br />참여해주셔서<br />감사합니다
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between text-lg">
            <span className="font-semibold text-gray-700">적립 포인트</span>
            <span className="font-semibold text-gray-900">{earnedPoints} P</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="font-semibold text-gray-700">누적 포인트</span>
            <span className="font-semibold text-cyan-600">{totalPoints} P</span>
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