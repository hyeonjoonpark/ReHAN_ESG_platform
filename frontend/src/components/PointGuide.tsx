interface PointGuideProps {
  onBack: () => void;
}

export default function PointGuide({ onBack }: PointGuideProps) {
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
      <div className="text-center w-full max-w-4xl px-4">
        <h2 className="text-2xl lg:text-3xl font-bold mb-8 text-white">
          포인트 적립 안내
        </h2>
        
        {/* 포인트 적립 안내 박스 */}
        <div className="bg-white rounded-2xl p-8 mx-auto max-w-3xl text-left">
          <div className="space-y-6">
            {/* 1. 생수병 1개당 10포인트가 지급됩니다. */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
              <p className="text-lg text-gray-800 font-medium">
                생수병 1개당 10포인트가 지급됩니다.
              </p>
            </div>

            {/* 2. 하루 최대 100개까지 적립 가능합니다. */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
              <p className="text-lg text-gray-800 font-medium">
                하루 최대 100개까지 적립 가능합니다.
              </p>
            </div>

            {/* 3. 포인트 적립 내역은 홈페이지에서 확인 가능합니다. */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
              <p className="text-lg text-gray-800 font-medium">
                포인트 적립 내역은 홈페이지에서 확인 가능합니다.
              </p>
            </div>

            {/* 4. 포인트 현금 출금은 5,000포인트 이상 가능하며, 매주 금요일 일괄 지급됩니다. */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
              <p className="text-lg text-gray-800 font-medium">
                포인트 현금 출금은 5,000포인트 이상 가능하며,<br />
                매주 금요일 일괄 지급됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 