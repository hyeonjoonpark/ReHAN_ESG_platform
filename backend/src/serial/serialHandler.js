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
    this.readInterval = null; // 데이터 읽기 인터벌 핸들러

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
      autoOpen: false, // 포트를 수동으로 엽니다.
    });

    this.port.open((err) => {
      if (err) {
        console.error(`❌ 포트 열기 오류 (${this.path}):`, err.message);
        this._isConnected = false;
        return;
      }
      this._isConnected = true;
      console.log(`✅ 시리얼 포트가 성공적으로 열렸습니다 (${this.path})`);

      // 포트가 열리면, 주기적으로 데이터를 읽어오는 로직을 시작합니다.
      this.readInterval = setInterval(() => {
        const data = this.port.read(); // 버퍼에서 모든 데이터를 읽어옵니다.
        if (data) {
          this.processDataChunk(data);
        }
      }, 100); // 100ms 마다 확인
    });

    this.port.on('close', () => {
      this._isConnected = false;
      this.buffer = ''; 
      clearInterval(this.readInterval); // 인터벌 정리
      console.log('🔌 시리얼 포트 연결이 닫혔습니다.');
    });

    this.port.on('error', (err) => {
      console.error('❌ 시리얼 포트 오류:', err.message);
      this._isConnected = false;
      clearInterval(this.readInterval); // 인터벌 정리
    });
  }

  // 데이터를 처리하는 로직을 별도 함수로 분리
  processDataChunk(chunk) {
    console.log(`[DEBUG] Chunk Read: ${chunk.toString('utf8')}`);
    this.buffer += chunk.toString('utf8');
    console.log(`[DEBUG] Buffer State: ${this.buffer}`);
    
    let start, end;
    while ((start = this.buffer.indexOf('{')) !== -1 && (end = this.buffer.indexOf('}', start)) !== -1) {
      const potentialJson = this.buffer.substring(start, end + 1);
      console.log(`[DEBUG] Potential JSON Found: ${potentialJson}`);
      
      this.handleSerialData(potentialJson);

      this.buffer = this.buffer.substring(end + 1);
      console.log(`[DEBUG] Buffer after processing: ${this.buffer}`);
    }
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
        console.log('[SUCCESS] Parsed JSON data:', json);

        if (json.belt_separator === 1) {
          console.log('[SUCCESS] Belt Separator Opened event detected.');
          
          this.emit('hardware_event', {
            type: 'belt_separator_complete',
            data: json
          });

          if (this.port && this._isConnected) {
              this.port.write(JSON.stringify(this.openGateResponseData));
          }
        }
      } catch (e) {
        console.error(`[ERROR] Failed to parse JSON: "${receivedString}"`, e);
      }
    } else {
        console.log(`[INFO] Ignoring non-JSON data: "${receivedString}"`);
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
