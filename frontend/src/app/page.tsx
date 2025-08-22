'use client';

import { useState, useEffect } from 'react';
import ErrorInquireModal from '@/components/ErrorInquireModal';
import Header from '@/components/Header';
import RightSection from '@/components/RightSection';
import BottomInquire from '@/components/BottomInquire';
import Register from '@/components/Register';
import HowToUse from '@/components/HowToUse';
import PointGuide from '@/components/PointGuide';
import ErrorTypeSelect from '@/components/ErrorTypeSelect';
import { ScreenType } from '@/types/ScreenType';
import { useRouter } from 'next/navigation';
import { getAddressFromCoords } from '@/utils/getAddressFromCoords';
import { getFormattedCurrentTime } from '@/utils/updateTime';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// axios 기본 설정
axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(ScreenType.MAIN);
  const [selectedErrorType, setSelectedErrorType] = useState<string | undefined>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const router = useRouter();

  // 위치 정보 가져오기
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('위치 서비스를 지원하지 않습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setLocation({
          latitude: lat,
          longitude: lng
        });
        setLocationError(null);
        
        // 좌표를 주소로 변환
        const result = await getAddressFromCoords(lat, lng);
        setAddress(result.address);
        setAddressError(result.error);
        
        // localStorage에 주소 저장
        if (result.address) {
          localStorage.setItem('address', result.address);
        }
      },
      (error) => {
        let errorMessage = '위치 정보를 가져올 수 없습니다.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다.';
            break;
        }
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5분 캐시
      }
    );
  };

  useEffect(() => {
    // 현재 시간 업데이트
    const updateTime = () => {
      setCurrentTime(getFormattedCurrentTime());
    };
    
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleErrorTypeSelect = (errorType: string) => {
    setSelectedErrorType(errorType);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      console.log('=== 에러 리포트 저장 시도 ===');
      console.log('phoneNumber:', phoneNumber);
      console.log('selectedErrorType:', selectedErrorType);
      console.log('axios.defaults.baseURL:', axios.defaults.baseURL);
      console.log('전체 URL:', axios.defaults.baseURL + '/api/v1/error-report');
      
      const response = await axios.post('/api/v1/error-report', {
        phone_number: phoneNumber,
        error_content: selectedErrorType,
      });
      console.log("response status:", response.status);
      console.log("response data:", response.data);
      
      if (response.status === 201) {
        toast.success('오류 내용이 페트몬 담당자한테 보내졌습니다!', { autoClose: 10000 }); // 10 second
        setIsModalOpen(false);
      }
    } catch (error: unknown) {
      console.error('=== 에러 리포트 저장 실패 ===');
      console.error('Error details:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('Error response:', (error as any).response);
      }
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Error message:', (error as any).message);
      }
      toast.error('오류 내용을 전송하는데 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleInquireClick = () => {
    setCurrentScreen(ScreenType.ERROR_TYPE_SELECT);
  };

  return (
    <div className="h-screen bg-white dark:bg-gray-800 text-gray-800 dark:text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <Header currentTime={currentTime} />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* 메인 타이틀 */}
          <div className="text-left mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              페트몬 입문자를 위한 안내 가이드
            </h2>
            <div className="w-full h-0.5 bg-gray-300 dark:bg-gray-600 mb-4"></div>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              투명 생수병 ai 무인회수기 페트몬을 찾아주셔서 감사합니다.<br />
              궁금하신 내용을 아래 버튼을 터치해 알아보세요.
            </p>
          </div>

          {/* 좌우 분할 레이아웃 */}
          <section className="grid lg:grid-cols-3 gap-8 flex-1">
            {/* 왼쪽 - 메인 컨텐츠 */}
            <section className="lg:col-span-2 flex flex-col justify-center">
              {currentScreen === ScreenType.MAIN ? (
                // 메인 화면 - 기능 카드들
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => setCurrentScreen(ScreenType.REGISTER)}
                    className="bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <h3 className="text-xl font-bold text-white">회원가입하기</h3>
                  </button>

                  <button 
                    onClick={() => setCurrentScreen(ScreenType.HOW_TO_USE)}
                    className="bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <h3 className="text-xl font-bold text-white">이용 방법</h3>
                  </button>

                  <button 
                    onClick={() => setCurrentScreen(ScreenType.POINT_GUIDE)}
                    className="bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <h3 className="text-xl font-bold text-white">포인트 적립<br />안내</h3>
                  </button>

                  <button className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <h3 className="text-xl font-bold text-white">투입 가능 물품</h3>
                  </button>
                </div>
              ) : currentScreen === ScreenType.REGISTER ? (
                // 회원가입 화면
                <Register onBack={() => setCurrentScreen(ScreenType.MAIN)} />
              ) : currentScreen === ScreenType.HOW_TO_USE ? (
                // 이용방법 화면
                <HowToUse onBack={() => setCurrentScreen(ScreenType.MAIN)} />
              ) : currentScreen === ScreenType.POINT_GUIDE ? (
                // 포인트 적립 안내 화면
                <PointGuide onBack={() => setCurrentScreen(ScreenType.MAIN)} />
              ) : currentScreen === ScreenType.ERROR_TYPE_SELECT ? (
                // 오류 유형 선택 화면
                <ErrorTypeSelect 
                  onBack={() => setCurrentScreen(ScreenType.MAIN)} 
                  onErrorTypeSelect={handleErrorTypeSelect}
                />
              ) : null}
            </section>

            {/* 오른쪽 - 사이드바 */}
            <RightSection />
          </section>
        </div>
      </main>

      {/* 하단 */}
      <BottomInquire 
        onInquireClick={handleInquireClick}
        rightButtons={[{
          text: "시작하기",
          onClick: () => router.replace('/login'),
          className: "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-blue-600 hover:to-cyan-600 px-10 py-4 rounded-4xl text-white font-extrabold text-4xl transition-all duration-300 hover:scale-115 hover:shadow-2xl text-center"
        }]}
      />
      
      {/* 모달 */}
      <ErrorInquireModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        errorType={selectedErrorType}
        onSave={handleSave}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        location={location}
        locationError={locationError}
        address={address}
        addressError={addressError}
      />
      <ToastContainer position="top-right" autoClose={10000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}
