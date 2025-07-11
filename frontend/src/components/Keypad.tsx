interface KeypadProps {
  size?: 'small' | 'large';
  colorScheme?: 'default' | 'blue';
  onNumberClick: (num: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

export default function Keypad({ 
  size = 'large',
  colorScheme = 'default',
  onNumberClick, 
  onDelete, 
  onClear 
}: KeypadProps) {
  const buttonSize = size === 'small' ? 'w-12 h-12 text-lg' : 'w-20 h-20 text-2xl';
  const containerPadding = size === 'small' ? 'p-4' : 'p-6';
  const gap = size === 'small' ? 'gap-2' : 'gap-4';

  // 색상 테마 정의
  const colorSchemes = {
    default: {
      container: 'bg-gray-800',
      button: 'bg-gray-600 hover:bg-gray-500',
      text: 'text-white'
    },
    blue: {
      container: 'bg-white',
      button: 'bg-sky-500 hover:bg-blue-600',
      text: 'text-white'
    }
  };

  const currentColors = colorSchemes[colorScheme];

  return (
    <div className={`${currentColors.container} rounded-2xl ${containerPadding}`}>
      
      {/* 숫자 키패드 */}
      <div className={`grid grid-cols-3 ${gap}`}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num.toString())}
            className={`${buttonSize} ${currentColors.button} rounded-xl font-bold ${currentColors.text} transition-colors`}
          >
            {num}
          </button>
        ))}
        
        {/* 하단 행 */}
        <button
          onClick={onDelete}
          className={`${buttonSize} ${currentColors.button} rounded-xl text-xs font-bold ${currentColors.text} transition-colors`}
        >
          지움
        </button>
        <button
          onClick={() => onNumberClick('0')}
          className={`${buttonSize} ${currentColors.button} rounded-xl font-bold ${currentColors.text} transition-colors`}
        >
          0
        </button>
        <button
          onClick={onClear}
          className={`${buttonSize} ${currentColors.button} rounded-xl text-xs font-bold ${currentColors.text} transition-colors leading-tight`}
        >
          전체<br/>지움
        </button>
      </div>
    </div>
  );
} 