'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import RightSection from '@/components/RightSection';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { getAddressFromCoords } from '@/utils/getAddressFromCoords';

export default function RepairPage() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [arrivalTime, setArrivalTime] = useState<number>(0);
  const [latitude, setLatitude] = useState<number>(37.4842);
  const [longitude, setLongitude] = useState<number>(-122.4194);

  const [adminLatitude, setAdminLatitude] = useState<number>(37.4842);
  const [adminLongitude, setAdminLongitude] = useState<number>(126.7994);

  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [routePolyline, setRoutePolyline] = useState<string | null>(null);
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);
  const [isEstimatedRoute, setIsEstimatedRoute] = useState(false);

  // Polyline 디코딩 함수
  const decodePolyline = (encoded: string): google.maps.LatLngLiteral[] => {
    if (!encoded) return [];
    
    const points: google.maps.LatLngLiteral[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;
    
    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte;
      
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      
      shift = 0;
      result = 0;
      
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      
      points.push({
        lat: lat / 1e5,
        lng: lng / 1e5
      });
    }
    
    return points;
  };



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
      // setUserAddress(savedAddress); // This line is removed
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

          try {
            const apiUrl = `/api/distance-matrix?latitude=${latitude}&longitude=${longitude}&adminLatitude=${adminLatitude}&adminLongitude=${adminLongitude}`;
            console.log('Distance Matrix API 호출:', apiUrl);
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`API 에러 ${response.status}:`, errorText);
              throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              const responseText = await response.text();
              console.error('JSON이 아닌 응답:', responseText);
              throw new Error('응답이 JSON 형식이 아닙니다');
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            
            if (data.rows && data.rows[0] && data.rows[0].elements && data.rows[0].elements[0]) {
              if (data.rows[0].elements[0].status === 'OK') {
                const duration = data.rows[0].elements[0].duration;
                console.log('Duration:', duration);
                setArrivalTime(Math.ceil(duration.value / 60));
                
                // 경로 데이터 처리
                if (data.route_data) {
                  console.log('경로 데이터 수신:', data.route_data);
                  
                  if (data.route_data.polyline) {
                    // 실제 경로 데이터가 있는 경우
                    console.log('실제 경로 polyline 사용');
                    setRoutePolyline(data.route_data.polyline);
                    const decodedPath = decodePolyline(data.route_data.polyline);
                    setRoutePath(decodedPath);
                    setIsEstimatedRoute(false);
                  } else if (data.route_data.is_estimated) {
                    // 추정 모드인 경우
                    console.log('추정 모드: 마커만 표시');
                    
                    if (data.route_data.no_route) {
                      // 경로 없음 - 마커만 표시
                      console.log('경로 없음 - 마커만 표시');
                      setRoutePath([]); // 경로 없음
                      console.log('직선 거리:', data.route_data.straight_distance + 'm');
                      console.log('추정 거리:', data.route_data.estimated_distance + 'm');
                    } else if (data.route_data.route_points && data.route_data.route_points.length > 0) {
                      // 실제 경로가 있는 경우
                      console.log('실제 경로 사용:', data.route_data.route_points);
                      setRoutePath(data.route_data.route_points);
                    }
                    
                    setIsEstimatedRoute(true);
                    console.log('마커만 표시 설정 완료');
                  }
                } else {
                  console.log('경로 데이터가 없습니다. 기본 마커만 표시합니다.');
                }
              } else {
                console.error('Google Maps API 에러:', data.rows[0].elements[0].status);
                setArrivalTime(30); // 기본값 설정
              }
            } else {
              console.error('API 응답 형식이 올바르지 않습니다:', data);
              setArrivalTime(30); // 기본값 설정
            }
          } catch (error) {
            console.error('Routes API 호출 실패:', error);
            
            // Routes API 활성화 안내 메시지
            if (error instanceof Error && error.message.includes('Routes API가 활성화되지 않았습니다')) {
              console.error('⚠️ Routes API를 활성화해주세요: https://console.cloud.google.com/apis/library/routes.googleapis.com');
            }
            
            setArrivalTime(30); // 기본값 설정
          }

          // 주소 변환
          const addressResult = await getAddressFromCoords(37.4842, 126.7994);
          if (!addressResult.error) {
            // setDispatchAddress(addressResult.address || ''); // This line is removed
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
    // 주소를 위도와 경도로 변환
    const fetchCoordinates = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API Key가 설정되지 않았습니다.');
        return;
      }
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=경기도+부천시+소사구+양지로+237&key=${apiKey}`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        const location = data.results[0].geometry.location;
        setAdminLatitude(location.lat);
        setAdminLongitude(location.lng);
      }
    };
    fetchCoordinates();
  }, [adminLatitude, adminLongitude]);

  return (
    <div className="h-screen bg-white dark:bg-gray-800 text-gray-800 dark:text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <Header currentTime={currentTime} />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 px-6 lg:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto h-full">
          {/* 좌우 분할 레이아웃 */}
          <div className="grid lg:grid-cols-3 gap-6 h-full">
            {/* 왼쪽 - 지도 영역 */}
            <div className="lg:col-span-2 flex-col justify-center">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden h-[650px] relative">
                {/* 지도 배경 */}
                {/* 디버깅 정보 */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-xs z-10">
                  <div>Google Loaded: {isGoogleLoaded ? 'Yes' : 'No'}</div>
                  <div>Route Path: {routePath.length} points</div>
                  <div>Route Type: {isEstimatedRoute ? 'Markers Only (마커만)' : 'Actual (실제)'}</div>
                  <div>Polyline: {routePolyline ? 'Yes' : 'No'}</div>
                </div>
                
                <LoadScript 
                  googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
                  onLoad={() => {
                    console.log('Google Maps API 로드 완료');
                    setIsGoogleLoaded(true);
                  }}
                >
                    <GoogleMap
                      mapContainerClassName="w-full h-full"
                      center={{ lat: latitude, lng: longitude }}
                      zoom={10}
                    >
                      {/* 경로 표시 (실제 경로가 있을 때만) */}
                      {routePath.length > 0 && (
                        <Polyline
                          path={routePath}
                          options={{
                            strokeColor: isEstimatedRoute ? '#FFA500' : '#FF0000', // 추정: 주황색, 실제: 빨간색
                            strokeWeight: 6,
                            strokeOpacity: isEstimatedRoute ? 0.7 : 0.9
                          }}
                        />
                      )}
                      
                      {/* 마커 표시 (항상 표시) */}
                      {latitude && longitude && (
                        <Marker
                          position={{ lat: latitude, lng: longitude }}
                          title={'현재 위치'}
                          icon={{
                            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                          }}
                        />
                      )}
                      
                      <Marker
                        position={{ lat: adminLatitude, lng: adminLongitude }}
                        title={'출동 중'}
                        icon={{
                          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                        }}
                      />
                    </GoogleMap>
                  </LoadScript>
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
                      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{arrivalTime !== null ? arrivalTime : 0}</div>
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
    </div>
  );
}
