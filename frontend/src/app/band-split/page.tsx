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
  const [waitingForHardware, setWaitingForHardware] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  // 소켓 통신 훅 사용
  const { 
    socket, 
    isConnected, 
    beltSeparatorCompleted, 
    hopperOpened,
    petInserted,
    normallyEnd,
    joinPage,
    leavePage,
    requestHardwareStatus
  } = useSocket();

  // WebSocket 연결 상태 로그
  useEffect(() => {
    console.log(`🔧 [WebSocket 상태] isConnected: ${isConnected}, socket: ${socket ? '존재' : '없음'}`);
  }, [isConnected, socket]);

  const errorMessage: string = '내용물을 제거해주세요!';

  // 페이지 진입 시 소켓 통신 및 시리얼 포트 관리
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isConnected || !socket || initializedRef.current) return;
    initializedRef.current = true;

    joinPage('band-split');
    console.log('📡 초기 진입 - 시리얼 포트 열기 및 상태 요청 (open_gate 지연)');
    socket.emit('serial_port_open');
    requestHardwareStatus();

    const handleSerialOpened = (data: SerialPortResponse) => {
      console.log('✅ 시리얼 포트 열림 응답:', data);
    };
    const handleSerialError = (error: SerialPortResponse) => {
      console.error('❌ 시리얼 포트 오류:', error);
    };

    socket.on('serial_port_opened', handleSerialOpened);
    socket.on('serial_port_error', handleSerialError);

    // 백엔드에서 전화번호 요청 시 응답
    socket.on('request_phone_number', () => {
      const phoneNumber = localStorage.getItem('phone_number');
      if (phoneNumber) {
        console.log('📱 백엔드에서 전화번호 요청, 응답 전송:', phoneNumber);
        socket.emit('phone_number_response', phoneNumber);
      } else {
        console.warn('⚠️ localStorage에 전화번호가 없어 응답하지 않습니다.');
      }
    });

    return () => {
      leavePage('band-split');
      socket.off('serial_port_opened', handleSerialOpened);
      socket.off('serial_port_error', handleSerialError);
      socket.off('request_phone_number');
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
      console.log('✅ 투입구 준비 완료 신호 수신 - 투입구 열림 상태 설정');
      // hopper_ready 이벤트 수신 시 투입구 열림 상태로 설정
      // 이는 useSocket 훅의 hopperOpened 상태를 직접 설정하는 대신
      // 별도의 상태 관리를 통해 처리
    };

    // 띠분리 완료 시 대기 상태 변경
    if (beltSeparatorCompleted && sectionType === SectionType.START_SPLIT_BAND) {
      console.log('✅ 띠 분리 완료 - 투입구 열기 대기 중');
      setWaitingForHardware(false);
    }

    // belt_separator: 1 데이터 수신 시 START_SPLIT_BAND로 전환 (새로운 띠 분리 시작)
    // 단, 정상 배출 완료 후에는 다시 띠 분리 화면으로 돌아가지 않음
    if (!beltSeparatorCompleted && sectionType === SectionType.NORMALLY_END && !normallyEnd) {
      console.log('🔄 belt_separator: 1 수신 - START_SPLIT_BAND로 전환하여 새로운 띠 분리 시작');
      setWaitingForHardware(true);
      setRetryCount(0);
      setSectionType(SectionType.START_SPLIT_BAND);
    }
    
    if (socket) socket.on('hopper_ready', handleHopperReady);
    
    return () => {
      if (socket) socket.off('hopper_ready', handleHopperReady);
    };
  }, [beltSeparatorCompleted, petInserted, normallyEnd, sectionType, socket]);

  // 투입구 열림 상태에 따른 화면 전환 - 즉시 전환
  useEffect(() => {
    console.log(`🔧 [투입구 상태 체크] hopperOpened=${hopperOpened}, sectionType=${sectionType}`);
    if (hopperOpened && sectionType === SectionType.START_SPLIT_BAND) {
      console.log('✅ 투입구 열림 확인 - 즉시 OpenGateSection으로 전환');
      setSectionType(SectionType.OPEN_GATE);
    }
  }, [hopperOpened, sectionType]);

  // 로그아웃 핸들러
  const handleLogout = () => {
    if (socket) {
      socket.emit('serial_data', { logout: 1 });
    }
    router.replace('/');
  };

  // 띠분리 완료 시 투입구 오픈은 백엔드에서 자동으로 처리됨
  // 프론트엔드에서는 별도의 open_gate 명령 전송 불필요

  // 투입 완료 버튼 클릭 시 자원 확인 중 페이지 표시 - 즉시 전환
  const handleCompleteClick = () => {
    if (socket && sectionType === SectionType.OPEN_GATE) {
      console.log('✅ 투입 완료 버튼 클릭 - 즉시 자원 확인 중 페이지로 전환');
      socket.emit('serial_data', { input_pet: 1 });
      setSectionType(SectionType.CHECK_RESOURCE);
    }
  };

  // 투입 완료 데이터 수신 후 정상 상태 데이터 전송 및 화면 전환 - 즉시 처리
  useEffect(() => {
    if (petInserted) {
      console.log('✅ 투입 완료 데이터 수신 - 즉시 정상 상태 데이터 전송 및 화면 전환');
      if (socket) {
        const normalStateCommand = {"motor_stop":0,"hopper_open":0,"status_ok":1,"status_error":0,"grinder_on":0,"grinder_off":0,"grinder_foword":0,"grinder_reverse":0,"grinder_stop":0};
        socket.emit('serial_data', normalStateCommand);
      }
      setSectionType(SectionType.CHECK_RESOURCE);
    }
  }, [petInserted, socket]);

  // 그라인더 작동 데이터 수신 시 그라인더 정방향 작동 데이터 전송 및 화면 전환 - 즉시 처리
  useEffect(() => {
    if (normallyEnd) {
      console.log('✅ 그라인더 작동 데이터 수신 - 즉시 그라인더 정방향 작동 데이터 전송 및 화면 전환');
      if (socket) {
        const grinderForwardCommand = {"motor_stop":0,"hopper_open":0,"status_ok":0,"status_error":0,"grinder_on":0,"grinder_off":0,"grinder_foword":1,"grinder_reverse":0,"grinder_stop":0};
        socket.emit('serial_data', grinderForwardCommand);
      }
      setSectionType(SectionType.NORMALLY_END);
    }
  }, [normallyEnd, socket]);

  // // 투입구 오픈 완료 핸들러
  // const handleGateOpened = () => {
  //   console.log('✅ 투입구 오픈 완료 - OpenGateSection으로 전환');
  //   setSectionType(SectionType.OPEN_GATE);
  // };

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
        return <NormallyEndSection onHomeClick={handleLogout} />;
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

  // 자원 감지 완료 후 정상 종료 화면으로 전환하는 로직 (타임아웃 폴백: 10초)
  useEffect(() => {
    if (sectionType === SectionType.CHECK_RESOURCE) {
      console.log('✅ 검사 화면 진입, 하드웨어 처리 완료 대기 중 (타임아웃: 10초)');
      const timer = setTimeout(() => {
        console.log('⏰ 자원 감지 타임아웃 - 정상 종료 화면으로 전환');
        setSectionType(SectionType.NORMALLY_END);
      }, 10000);

      return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
    }
  }, [sectionType]);

  // NORMALLY_END 화면에서 사용자 액션 대기 (타임아웃 폴백: 15초)
  useEffect(() => {
    if (sectionType === SectionType.NORMALLY_END) {
      console.log('✅ 정상 종료 화면 진입, 사용자 액션 대기 중 (타임아웃: 15초)');
      const timer = setTimeout(() => {
        console.log('⏰ 정상 종료 타임아웃 - 메인 페이지로 자동 이동');
        router.replace('/');
      }, 15000);

      return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
    }
  }, [sectionType, router]);

  // START_SPLIT_BAND로 전환될 때마다 초기 시퀀스 재실행(불필요한 포트 닫기 제거)
  useEffect(() => {
    if (!socket) return;
    if (sectionType !== SectionType.START_SPLIT_BAND) return;

    // 페이지 룸 재참여(중복 참여는 socket.io에서 안전)
    joinPage('band-split');

    // 포트를 닫지 않고 상태 요청 + 포트 열기만 수행 (이미 열려있으면 서버가 already_open 응답)
    console.log('📡 START_SPLIT_BAND 진입 - 상태 요청 및 포트 열기 (close 제거)');
    socket.emit('serial_port_open');
    requestHardwareStatus();
  }, [sectionType, socket, joinPage, requestHardwareStatus]);

  // 대기 상태에서 belt_separator를 못 받으면 자동 재시도 (최대 3회, 5초 간격)
  useEffect(() => {
    if (!waitingForHardware || sectionType !== SectionType.START_SPLIT_BAND) return;
    if (!socket) return;

    if (beltSeparatorCompleted) {
      setWaitingForHardware(false);
      setRetryCount(0);
      return;
    }

    if (retryCount >= 3) return;

    const timer = setTimeout(() => {
      console.log(`⏳ belt_separator 대기 중 재시도 #${retryCount + 1}`);
      socket.emit('serial_port_open');
      requestHardwareStatus();
      setRetryCount((c) => c + 1);
    }, 5000);

    return () => clearTimeout(timer);
  }, [waitingForHardware, beltSeparatorCompleted, retryCount, sectionType, socket, requestHardwareStatus]);



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
