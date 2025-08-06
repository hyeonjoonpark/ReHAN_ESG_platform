const { SerialPort } = require('serialport');
const EventEmitter = require('events');

class SerialHandler extends EventEmitter {
  constructor() {
    super();
    this.port = null;
    this.buffer = ''; // 데이터 조각을 저장할 버퍼
    this.path = process.env.SERIAL_PORT;
    this.baudRate = parseInt(process.env.SERIAL_BAUD_RATE, 10) || 115200;
    this._isConnected = false;
    this.testMode = process.env.NODE_ENV === 'development' && !this.path;
    this.testInterval = null;

    this.openGateResponseData = {
      "motor_stop": 0,
      "hopper_open": 1,
      "status_ok": 0,
      "status_error": 0,
      "grinder_on": 0,
      "grinder_off": 0,
      "grinder_foword": 0,
      "grinder_reverse": 0,
      "grinder_stop": 0
    };

    if (this.testMode) {
      console.log('🔌 시리얼 핸들러가 테스트 모드에서 실행됩니다.');
    }
  }

  connect() {
    if (this._isConnected) {
      console.log('이미 연결되어 있습니다.');
      return;
    }
    
    if (this.testMode) {
      this._isConnected = true;
      console.log('✅ 테스트 모드 연결 성공.');
      this.testInterval = setInterval(() => {
        const testData = JSON.stringify({ belt_separator: 1 });
        this.handleSerialData(testData);
      }, 5000);
      return;
    }

    if (!this.path) {
      console.error('❌ 시리얼 포트 경로가 설정되지 않았습니다. .env 파일을 확인해주세요.');
      return;
    }

    this.port = new SerialPort({
      path: this.path,
      baudRate: this.baudRate,
      autoOpen: false,
    });

    this.port.open((err) => {
      if (err) {
        console.error(`❌ 포트 열기 오류 (${this.path}):`, err.message);
        this._isConnected = false;
        return;
      }
      this._isConnected = true;
      console.log(`✅ 시리얼 포트가 성공적으로 열렸습니다 (${this.path})`);
    });

    // Raw 데이터를 직접 처리하도록 'data' 이벤트를 수신합니다.
    this.port.on('data', (chunk) => {
      this.buffer += chunk.toString('utf8');
      
      let start, end;
      // 버퍼에서 '{'로 시작하고 '}'로 끝나는 부분을 찾아서 처리합니다.
      while ((start = this.buffer.indexOf('{')) !== -1 && (end = this.buffer.indexOf('}', start)) !== -1) {
        const potentialJson = this.buffer.substring(start, end + 1);
        
        // 찾은 문자열이 유효한 JSON인지 확인하고 처리합니다.
        this.handleSerialData(potentialJson);

        // 처리한 부분은 버퍼에서 제거합니다.
        this.buffer = this.buffer.substring(end + 1);
      }
    });
    
    this.port.on('close', () => {
      this._isConnected = false;
      this.buffer = ''; // 연결이 닫히면 버퍼를 비웁니다.
      console.log('🔌 시리얼 포트 연결이 닫혔습니다.');
    });

    this.port.on('error', (err) => {
      console.error('❌ 시리얼 포트 오류:', err.message);
      this._isConnected = false;
    });
  }

  disconnect() {
    if (this.testMode) {
      this._isConnected = false;
      clearInterval(this.testInterval);
      console.log('🧪 테스트 모드 연결이 종료되었습니다.');
      return;
    }

    if (this.port && this._isConnected) {
      this.port.close((err) => {
        if (err) {
          return console.error('❌ 포트 닫기 오류:', err.message);
        }
        console.log('✅ 포트가 성공적으로 닫혔습니다.');
      });
    }
  }

  handleSerialData(data) {
    const receivedString = data.toString().trim();

    if (receivedString.startsWith('{') && receivedString.endsWith('}')) {
      try {
        const json = JSON.parse(receivedString);
        console.log('Parsed JSON data:', json);

        if (json.belt_separator === 1) {
          console.log('Belt Separator Opened event detected.');
          
          this.emit('hardware_event', {
            type: 'belt_separator_complete',
            data: json
          });

          if (this.port && this._isConnected) {
              this.port.write(JSON.stringify(this.openGateResponseData));
          }
        }
      } catch (e) {
        // 파싱에 실패하면, 아직 불완전한 데이터 조각일 수 있으므로 오류를 무시합니다.
      }
    }
  }

  send(data) {
    if (this.port && this._isConnected) {
      this.port.write(data, (err) => {
        if (err) {
          return console.log('Error on write: ', err.message);
        }
        console.log('message written');
      });
    } else {
      console.error('Port not open. Cannot send data.');
    }
  }

  isConnected() {
    return this._isConnected;
  }
}

module.exports = SerialHandler;
