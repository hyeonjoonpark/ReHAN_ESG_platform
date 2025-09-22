'use client';

interface LoginErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginErrorModal = ({ isOpen, onClose }: LoginErrorModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">로그인 실패</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          입력하신 정보를 다시 확인해주세요.
        </p>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full transition-colors duration-300"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default LoginErrorModal;
