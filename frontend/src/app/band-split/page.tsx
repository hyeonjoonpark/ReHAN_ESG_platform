'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomInquire from '@/components/BottomInquire';
import RightSection from '@/components/RightSection';
import CompleteModal from '@/components/CompleteModal';
import StartSplitBandSections from '@/components/StartSplitBandSections';
import { useRouter } from 'next/navigation';
import { getFormattedCurrentTime } from '@/utils/updateTime';
import OpenGateSection from '@/components/OpenGateSection';
import CheckSection from '@/components/CheckResourceSection';
import ResourceErrorSection from '@/components/ResourceErrorSection';
import { SectionType } from '@/types/SectionType';

const BandSplit = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const earnedPoints = 10; // TODO: 실제 데이터로 수정
  const totalPoints = 10;
  const router = useRouter();

  const [sectionType, setSectionType] = useState<SectionType>(SectionType.START_SPLIT_BAND); // 예시 값

  /**
   * TODO : 실제 하드웨어 신호 데이터 기반으로 수정 예정
   * 투명 생수병이 아닙니다!
   * 내용물을 제거해주세요!
   * 라벨을 제거해주세요!
   * 뚜껑을 제거해주세요!
   * 띠를 제거해주세요!
   */
  const errorMessage: string = '내용물을 제거해주세요!';

  // 안내 섹션 렌더링 함수
  const renderSection = () => {
    // TODO : 실제 하드웨어 신호 데이터 기반으로 수정 예정
    switch (sectionType) {
      case SectionType.OPEN_GATE:
        return <OpenGateSection />;
      case SectionType.CHECK_RESOURCE:
        return <CheckSection />;
      case SectionType.ERROR:
        return (
          <ResourceErrorSection
            message={errorMessage}
            onHomeClick={() => router.replace('/')}
            onRetryClick={() => setSectionType(SectionType.CHECK_RESOURCE)}
          />
        );
      case SectionType.START_SPLIT_BAND:
        return <StartSplitBandSections />;
      default:
        return <StartSplitBandSections />;
    }
  };

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
            {renderSection()}

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
            disabled: true,
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