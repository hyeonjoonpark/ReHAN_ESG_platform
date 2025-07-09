interface HeaderProps {
  currentTime: string;
}

export default function Header({ currentTime }: HeaderProps) {
  return (
    <header className="flex justify-between items-center p-6 lg:p-8">
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          PETMON
        </h1>
        <p className="text-sm text-gray-300">기기명(위치)</p>
      </div>
      <div className="text-right">
        <div className="text-lg font-medium text-gray-200">
          {currentTime}
        </div>
        <div className="flex justify-end mt-2">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
          </div>
        </div>
        <div className="text-sm text-gray-400 mt-2">
          자원순환의 새로운 시작
        </div>
      </div>
    </header>
  );
} 