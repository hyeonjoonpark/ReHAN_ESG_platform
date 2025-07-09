interface BottomInquireProps {
  onInquireClick?: () => void;
  rightButton: {
    text: string;
    className: string;
    onClick?: () => void;
  };
}

export default function BottomInquire({ onInquireClick, rightButton }: BottomInquireProps) {
  return (
    <footer className="px-6 lg:px-8 pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">📞</span>
              </div>
              <div>
                <p className="text-sm text-gray-300">고객센터</p>
                <p className="text-white font-medium">1644-1224</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">📱</span>
              </div>
              <div>
                <p className="text-sm text-gray-300">카카오 채널</p>
                <p className="text-white font-medium">QR코드</p>
              </div>
            </div>
            {onInquireClick && (
              <button 
                onClick={onInquireClick}
                className="bg-gradient-to-r from-purple-500 to-purple-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105">
                오류/고장 문의하기
              </button>
            )}
          </div>
          <div className="relative">
            <button 
              className={rightButton.className}
              onClick={rightButton.onClick}
            >
              {rightButton.text}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
} 