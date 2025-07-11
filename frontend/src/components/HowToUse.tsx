interface HowToUseProps {
  onBack: () => void;
}

export default function HowToUse({ onBack }: HowToUseProps) {
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
      <div className="text-center w-full max-w-7xl px-4">
        <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-white">
          페트몬 이용 방법
        </h2>
        <p className="text-lg text-gray-300 mb-8">
          화면을 옆으로 넘겨보세요!
        </p>
        
        {/* 7단계 카드들 */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
          {/* 1단계 - 시작하기 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white min-h-[280px] w-48 flex-shrink-0 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold mb-2">1.시작하기</h3>
              <div className="border-b border-white/30 mb-3"></div>
              <p className="text-xs mb-3 leading-relaxed">
                회전의<br />
                시작하기 버튼을<br />
                놓러주세요.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-12"></div>
              <div className="bg-white/20 rounded-lg py-1 px-2">
                <span className="text-xs font-semibold">시작하기</span>
              </div>
            </div>
          </div>

          {/* 2단계 - 로그인 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white min-h-[280px] w-48 flex-shrink-0 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold mb-2">2.로그인</h3>
              <div className="border-b border-white/30 mb-3"></div>
              <p className="text-xs mb-3 leading-relaxed">
                핸드폰 번호를<br />
                입력하고<br />
                회원 정보 확인 후<br />
                로그인하세요.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white/20 rounded-lg p-2">
                <div className="grid grid-cols-3 gap-1">
                  {Array.from({ length: 9 }, (_, i) => (
                    <div key={i} className="w-6 h-6 bg-white/40 rounded text-xs flex items-center justify-center">
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-sky-500 rounded-lg py-1 px-2">
                <span className="text-xs font-semibold">로그인</span>
              </div>
            </div>
          </div>

          {/* 3단계 - 무명 분리하기 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white min-h-[280px] w-48 flex-shrink-0 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold mb-2">3.무명 분리하기</h3>
              <div className="border-b border-white/30 mb-3"></div>
              <p className="text-xs mb-3 leading-relaxed">
                물고로 페트병에<br />
                무명이 있다면<br />
                분리하여<br />
                별도업 투입구에<br />
                넣어주세요.
              </p>
            </div>
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white/20 rounded-lg p-2">
                  <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center relative">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      {/* 컵 모양 용기 (위가 좁고 아래가 넓은 형태) */}
                      <path d="M8 4h8l2 16H6L8 4z" 
                            fill="white" 
                            stroke="none"/>
                    </svg>
                    {/* 사각형 라벨 */}
                    <div className="absolute -right-1 top-2 w-2 h-2 bg-sky-400 rounded-sm"></div>
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg py-1 px-2">
                  <span className="text-xs">무명전용 투입구</span>
                </div>
              </div>
          </div>

          {/* 4단계 - 따 분리하기 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white min-h-[280px] w-48 flex-shrink-0 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold mb-2">4.따 분리하기</h3>
              <div className="border-b border-white/30 mb-3"></div>
              <p className="text-xs mb-3 leading-relaxed">
                페트병의<br />
                입구 부분을<br />
                따 분리기에<br />
                넣어주세요.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white/20 rounded-lg p-2">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 2C8 1.45 8.45 1 9 1h6c0.55 0 1 0.45 1 1v1h1c0.55 0 1 0.45 1 1s-0.45 1-1 1h-1v14c0 1.1-0.9 2-2 2H10c-1.1 0-2-0.9-2-2V5H7C6.45 5 6 4.55 6 4s0.45-1 1-1h1V2zm2 3v14h4V5h-4zm1-2h2V2h-2v1z"/>
              </svg>
              </div>
              <div className="bg-white/20 rounded-lg py-1 px-2">
                <span className="text-xs">따분리기</span>
              </div>
            </div>
          </div>

          {/* 5단계 - 페트병 투입하기 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white min-h-[280px] w-48 flex-shrink-0 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold mb-2">5.페트병 투입하기</h3>
              <div className="border-b border-white/30 mb-3"></div>
              <p className="text-xs mb-3 leading-relaxed">
                따가 분리된<br />
                페트병 하나만<br />
                투입구에<br />
                넣어주세요.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white/20 rounded-lg p-2">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 2C8 1.45 8.45 1 9 1h6c0.55 0 1 0.45 1 1v1h1c0.55 0 1 0.45 1 1s-0.45 1-1 1h-1v14c0 1.1-0.9 2-2 2H10c-1.1 0-2-0.9-2-2V5H7C6.45 5 6 4.55 6 4s0.45-1 1-1h1V2zm2 3v14h4V5h-4zm1-2h2V2h-2v1z"/>
              </svg>
              </div>
              <span className="text-xs text-start text-yellow-500">
                여러 개의 페트병을<br />
                투입할경우<br />
                투입구가 닫힌 후<br />
                따 분리기를 이용하세요.
              </span>
            </div>
          </div>

          {/* 6단계 - 페트병 반환 */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white min-h-[280px] w-48 flex-shrink-0 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold mb-2">※ 페트병 반환</h3>
              <div className="border-b border-white/30 mb-3"></div>
              <p className="text-xs mb-3 leading-relaxed">
                투입된 물품은<br />
                SI 인식 후<br />
                자동으로 뚜껑이<br />
                경과<br />
                반환구로<br />
                반환됩니다.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              {/* <div className="bg-white/20 rounded-lg p-2">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div> */}
              {/* <div className="bg-white/20 rounded-lg py-1 px-2">
                <span className="text-xs">반환 완료</span>
              </div> */}
            </div>
          </div>

          {/* 7단계 - 투입 완료 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white min-h-[280px] w-48 flex-shrink-0 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold mb-2">6.투입 완료</h3>
              <div className="border-b border-white/30 mb-3"></div>
              <p className="text-xs mb-3 leading-relaxed">
                페트병을<br />
                모두 투입했다면<br />
                투입 완료 버튼을<br />
                눌러주세요.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              {/* <div className="bg-white/20 rounded-lg p-2">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div> */}
              {/* <div className="bg-white/20 rounded-lg py-1 px-2">
                <span className="text-xs">반환 완료</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 