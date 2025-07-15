'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomInquire from '@/components/BottomInquire';
import RightSection from '@/components/RightSection';
import CompleteModal from '@/components/CompleteModal';
import { useRouter } from 'next/navigation';
import { getFormattedCurrentTime } from '@/utils/updateTime';

const BandSplit = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const earnedPoints = 10; // TODO: 실제 데이터로 수정
  const totalPoints = 10;
  const router = useRouter();

  // 현재 시간 업데이트
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getFormattedCurrentTime());
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  return (
    <div className="h-screen bg-darkblue-950 text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <Header currentTime={currentTime} />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <section className="grid lg:grid-cols-3 gap-8 flex-1">
            {/* 왼쪽 - 안내 컨텐츠 */}
            <section className="lg:col-span-2 flex flex-col justify-center space-y-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                  띠 분리하기
                </h2>
                <p className="text-base text-gray-300 max-w-2xl leading-relaxed">
                  페트병의 입구 부분을 띠 분리기에 넣어주세요.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 뚜껑투입구 카드 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-white/20 rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-5xl">🧢</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">뚜껑투입구</h3>
                  <p className="text-gray-300">뚜껑은 분리하여 뚜껑 투입구에!</p>
                </div>

                {/* 페트병 카드 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-white/20 rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-5xl">🥤</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">페트병</h3>
                  <p className="text-gray-300">투명 페트병만 투입해 주세요.</p>
                </div>
              </div>
            </section>

            {/* 오른쪽 - 사이드바 */}
            <RightSection mode="counts" remainingCount={100} currentCount={0} />
          </section>
        </div>
      </main>

      {/* 하단 */}
      <BottomInquire
        rightButtons={[
          {
            text: '투입 완료',
            onClick: () => setIsCompleteModalOpen(true),
            className:
              'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-blue-600 hover:to-cyan-600 px-8 py-4 rounded-4xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl',
          },
        ]}
      />
      {/* 완료 모달 */}
      <CompleteModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        earnedPoints={earnedPoints}
        totalPoints={totalPoints}
      />
    </div>
  );
};

export default BandSplit;