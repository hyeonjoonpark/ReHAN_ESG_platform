interface KeypadProps {
  size?: 'small' | 'large';
  onNumberClick: (num: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

export default function Keypad({ 
  size = 'large', 
  onNumberClick, 
  onDelete, 
  onClear 
}: KeypadProps) {
  const buttonSize = size === 'small' ? 'w-12 h-12 text-lg' : 'w-20 h-20 text-2xl';
  const containerPadding = size === 'small' ? 'p-4' : 'p-6';
  const gap = size === 'small' ? 'gap-2' : 'gap-4';

  return (
    <div className={`bg-gray-800 rounded-2xl ${containerPadding}`}>
      
      {/* 숫자 키패드 */}
      <div className={`grid grid-cols-3 ${gap}`}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num.toString())}
            className={`${buttonSize} bg-gray-600 hover:bg-gray-500 rounded-xl font-bold text-white transition-colors`}
          >
            {num}
          </button>
        ))}
        
        {/* 하단 행 */}
        <button
          onClick={onDelete}
          className={`${buttonSize} bg-gray-600 hover:bg-gray-500 rounded-xl text-xs font-bold text-white transition-colors`}
        >
          지움
        </button>
        <button
          onClick={() => onNumberClick('0')}
          className={`${buttonSize} bg-gray-600 hover:bg-gray-500 rounded-xl font-bold text-white transition-colors`}
        >
          0
        </button>
        <button
          onClick={onClear}
          className={`${buttonSize} bg-gray-600 hover:bg-gray-500 rounded-xl text-xs font-bold text-white transition-colors leading-tight`}
        >
          전체<br/>지움
        </button>
      </div>
    </div>
  );
} 