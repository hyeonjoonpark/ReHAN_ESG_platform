const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

class SerialHandler {
  constructor(socketIO) {
    this.socketIO = socketIO;
    this.port = null;
    this.parser = null;
    this.isConnected = false;
  }

  // 시리얼 포트 초기화
  initialize() {
    try {
      const portPath = process.env.SERIAL_PORT || '/dev/ttyTHS1'; // Tegra 하드웨어 UART (또는 /dev/ttyUSB0)
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

    // 에러 처리 (더 안전하게)
    this.port.on('error', (err) => {
      console.warn('⚠️  시리얼 포트 에러:', err.message);
      this.isConnected = false;
      // 에러를 던지지 않고 로그만 출력
    });

    // 데이터 수신
    if (this.parser) {
      this.parser.on('data', (data) => {
        this.handleSerialData(data.toString().trim());
      });
    }
  }

  // 시리얼 데이터 처리
  handleSerialData(data) {
    try {
      console.log('시리얼 데이터 수신:', data);
      
      // JSON 파싱 시도
      const parsedData = JSON.parse(data);
      
      // belt_separator 신호 확인
      if (parsedData.belt_separator === 1) {
        console.log('🎯 띠분리 완료 신호 수신');
        
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
      console.warn('시리얼 데이터 JSON 파싱 실패:', data, error.message);
      
      // JSON이 아닌 데이터도 전송
      this.socketIO.emit('serial_data', {
        raw_data: data,
        parsed_data: null,
        timestamp: new Date().toISOString()
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
      this.port.write(dataToSend + '\n');
      console.log('📤 시리얼 데이터 전송:', dataToSend);
      return true;
    } catch (error) {
      console.warn('⚠️  시리얼 데이터 전송 실패:', error.message);
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