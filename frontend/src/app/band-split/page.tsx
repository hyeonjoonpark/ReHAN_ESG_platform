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

// 시리얼 포트 응답 데이터 타입 정의
interface SerialPortResponse {
  status: string;
  message: string;
}

const BandSplit = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const earnedPoints = 10; // TODO: 실제 데이터로 수정
  const totalPoints = 10;
  const router = useRouter();

  const [sectionType, setSectionType] = useState<SectionType>(SectionType.START_SPLIT_BAND);

  // 소켓 통신 훅 사용
  const { 
    socket, 
    isConnected, 
    beltSeparatorCompleted, 
    hopperOpened, 
    joinPage,
    leavePage,
    requestHardwareStatus 
  } = useSocket();

  const errorMessage: string = '내용물을 제거해주세요!';

  // 페이지 진입 시 소켓 통신 및 시리얼 포트 관리
  useEffect(() => {
    if (isConnected && socket) {
      joinPage('band-split');
      
      console.log('📡 투입구 열기(시리얼 포트) 요청 전송');
      socket.emit('open_gate');
      
      requestHardwareStatus();

      const handleSerialOpened = (data: SerialPortResponse) => {
        console.log('✅ 시리얼 포트 열림 응답:', data);
      };
      
      const handleSerialError = (error: SerialPortResponse) => {
        console.error('❌ 시리얼 포트 오류:', error);
      };

      socket.on('serial_port_opened', handleSerialOpened);
      socket.on('serial_port_error', handleSerialError);

      return () => {
        leavePage('band-split');
        socket.off('serial_port_opened', handleSerialOpened);
        socket.off('serial_port_error', handleSerialError);
      };
    }
  }, [isConnected, socket, joinPage, leavePage, requestHardwareStatus]);

  // 하드웨어 상태 변경 감지 및 화면 전환
  useEffect(() => {
    // 띠분리 완료 시 섹션 타입 변경
    if (beltSeparatorCompleted && sectionType === SectionType.START_SPLIT_BAND) {
      console.log('✅ 띠 분리 완료 - 섹션 타입을 BAND_SPLIT_COMPLETE로 변경');
      setSectionType(SectionType.OPEN_GATE);
    }
    
    // 투입구 열림 시 (띠분리가 완료된 상태에서)
    if (hopperOpened && sectionType === SectionType.BAND_SPLIT_COMPLETE) {
      console.log('🚪 투입구 열림 - 섹션 타입을 OPEN_GATE로 변경');
      setSectionType(SectionType.OPEN_GATE);
    }
  }, [beltSeparatorCompleted, hopperOpened, sectionType]);

  // 안내 섹션 렌더링 함수
  const renderSection = () => {
    switch (sectionType) {
      case SectionType.START_SPLIT_BAND:
        return <StartSplitBandSections />;
      case SectionType.BAND_SPLIT_COMPLETE:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-5xl font-bold mb-4">띠 분리 완료!</h1>
            <p className="text-2xl">페트병을 투입구에 넣어주세요.</p>
          </div>
        );
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
      default:
        return <StartSplitBandSections />;
    }
  };

  const handleCompleteClick = () => {
    console.log('🎯 투입 완료 버튼 클릭');
    setIsCompleteModalOpen(true);
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
            disabled: sectionType !== SectionType.OPEN_GATE, // 투입구가 열렸을 때만 활성화
            onClick: handleCompleteClick,
            className: `px-8 py-4 rounded-4xl font-semibold text-lg transition-all duration-300 ${
              sectionType === SectionType.OPEN_GATE
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-blue-600 hover:to-cyan-600 text-white hover:scale-105 hover:shadow-xl cursor-pointer'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`,
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
