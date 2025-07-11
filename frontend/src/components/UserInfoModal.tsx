'use client';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: {
    phone_number: string;
    user_name: string;
  };
  onConfirm: () => void;
}

export default function UserInfoModal({ isOpen, onClose, userInfo, onConfirm }: UserInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            회원정보를<br />
            확인해주세요
          </h2>
          
          <div className="text-left flex flex-col justify-between mb-6 h-20">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">이름</span>
              <span className="text-gray-900 font-semibold">{userInfo?.user_name || 'OOO'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">휴대번호</span>
              <span className="text-gray-900 font-semibold">{userInfo?.phone_number || '010-0000-0000'}</span>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
          >
            다시 입력
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
} 