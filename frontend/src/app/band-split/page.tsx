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

  const [sectionType, setSectionType] = useState<SectionType>(SectionType.START_SPLIT_BAND); // 예시 값

  // 소켓 통신 훅 사용
  const { 
    socket, 
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


  // 페이지 진입 시 소켓 통신 및 시리얼 포트 관리
  useEffect(() => {
    console.log('🔌 band-split 페이지 진입 - 소켓 연결 상태:', isConnected);
    
    if (isConnected && socket) {
      // 페이지 룸에 참여
      joinPage('band-split');
      
      // 시리얼 포트 열기 요청
      console.log('📡 시리얼 포트 열기 요청 전송');
      socket.emit('serial_port_open');
      
      // 현재 하드웨어 상태 요청
      requestHardwareStatus();
      
      // 시리얼 포트 응답 이벤트 리스너
      socket.on('serial_port_opened', (data: SerialPortResponse) => {
        console.log('✅ 시리얼 포트 열림 응답:', data);
      });
      
      socket.on('serial_port_error', (error: SerialPortResponse) => {
        console.error('❌ 시리얼 포트 오류:', error);
      });
    }
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      if (socket) {
        leavePage('band-split');
        socket.off('serial_port_opened');
        socket.off('serial_port_error');
      }
    };
  }, [isConnected, socket, joinPage, leavePage, requestHardwareStatus]);

  // 하드웨어 상태 변경 감지
  useEffect(() => {
    console.log('🔧 하드웨어 상태 변경:', {
      beltSeparatorCompleted,
      hopperOpened,
      hardwareStatus
    });
    
    // 띠분리 완료 시 섹션 타입 변경
    if (beltSeparatorCompleted && hopperOpened) {
      console.log('🚪 투입구 열림 - 섹션 타입을 OPEN_GATE로 변경');
      setSectionType(SectionType.OPEN_GATE);
    }
  }, [beltSeparatorCompleted, hopperOpened, hardwareStatus]);

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