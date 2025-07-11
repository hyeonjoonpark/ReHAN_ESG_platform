export interface AddressResult {
  address: string | null;
  error: string | null;
}

export const getAddressFromCoords = async (
  lat: number, 
  lng: number
): Promise<AddressResult> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=ko`,
      {
        headers: {
          'User-Agent': 'PETMON-Kiosk/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('주소 변환 API 요청 실패');
    }
    
    const data = await response.json();
    
    if (data && data.display_name) {
      // 한국 주소 형식으로 파싱
      const addressComponents = data.address;
      if (addressComponents) {
        const road = addressComponents.road || '';
        const houseNumber = addressComponents.house_number || '';
        const quarter = addressComponents.quarter || '';
        const city = addressComponents.city || addressComponents.town || '';
        const state = addressComponents.state || '';
        
        let formattedAddress = '';
        if (state) formattedAddress += state + ' ';
        if (city) formattedAddress += city + ' ';
        if (quarter) formattedAddress += quarter + ' ';
        if (road) formattedAddress += road;
        if (houseNumber) formattedAddress += ' ' + houseNumber;
        
        return {
          address: formattedAddress.trim() || data.display_name,
          error: null
        };
      } else {
        return {
          address: data.display_name,
          error: null
        };
      }
    } else {
      return {
        address: null,
        error: '주소를 찾을 수 없습니다.'
      };
    }
  } catch (error) {
    console.error('주소 변환 오류:', error);
    return {
      address: null,
      error: '주소 변환에 실패했습니다.'
    };
  }
}; 