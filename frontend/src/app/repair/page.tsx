'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import RightSection from '@/components/RightSection';
import BottomInquire from '@/components/BottomInquire';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { getAddressFromCoords } from '@/utils/getAddressFromCoords';

export default function RepairPage() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [arrivalTime, setArrivalTime] = useState<number>(0);
  const [userAddress, setUserAddress] = useState<string>('위치를 찾을 수 없습니다.');
  const [latitude, setLatitude] = useState<number>(37.4842);
  const [longitude, setLongitude] = useState<number>(-122.4194);

  const [adminLatitude, setAdminLatitude] = useState<number>(37.4842);
  const [adminLongitude, setAdminLongitude] = useState<number>(126.7994);
  const [dispatchAddress, setDispatchAddress] = useState<string>('');

  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // 현재 시간 업데이트
    const updateTime = () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const weekday = weekdays[now.getDay()];
      const hour = now.getHours();
      const minute = now.getMinutes();
      const period = hour < 12 ? '오전' : '오후';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      
      setCurrentTime(`${month}월 ${day}일(${weekday}) ${period} ${displayHour}:${minute.toString().padStart(2, '0')}`);
    };
    
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // localStorage에서 주소 가져오기
    const savedAddress = localStorage.getItem('address');
    if (savedAddress) {
      setUserAddress(savedAddress);
    }

    // 도착 시간 카운트다운
    const arrivalInterval = setInterval(() => {
      setArrivalTime(prev => {
        const current = prev ?? 0; // Use nullish coalescing to default to 0
        if (current > 0) {
          return current - 1;
        }
        return 0;
      });
    }, 60000); // 1분마다 감소

    // 브라우저의 현재 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setLatitude(latitude);
          setLongitude(longitude);

          // Google Maps Distance Matrix API 사용
          const response = await fetch(`/api/google-maps?latitude=${latitude}&longitude=${longitude}`);
          const data = await response.json();
          if (data.rows[0].elements[0].status === 'OK') {
            const duration = data.rows[0].elements[0].duration;
            setArrivalTime(Math.ceil(duration.value / 60));
          }

          // 주소 변환
          const addressResult = await getAddressFromCoords(37.4842, 126.7994);
          if (!addressResult.error) {
            setDispatchAddress(addressResult.address || '');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }

    return () => {
      clearInterval(timeInterval);
      clearInterval(arrivalInterval);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      setIsGoogleLoaded(true);
    }
  }, []);

  useEffect(() => {
    // 주소를 위도와 경도로 변환
    const fetchCoordinates = async () => {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=경기도+부천시+소사구+양지로+237&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        const location = data.results[0].geometry.location;
        setAdminLatitude(location.lat);
        setAdminLongitude(location.lng);
      }
    };
    fetchCoordinates();
  }, []);

  return (
    <div className="h-screen bg-white dark:bg-gray-800 text-gray-800 dark:text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <Header currentTime={currentTime} />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          {/* 좌우 분할 레이아웃 */}
          <div className="grid lg:grid-cols-3 gap-8 h-full">
            {/* 왼쪽 - 지도 영역 */}
            <div className="lg:col-span-2 flex flex-col justify-center">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden h-[600px] relative">
                {/* 지도 배경 */}
                {!isGoogleLoaded && (
                  <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                    <GoogleMap
                      mapContainerClassName="w-full h-full"
                      center={{ lat: latitude, lng: longitude }}
                      zoom={14}
                    >
                      {/* 내 위치 마커 */}
                      {latitude && longitude && (
                        <Marker
                          position={{ lat: latitude, lng: longitude }}
                          title={'현재 위치'}
                        />
                      )}
                      {/* 출동 중 마커 */}
                      <Marker
                        position={{ lat: adminLatitude, lng: adminLongitude }}
                        title={'출동 중'}
                        icon={{
                          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                        }}
                      />
                    </GoogleMap>
                  </LoadScript>
                )}
                {/* 하단 정보 */}
                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-blue-600 font-semibold">페트병 매니저가 출동 중입니다.</p>
                        <p className="text-gray-600 dark:text-gray-300">잠시만 기다려주세요.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{arrivalTime !== null ? arrivalTime : 'N/A'}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">분 후 도착 예정</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽 - 사이드바 */}
            <RightSection />
          </div>
        </div>
      </main>

      {/* 하단 */}
      <BottomInquire 
        rightButtons={[{
          text: "수리 중",
          className: "bg-gray-600 hover:bg-gray-700 px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
        }]}
      />
    </div>
  );
}
