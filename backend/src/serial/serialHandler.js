const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

class SerialHandler {
  constructor(socketIO) {
    this.socketIO = socketIO;
    this.port = null;
    this.parser = null;
    this.isConnected = false;
    
    // 하드웨어 상태 추적
    this.hardwareState = {
      belt_separator_complete: false,
      hopper_opened: false,
      last_updated: new Date().toISOString()
    };
  }

  // 시리얼 포트 초기화
  initialize() {
    try {
      const portPath = process.env.SERIAL_PORT || '/dev/ttyUSB0'; // Tegra 하드웨어 UART (또는 /dev/ttyUSB0)
      const baudRate = parseInt(process.env.SERIAL_BAUD_RATE) || 115200;

      // 개발 환경에서 시리얼 포트 비활성화 옵션
      if (process.env.DISABLE_SERIAL === 'true') {
        console.log('시리얼 포트가 비활성화되었습니다 (개발 모드)');
        return;
      }

      this.port = new SerialPort({
        path: portPath,
        baudRate: baudRate,
        autoOpen: false
      });

      // 라인 파서 설정 (줄바꿈으로 데이터 구분)
      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));

      // 이벤트 리스너 설정
      this.setupEventListeners();

      // 포트 열기 (에러 처리 개선)
      this.port.open((err) => {
        if (err) {
          console.warn('⚠️  시리얼 포트 연결 실패:', err.message);
          console.log('💡 개발 모드에서는 DISABLE_SERIAL=true 환경변수를 설정하세요');
          this.isConnected = false;
          return;
        }
        console.log('✅ 시리얼 포트가 성공적으로 열렸습니다:', portPath);
        this.isConnected = true;
      });

    } catch (error) {
      console.warn('⚠️  시리얼 포트 초기화 실패:', error.message);
      console.log('💡 시리얼 포트 없이 서버를 실행합니다 (WebSocket만 사용)');
      this.isConnected = false;
    }
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    if (!this.port) return;

    // 포트 열림
    this.port.on('open', () => {
      console.log('✅ 시리얼 포트 연결됨');
      this.isConnected = true;
    });

    // 포트 닫힘
    this.port.on('close', () => {
      console.log('🔌 시리얼 포트 연결 해제됨');
      this.isConnected = false;
    });

    // Raw 데이터 수신 (파서를 거치기 전) - 간소화
    this.port.on('data', (buffer) => {
      const rawString = buffer.toString('utf8');
      console.log('🔍 Raw 데이터:', `"${rawString}" (${buffer.length} bytes)`);
    });

    // 에러 처리 (더 안전하게)
    this.port.on('error', (err) => {
      console.warn('⚠️  시리얼 포트 에러:', err.message);
      this.isConnected = false;
      // 에러를 던지지 않고 로그만 출력
    });

    // 데이터 수신
    if (this.parser) {
      this.parser.on('data', (data) => {
        const rawData = data.toString();
        const trimmedData = rawData.trim();
        
        console.log('🔄 Parser 처리:', `"${trimmedData}"`);
        
        this.handleSerialData(trimmedData);
      });
    }
  }

  // 시리얼 데이터 처리
  handleSerialData(data) {
    // ========== 기본 시리얼 데이터 로그 ==========
    const timestamp = new Date().toISOString();
    console.log(`📥 시리얼 데이터 수신 [${timestamp}]: "${data}"`);
    
    // JSON 형태인지 미리 확인 (성능 최적화)
    if (!data.startsWith('{') || !data.endsWith('}')) {
      console.log('💡 비JSON 데이터 (무시): 시스템 메시지일 가능성');
      return;
    }
    
    try {
      console.log('🔍 JSON 파싱 시도 중...');
      
      // JSON 파싱 시도
      const parsedData = JSON.parse(data);
      
      // JSON 파싱 성공 로그
      console.log('✅ JSON 파싱 성공:');
      console.log('🗂️  파싱된 객체:', JSON.stringify(parsedData, null, 2));
      console.log('🔑 객체 키들:', Object.keys(parsedData));
      
      // belt_separator 신호 확인
      if (parsedData.belt_separator === 1) {
        console.log('🎯 띠분리 완료 신호 수신');
        
        // 하드웨어 상태 업데이트
        this.hardwareState.belt_separator_complete = true;
        this.hardwareState.hopper_opened = true; // 띠분리 완료되면 투입구도 열림
        this.hardwareState.last_updated = new Date().toISOString();
        
        console.log('💾 하드웨어 상태 업데이트:', this.hardwareState);
        
        // 모든 연결된 클라이언트에게 전송
        this.socketIO.emit('hardware_status', {
          type: 'belt_separator_complete',
          data: parsedData,
          timestamp: new Date().toISOString()
        });
        
        // 자동으로 투입구 열림 명령 전송
        setTimeout(() => {
          const hopperOpenCommand = {
            motor_stop: 0,
            hopper_open: 1,
            status_ok: 0,
            status_error: 0,
            grinder_on: 0,
            grinder_off: 0,
            grinder_foword: 0,
            grinder_reverse: 0,
            grinder_stop: 0
          };
          
          console.log('🚪 투입구 열림 명령 자동 전송:', hopperOpenCommand);
          this.sendData(hopperOpenCommand);
        }, 1000); // 1초 후 전송
      }
      
      // hopper_open 신호 확인 (투입구 열림)
      if (parsedData.hopper_open === 1) {
        console.log('🚪 투입구 열림 신호 수신');
        
        // 하드웨어 상태 업데이트
        this.hardwareState.hopper_opened = true;
        this.hardwareState.last_updated = new Date().toISOString();
        
        console.log('💾 투입구 상태 업데이트:', this.hardwareState);
        
        // 모든 연결된 클라이언트에게 전송
        this.socketIO.emit('hardware_status', {
          type: 'hopper_open',
          data: parsedData,
          timestamp: new Date().toISOString()
        });
      }
      
      // 다른 하드웨어 신호들도 처리 가능
      this.socketIO.emit('serial_data', {
        raw_data: data,
        parsed_data: parsedData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      // JSON 파싱 실패 로그 (간소화)
      console.warn('❌ JSON 파싱 실패:', error.message);
      console.warn(`📝 문제 데이터: "${data}"`);
      
      // JSON이 아닌 데이터도 전송 (디버깅용)
      this.socketIO.emit('serial_data', {
        raw_data: data,
        parsed_data: null,
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  // 시리얼 포트에 데이터 전송
  sendData(data) {
    if (!this.isConnected || !this.port) {
      console.warn('⚠️  시리얼 포트가 연결되지 않았습니다');
      return false;
    }

    try {
      const dataToSend = typeof data === 'object' ? JSON.stringify(data) : data;
      const finalData = dataToSend + '\n';
      
      // ========== 상세 시리얼 전송 로그 ==========
      const timestamp = new Date().toISOString();
      const dataLength = finalData.length;
      const dataHex = Buffer.from(finalData, 'utf8').toString('hex');
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📤 시리얼 데이터 전송 [${timestamp}]`);
      console.log(`📊 데이터 길이: ${dataLength} bytes (개행 포함)`);
      console.log(`📝 전송 데이터: "${dataToSend}"`);
      console.log(`🔢 16진수: ${dataHex}`);
      console.log(`📋 원본 타입: ${typeof data}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      this.port.write(finalData);
      return true;
    } catch (error) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.warn('❌ 시리얼 데이터 전송 실패:');
      console.warn(`🔍 에러 메시지: ${error.message}`);
      console.warn(`📝 전송하려던 데이터: ${data}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return false;
    }
  }

  // 연결 상태 확인
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      portPath: this.port?.path || null,
      baudRate: this.port?.baudRate || null
    };
  }

  // 현재 하드웨어 상태 반환
  getCurrentHardwareStatus() {
    console.log('📊 현재 하드웨어 상태 요청:', this.hardwareState);
    return {
      ...this.hardwareState,
      connection_status: this.isConnected
    };
  }

  // 하드웨어 상태 초기화 (테스트용)
  resetHardwareState() {
    console.log('🔄 하드웨어 상태 초기화');
    this.hardwareState = {
      belt_separator_complete: false,
      hopper_opened: false,
      last_updated: new Date().toISOString()
    };
    return this.hardwareState;
  }

  // 테스트용 상태 설정
  setTestState(state) {
    console.log('🧪 테스트 상태 설정:', state);
    this.hardwareState = {
      ...this.hardwareState,
      ...state,
      last_updated: new Date().toISOString()
    };
    console.log('💾 업데이트된 상태:', this.hardwareState);
    return this.hardwareState;
  }

  // 시리얼 포트 종료
  close() {
    try {
      if (this.port && this.port.isOpen) {
        this.port.close();
        console.log('🔌 시리얼 포트 연결이 종료되었습니다');
      }
    } catch (error) {
      console.warn('⚠️  시리얼 포트 종료 중 에러:', error.message);
    }
  }
}

module.exports = SerialHandler;