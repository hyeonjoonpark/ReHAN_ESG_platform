import React, { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface StartSplitBandSectionsProps {
  onGateOpened?: () => void;
}

const StartSplitBandSections: React.FC<StartSplitBandSectionsProps> = ({ onGateOpened }) => {
  const { socket } = useSocket();

  useEffect(() => {
    // 투입구 오픈 명령어 전송
    if (socket) {
      console.log('✅ 투입구 오픈 명령어 전송');
      const openGateCommand = {"motor_stop":0,"hopper_open":1,"status_ok":0,"status_error":0,"grinder_on":0,"grinder_off":0,"grinder_foword":0,"grinder_reverse":0,"grinder_stop":0};
      socket.emit('serial_data', openGateCommand);
      
      // 투입구 오픈 완료 후 OpenGateSection으로 이동
      setTimeout(() => {
        if (onGateOpened) {
          onGateOpened();
        }
      }, 1000); // 1초 후 투입구 오픈 완료로 간주
    }
  }, [socket, onGateOpened]);

  return (
    <section className="lg:col-span-2 flex flex-col justify-start space-y-8">
      <section className="space-y-8 bg-gray-800 rounded-2xl p-6 border border-white/20 h-full flex items-center justify-center">
        <div className="flex flex-col justify-center text-center items-center">
          {/* 기존 코드 주석처리
          <h2 className="text-6xl font-extrabold mb-6 text-white dark:text-white">띠 분리하기</h2>
          <p className="text-3xl leading-snug text-white dark:text-white">
            페트병의 입구 부분을 <br />
            띠 분리기에 넣어주세요.
          </p>
          */}
          <h2 className="text-6xl font-extrabold mb-6 text-blue-500">투입구 오픈 중...</h2>
          <p className="text-3xl leading-snug text-blue-400">
            투입구를 열고 있습니다.<br />
            잠시만 기다려주세요.
          </p>
        </div>
      </section>
    </section>
  );
};

export default StartSplitBandSections; 