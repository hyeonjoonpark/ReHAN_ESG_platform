'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomInquire from '@/components/BottomInquire';
import RightSection from '@/components/RightSection';
import CompleteModal from '@/components/CompleteModal';
import { useRouter } from 'next/navigation';
import { getFormattedCurrentTime } from '@/utils/updateTime';
import Image from 'next/image';

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
            <section className="lg:col-span-2 flex flex-col justify-start space-y-8 pt-8">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                    띠 분리하기
                    </h2>
                    <p className="text-base text-gray-300 max-w-2xl leading-relaxed">
                    페트병의 입구 부분을 띠 분리기에 넣어주세요.
                    </p>
                </div>
            
                <div className="flex flex-col space-y-8 bg-gray-800 rounded-2xl p-6 border border-white/20 h-full">
                    <section className="flex flex-col space-y-8">
                        <div className="">
                          {/* 왼쪽 ­– 그림
                          <div className="flex space-x-16">
                            <Image src="/images/lid.svg" alt="Lid" width={150} height={150} />
                            <Image src="/images/band.svg" alt="Band" width={150} height={150} />
                          </div> */}

                          {/* 오른쪽 ­– 텍스트 */}
                          <div className="flex flex-col justify-center text-center">
                            <h2 className="text-6xl font-extrabold mb-6">띠 분리하기</h2>
                            <p className="text-3xl leading-snug">
                              페트병의 입구 부분을 <br />
                              띠 분리기에 넣어주세요.
                            </p>
                          </div>
                        </div>
                    </section>
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