'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
import NormallyEndSection from '@/components/NormallyEndSection';
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
  const [userHavedPoints, setUserHavedPoints] = useState<number>(0);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [remainingCount, setRemainingCount] = useState<number>(100);
  const earnedPoints = 10; // TODO: 실제 데이터로 수정
  const totalPoints = userHavedPoints ? Number(userHavedPoints) + earnedPoints : earnedPoints;
  const router = useRouter();

  const [sectionType, setSectionType] = useState<SectionType>(SectionType.START_SPLIT_BAND);

  // 소켓 통신 훅 사용
  const { 
    socket, 
    isConnected, 
    beltSeparatorCompleted, 
    petInserted,
    normallyEnd,
    joinPage,
    leavePage,
    requestHardwareStatus 
  } = useSocket();

  const errorMessage: string = '내용물을 제거해주세요!';

  // 페이지 진입 시 소켓 통신 및 시리얼 포트 관리
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isConnected || !socket || initializedRef.current) return;
    initializedRef.current = true;

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
      initializedRef.current = false;
    };
  }, [isConnected, socket, joinPage, leavePage, requestHardwareStatus]);

  // 클라이언트 마운트 후 localStorage에서 사용자 보유 포인트 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem('user_point');
      const n = Number(stored);
      setUserHavedPoints(Number.isFinite(n) ? n : 0);
    } catch {
      setUserHavedPoints(0);
    }
  }, []);

  // 오늘 사용 이력 개수 불러오기 -> currentCount, remainingCount 설정
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const phone = window.localStorage.getItem('phone_number');
    if (!phone) {
      setCurrentCount(0);
      setRemainingCount(100);
      return;
    }
    const fetchCount = async () => {
      try {
        const res = await axios.get('/api/v1/usage/today-count', { params: { phone_number: phone } });
        const count = Number(res.data?.count ?? 0);
        setCurrentCount(Number.isFinite(count) ? count : 0);
        setRemainingCount(Math.max(0, 100 - (Number.isFinite(count) ? count : 0)));
      } catch {
        setCurrentCount(0);
        setRemainingCount(100);
      }
    };
    fetchCount();
  }, []);

  // 하드웨어 상태 변경 감지 및 화면 전환
  useEffect(() => {
    const handleHopperReady = () => {
      console.log('✅ 투입구 준비 완료, 투입구 열기 요청');
      if (socket) {
        socket.emit('open_gate');
      }
    };

    // 띠분리 완료 시 섹션 타입 변경
    if (beltSeparatorCompleted && sectionType === SectionType.START_SPLIT_BAND) {
      console.log('✅ 띠 분리 완료 - 섹션 타입을 OPEN_GATE로 변경');
      setSectionType(SectionType.OPEN_GATE);
    }
    
    if (socket) socket.on('hopper_ready', handleHopperReady);

    // 페트병 투입 감지 시 (수정: petInserted 자동 진행 로직 제거)
    // if (petInserted && sectionType === SectionType.OPEN_GATE) {
    //   console.log('✅ 페트병 투입 감지 - CHECK_RESOURCE로 변경 후 7초 뒤 정상배출');
    //   setSectionType(SectionType.CHECK_RESOURCE);
    //
    //   const timer = setTimeout(() => {
    //     if (socket) {
    //       const normalEndData = {
    //         motor_stop: 0,
    //         hopper_open: 0,
    //         status_ok: 1,
    //         status_error: 0,
    //         grinder_on: 0,
    //         grinder_off: 0,
    //         grinder_foword: 0,
    //         grinder_reverse: 0,
    //         grinder_stop: 0,
    //       };
    //       // 백엔드에 정상 배출 데이터 전송
    //       socket.emit('serial_data', normalEndData);
    //       // 화면을 정상 종료 상태로 변경
    //       setSectionType(SectionType.NORMALLY_END);
    //     }
    //   }, 7000);
    //
    //   // 컴포넌트 언마운트 시 타이머 정리
    //   return () => clearTimeout(timer);
    // }

    // useSocket 훅에서 normally_end 이벤트를 받으면 화면 전환 (타이머 기반으로 변경)
    // if (normallyEnd && sectionType === SectionType.CHECK_RESOURCE) {
    //   console.log('✅ 정상 종료 신호 수신 - NORMALLY_END로 변경');
    //   setSectionType(SectionType.NORMALLY_END);
    // }
    
    return () => {
      if (socket) socket.off('hopper_ready', handleHopperReady);
    };
  }, [beltSeparatorCompleted, petInserted, normallyEnd, sectionType, socket]);

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
      case SectionType.NORMALLY_END:
        return <NormallyEndSection onHomeClick={() => router.replace('/')} onAddMore={() => setSectionType(SectionType.START_SPLIT_BAND)} />;
      default:
        return <StartSplitBandSections />;
    }
  };

  const handleCompleteClick = () => {
    if (socket && sectionType === SectionType.OPEN_GATE) {
      console.log('✅ 투입 완료 버튼 클릭 - 백엔드에 {"input_pet":1} 신호 전송');
      socket.emit('serial_data', { input_pet: 1 });
      // 7초동안 대기
      setSectionType(SectionType.CHECK_RESOURCE);
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

  // 7초 후 정상 종료 화면으로 전환하는 로직
  useEffect(() => {
    if (sectionType === SectionType.CHECK_RESOURCE) {
      console.log('✅ 검사 화면 진입, 7초 후 정상 종료 화면으로 전환합니다.');
      const timer = setTimeout(() => {
        setSectionType(SectionType.NORMALLY_END);
      }, 7000);

      return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
    }
  }, [sectionType]);

  // START_SPLIT_BAND로 전환될 때마다 초기 시퀀스 재실행(시리얼 재연결 유도)
  useEffect(() => {
    if (!socket) return;
    if (sectionType !== SectionType.START_SPLIT_BAND) return;

    // 페이지 룸 재참여(중복 참여는 socket.io에서 안전)
    joinPage('band-split');

    // 재연결 유도: 닫고 다시 열기 + 상태 요청
    console.log('📡 START_SPLIT_BAND 진입 - 시리얼 재연결 및 투입구 열기/상태 요청 재실행');
    socket.emit('serial_port_close');
    setTimeout(() => {
      socket.emit('open_gate');
      requestHardwareStatus();
    }, 300);
  }, [sectionType, socket, joinPage, requestHardwareStatus]);

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
            <RightSection mode="counts" remainingCount={remainingCount} currentCount={currentCount} />
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
        userHavedPoints={userHavedPoints}
        earnedPoints={earnedPoints}
        totalPoints={totalPoints}
      />
    </div>
  );
};

export default BandSplit;
