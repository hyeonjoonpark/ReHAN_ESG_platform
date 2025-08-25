interface BottomInquireProps {
  onInquireClick?: () => void;
  rightButtons: {
    text: string;
    className: string;
    onClick?: () => void;
    disabled?: boolean;
  }[];
}

export default function BottomInquire({ onInquireClick, rightButtons }: BottomInquireProps) {
  return (
    <footer className="px-8 py-4 bg-darkblue-800 dark:bg-darkblue-900">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">📞</span>
            </div>
            <div>
              <p className="text-sm text-gray-300">고객센터</p>
              <p className="text-white font-medium text-lg">1644-1224</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded grid grid-cols-3 gap-0.5 p-0.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={`w-1 h-1 ${i % 2 === 0 ? 'bg-black' : 'bg-white'}`} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-300">카카오 채널</p>
              <p className="text-white font-medium">QR코드</p>
            </div>
          </div>
          {onInquireClick && (
            <button 
              onClick={onInquireClick}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300">
              오류/고장 문의하기
            </button>
          )}
        </div>

        <div className="flex space-x-4">
          {rightButtons.map((button, index) => {
            const finalClass = button.disabled
              ? 'bg-gray-400 text-white px-10 py-6 rounded-xl opacity-50 cursor-not-allowed'
              : button.className;
            return (
              <button
                key={index}
                className={finalClass}
                onClick={button.onClick}
                disabled={button.disabled}
              >
                {button.text}
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
} 