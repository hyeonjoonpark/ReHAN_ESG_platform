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
import { useSocket } from '@/hooks/useSocket';

const BandSplit = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const earnedPoints = 10; // TODO: 실제 데이터로 수정
  const totalPoints = 10;
  const router = useRouter();

  const [sectionType, setSectionType] = useState<SectionType>(SectionType.START_SPLIT_BAND); // 예시 값
  
  // WebSocket 연결
  const { 
    isConnected, 
    beltSeparatorCompleted, 
    hopperOpened,
    hardwareStatus,
    joinPage,
    leavePage,
    requestHardwareStatus 
  } = useSocket();

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

  // 페이지 진입 시 WebSocket 페이지 참여
  useEffect(() => {
    joinPage('band-split');
    
    // 현재 하드웨어 상태 요청
    requestHardwareStatus();

    return () => {
      leavePage('band-split');
    };
  }, [joinPage, leavePage, requestHardwareStatus]);

  // 하드웨어 상태 변경 감지
  useEffect(() => {
    if (hardwareStatus) {
      console.log('🔍 하드웨어 상태 변경 감지:', hardwareStatus);
      
      if (hardwareStatus.type === 'belt_separator_complete') {
        console.log('🎯 띠분리 완료 감지! UI 업데이트 중...');
        // 투입구 열림 상태 업데이트
        setSectionType(SectionType.OPEN_GATE);
        
        console.log('✅ 띠분리 완료! 투입 완료 버튼 활성화');
        console.log('🔍 현재 beltSeparatorCompleted 상태:', beltSeparatorCompleted);
      }
    }
  }, [hardwareStatus, beltSeparatorCompleted]);

  // 투입 완료 버튼 클릭 핸들러
  const handleCompleteClick = () => {
    if (beltSeparatorCompleted) {
      setIsCompleteModalOpen(true);
    }
  };

  return (
    <div className="h-screen bg-white dark:bg-gray-800 text-gray-800 dark:text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <Header currentTime={currentTime} />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 px-6 lg:px-8 overflow-hidden bg-white dark:bg-gray-800">
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
            disabled: !beltSeparatorCompleted,
            onClick: handleCompleteClick,
            className: `px-8 py-4 rounded-4xl font-semibold text-lg transition-all duration-300 ${
              beltSeparatorCompleted
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-blue-600 hover:to-cyan-600 text-white hover:scale-105 hover:shadow-xl cursor-pointer'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`,
          },
        ]}
      />
      
      {/* WebSocket 연결 상태 표시 (개발용 - 배포 시 제거) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-30 right-7 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs z-40 backdrop-blur-sm border border-gray-600 space-y-1 max-w-xs">
          <div className="font-semibold text-blue-300">🔗 개발 모드</div>
          <div>WebSocket: {isConnected ? '🟢 연결됨' : '🔴 연결 안됨'}</div>
          <div>띠분리 완료: {beltSeparatorCompleted ? '✅ 완료' : '⏳ 대기중'}</div>
          <div>투입구 열림: {hopperOpened ? '✅ 완료' : '⏳ 대기중'}</div>
          {hardwareStatus && (
            <div className="text-gray-300">마지막 신호: {hardwareStatus.type} ({new Date(hardwareStatus.timestamp).toLocaleTimeString()})</div>
          )}
        </div>
      )}
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