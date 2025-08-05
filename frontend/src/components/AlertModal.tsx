import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: 'success' | 'error';
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, message, type = 'success' }) => {
  if (!isOpen) return null;

  const themeClasses =
    type === 'success'
      ? 'from-cyan-500 to-purple-500'
      : 'from-red-500 to-pink-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-80 text-center space-y-6">
        <p className="text-lg font-semibold text-gray-800 dark:text-white whitespace-pre-line">{message}</p>
        <button
          onClick={onClose}
          className={`w-full py-3 rounded-xl bg-gradient-to-r ${themeClasses} text-white font-bold hover:scale-105 transition-all duration-300`}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default AlertModal; 