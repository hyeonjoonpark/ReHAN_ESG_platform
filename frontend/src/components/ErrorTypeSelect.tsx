interface ErrorTypeSelectProps {
  onBack: () => void;
  onErrorTypeSelect: (errorType: string) => void;
}

export default function ErrorTypeSelect({ onBack, onErrorTypeSelect }: ErrorTypeSelectProps) {
  const errorTypes = [
    "투입구가 열리지 않아요",
    "로그인이 안돼요", 
    "투명 페트병이 계속 반환돼요",
    "기타 오류/고장"
  ];

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
      <div className="text-start w-full max-w-4xl px-4">
        <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-white">
          기계가 작동하지 않나요?
        </h2>
        
        <div className="w-full border-b border-white/30 mb-8"></div>
        
        <p className="text-base text-gray-300 mb-8">
          페트몬 고객센터로 해당 내용이 전송되며<br />
          허위 신고 시 서비스 이용에 제한을 받을 수 있습니다.
        </p>
        
        {/* 오류 유형 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {errorTypes.map((errorType, index) => (
            <button
              key={index}
              onClick={() => onErrorTypeSelect(errorType)}
              className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl p-6 text-center text-white font-medium text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl min-h-[120px] flex items-center justify-center"
            >
              {errorType}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 