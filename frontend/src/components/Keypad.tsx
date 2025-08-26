import React from 'react';
import { KeypadSizeType } from "@/types/KeypadSizeType";

interface KeypadProps {
  size?: KeypadSizeType;
  colorScheme?: 'default' | 'blue';
  onNumberClick: (num: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

export default function Keypad({ 
  size = KeypadSizeType.LARGE,
  colorScheme = 'default',
  onNumberClick, 
  onDelete, 
  onClear 
}: KeypadProps) {
  // SMALL 사이즈: 전체 키패드를 더 작게 표시
  const buttonSize = size === KeypadSizeType.SMALL ? 'w-10 h-10 text-base' : size === KeypadSizeType.MEDIUM ? 'w-12 h-20 text-lg' : 'w-25 h-16 text-2xl';
  const containerPadding = size === KeypadSizeType.SMALL ? 'p-4' : 'p-10';
  const gap = size === KeypadSizeType.SMALL ? 'gap-4' : 'gap-6';
  const scaleClass = size === KeypadSizeType.SMALL ? 'scale-90' : '';

  // 색상 테마 정의
  const colorSchemes = {
    default: {
      container: 'bg-gray-200 dark:bg-gray-900',
      button: 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500',
      text: 'text-gray-800 dark:text-white'
    },
    blue: {
      container: 'bg-white',
      button: 'bg-sky-500 hover:bg-blue-600',
      text: 'text-white'
    }
  };

  const currentColors = colorSchemes[colorScheme];

  return (
    <div className={`${currentColors.container} ${scaleClass} rounded-2xl ${containerPadding}`}>
      
      {/* 
      * 숫자 키패드 (마진 중앙 정렬)
      * 삭제 버튼 중앙 정렬
      */}
      <div className={`grid grid-cols-3 ${gap} mx-auto`}>
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
          삭제
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
          전체<br/>삭제
        </button>
      </div>
    </div>
  );
} 