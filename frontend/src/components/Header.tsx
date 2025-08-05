'use client';

import { useRouter } from 'next/navigation';

interface HeaderProps {
  currentTime: string;
}

export default function Header({ currentTime }: HeaderProps) {
  const router = useRouter();

  const handleLogoClick = () => {
    router.replace('/');
  };

  return (
    <header className="flex justify-between items-center p-6 lg:p-8 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-3">
        <button 
          onClick={handleLogoClick}
          className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 cursor-pointer"
        >
          PETMON
        </button>
        <p className="text-sm text-gray-800 dark:text-gray-300">기기명(위치)</p>
      </div>
      <div className="text-right">
        <div className="text-lg font-medium text-gray-400 dark:text-gray-300">
          {currentTime}
        </div>
        <div className="flex justify-end mt-2">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-gray-800 dark:bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-gray-800/50 dark:bg-white/50 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-800/50 dark:bg-white/50 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-800/50 dark:bg-white/50 rounded-full"></div>
          </div>
        </div>
        <div className="text-sm text-gray-800 mt-2 dark:text-gray-300">
          자원순환의 새로운 시작
        </div>
      </div>
    </header>
  );
} 