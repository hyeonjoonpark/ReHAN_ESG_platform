import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const adminLatitude = searchParams.get('adminLatitude');
  const adminLongitude = searchParams.get('adminLongitude');

  console.log('Distance Matrix API 요청 파라미터:', { latitude, longitude, adminLatitude, adminLongitude });

  if (!latitude || !longitude || !adminLatitude || !adminLongitude) {
    console.error('필수 파라미터 누락:', { latitude, longitude, adminLatitude, adminLongitude });
    return NextResponse.json(
      { message: 'Missing required parameters' },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Google Maps API Key가 설정되지 않았습니다.');
    return NextResponse.json(
      { message: 'Google Maps API Key가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    // Routes API 엔드포인트
    const routesApiUrl = 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';
    
    // Routes API 요청 본문
    const requestBody = {
      origins: [{
        waypoint: {
          location: {
            latLng: {
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude)
            }
          }
        }
      }],
      destinations: [{
        waypoint: {
          location: {
            latLng: {
              latitude: parseFloat(adminLatitude),
              longitude: parseFloat(adminLongitude)
            }
          }
        }
      }],
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE'
    };
    
    console.log('Routes API 호출:', routesApiUrl);
    console.log('Routes API 요청 본문:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(routesApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status,condition'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Routes API HTTP 에러 ${response.status}:`, errorText);
      throw new Error(`Routes API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Routes API 전체 응답:', JSON.stringify(data, null, 2));
    
    // Routes API 응답 구조 확인 및 변환
    if (data && Array.isArray(data) && data.length > 0) {
      const routeData = data[0];
      console.log('첫 번째 경로 데이터:', JSON.stringify(routeData, null, 2));
      
      // ROUTE_NOT_FOUND 에러 처리 - 구글 Directions API 사용
      if (routeData.condition === 'ROUTE_NOT_FOUND') {
        console.log('Routes API에서 경로를 찾을 수 없음. Directions API로 대체 시도합니다.');
        
        try {
          // 구글 Directions API 호출 (레거시이지만 여전히 작동)
          const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${latitude},${longitude}&destination=${adminLatitude},${adminLongitude}&key=${apiKey}&mode=driving&departure_time=now`;
          console.log('Directions API 호출 시도');
          
          const directionsResponse = await fetch(directionsUrl);
          
          if (directionsResponse.ok) {
            const directionsData = await directionsResponse.json();
            console.log('Directions API 응답:', directionsData);
            
            if (directionsData.status === 'OK' && directionsData.routes && directionsData.routes.length > 0) {
              const route = directionsData.routes[0];
              const leg = route.legs[0];
              
              const legacyResponse = {
                status: 'OK',
                rows: [{
                  elements: [{
                    status: 'OK',
                    distance: {
                      text: leg.distance.text,
                      value: leg.distance.value
                    },
                    duration: {
                      text: leg.duration_in_traffic ? leg.duration_in_traffic.text : leg.duration.text,
                      value: leg.duration_in_traffic ? leg.duration_in_traffic.value : leg.duration.value
                    }
                  }]
                }],
                // 경로 정보 추가 (지도에 표시용)
                route_data: {
                  polyline: route.overview_polyline.points,
                  bounds: route.bounds,
                  start_location: leg.start_location,
                  end_location: leg.end_location,
                  waypoints: route.legs[0].steps?.slice(0, 10).map(step => ({
                    location: step.end_location,
                    instructions: step.html_instructions?.replace(/<[^>]*>/g, '') || ''
                  })) || []
                }
              };
              
              console.log('Directions API 기반 응답:', JSON.stringify(legacyResponse, null, 2));
              return NextResponse.json(legacyResponse);
            }
          }
        } catch (directionsError) {
          console.error('Directions API 호출 실패:', directionsError);
        }
        
        // Directions API도 실패한 경우, 현실적인 도로 거리 추정
        console.log('모든 API 실패. 현실적인 도로 경로를 추정합니다.');
        
        // 직선 거리 계산
        const lat1 = parseFloat(latitude);
        const lon1 = parseFloat(longitude);
        const lat2 = parseFloat(adminLatitude);
        const lon2 = parseFloat(adminLongitude);
        
        const R = 6371000; // 지구 반지름 (미터)
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        const straightDistance = R * c;
        
        // 도로 거리는 직선 거리의 1.3-1.5배 (도시 지역 기준)
        const roadDistanceMultiplier = 1.4;
        const estimatedRoadDistance = Math.round(straightDistance * roadDistanceMultiplier);
        
        // 도시 지역 평균 속도 25km/h (교통체증 고려)
        const averageSpeed = 25; // km/h
        const estimatedDurationSeconds = Math.round((estimatedRoadDistance / 1000) * 3600 / averageSpeed);
        
        // 실제 도로 경로 대신 마커만 표시 (경로 없음)
        const generateNoRoute = () => {
          // 경로를 표시하지 않고 마커만 표시
          return [];
        };


        
        // 경로 없이 마커만 표시
        const routePoints = generateNoRoute();
        
        // 추정 거리와 시간 사용 (경로 없이)
        const actualRoadDistance = estimatedRoadDistance;
        const actualDurationSeconds = estimatedDurationSeconds;
        
        console.log(`직선 거리: ${Math.round(straightDistance)}m`);
        console.log(`추정 거리: ${actualRoadDistance}m`);
        console.log(`예상 시간: ${actualDurationSeconds}초 (${Math.round(actualDurationSeconds/60)}분)`);
        console.log('경로 표시: 없음 (마커만 표시)');
        
        const legacyResponse = {
          status: 'OK',
          rows: [{
            elements: [{
              status: 'OK',
              distance: {
                text: `${Math.round(actualRoadDistance / 1000)} km (도로)`,
                value: actualRoadDistance
              },
              duration: {
                text: `${Math.round(actualDurationSeconds / 60)} mins (도로)`,
                value: actualDurationSeconds
              }
            }]
          }],
          // 경로 없음 - 마커만 표시
          route_data: {
            polyline: null,
            route_points: [], // 경로 없음
            bounds: {
              northeast: {
                lat: Math.max(lat1, lat2),
                lng: Math.max(lon1, lon2)
              },
              southwest: {
                lat: Math.min(lat1, lat2),
                lng: Math.min(lon1, lon2)
              }
            },
            start_location: { lat: lat1, lng: lon1 },
            end_location: { lat: lat2, lng: lon2 },
            is_estimated: true,
            no_route: true, // 경로 없음 표시
            straight_distance: Math.round(straightDistance),
            estimated_distance: actualRoadDistance
          }
        };
        
        console.log('마커만 표시 응답:', JSON.stringify(legacyResponse, null, 2));
        return NextResponse.json(legacyResponse);
      }
      
      // 성공적인 경로 응답인지 확인
      if (routeData && routeData.distanceMeters && routeData.duration) {
        // 거리와 시간 추출
        let distanceMeters = routeData.distanceMeters;
        let durationSeconds = 0;
        
        if (routeData.duration) {
          // duration이 "123s" 형식인지 숫자인지 확인
          if (typeof routeData.duration === 'string' && routeData.duration.endsWith('s')) {
            durationSeconds = parseInt(routeData.duration.replace('s', ''));
          } else if (typeof routeData.duration === 'number') {
            durationSeconds = routeData.duration;
          } else if (routeData.duration.seconds) {
            durationSeconds = routeData.duration.seconds;
          }
        }
        
        const legacyResponse = {
          status: 'OK',
          rows: [{
            elements: [{
              status: 'OK',
              distance: {
                text: `${Math.round(distanceMeters / 1000)} km`,
                value: distanceMeters
              },
              duration: {
                text: `${Math.round(durationSeconds / 60)} mins`,
                value: durationSeconds
              }
            }]
          }]
        };
        
        console.log('변환된 응답:', JSON.stringify(legacyResponse, null, 2));
        return NextResponse.json(legacyResponse);
      }
    }
    
    // 실패한 경우
    console.error('Routes API 응답 파싱 실패:', data);
    return NextResponse.json(
      { 
        message: 'Routes API error', 
        status: data?.status || 'UNKNOWN_ERROR',
        error_message: 'Failed to parse route information',
        raw_response: data
      },
      { status: 500 }
    );
    
  } catch (error) {
    console.error('Routes API Error:', error);
    
    // Routes API가 활성화되지 않은 경우 안내 메시지 추가
    if (error.message.includes('403') || error.message.includes('API_NOT_ENABLED')) {
      return NextResponse.json(
        { 
          message: 'Routes API가 활성화되지 않았습니다. Google Cloud Console에서 Routes API를 활성화해주세요.',
          error: error.message,
          guide: 'https://console.cloud.google.com/apis/library/routes.googleapis.com'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Routes API 호출 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
}
