interface RegisterProps {
  onBack: () => void;
}

export default function Register({ onBack }: RegisterProps) {
  return (
    <div className="relative flex flex-col items-center justify-center h-full">
      {/* 이전으로 버튼 */}
      <div className="absolute top-0 right-0">
        <button 
          onClick={onBack}
          className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-full text-white font-semibold transition-all duration-300"
        >
          이전으로
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="text-center">
        <h2 className="text-2xl lg:text-3xl font-bold mb-12 text-white">
          쉽고 빠른 간편회원가입
        </h2>
        
        <div className="flex items-center justify-center gap-8">
          {/* QR 코드 */}
          <div className="bg-white p-6 rounded-2xl">
            <div className="w-32 h-32 bg-black flex items-center justify-center text-white text-xs">
              <div className="grid grid-cols-8 gap-1">
                {/* QR 코드 패턴 시뮬레이션 */}
                {Array.from({ length: 64 }, (_, i) => (
                  <div 
                    key={i} 
                    className={`w-1 h-1 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 설명 텍스트 */}
          <div className="text-left max-w-md">
            <p className="text-lg lg:text-xl font-bold text-white leading-relaxed">
              화면의 QR코드를 촬영하고<br />
              이름과 휴대번호 입력만으로<br />
              페트몬 회원이 되어보세요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 