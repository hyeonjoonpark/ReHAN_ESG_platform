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
      // 5초 후에 띠 분리 완료 신호 발생
      this.testTimeout = setTimeout(() => {
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
        this.emit('error', err);
        return;
      }
      this._isConnected = true;
      console.log(`✅ 시리얼 포트가 성공적으로 열렸습니다 (${this.path})`);
      this.emit('connected');
    });

    // 'readable' 이벤트는 포트에서 읽을 수 있는 데이터가 있을 때 발생합니다.
    this.port.on('readable', () => {
      let data;
      // .read()는 버퍼에 있는 모든 데이터를 반환합니다.
      while (null !== (data = this.port.read())) {
        this.processDataChunk(data);
      }
    });
    
    this.port.on('close', () => {
      this._isConnected = false;
      this.buffer = ''; 
      console.log('🔌 시리얼 포트 연결이 닫혔습니다.');
    });

    this.port.on('error', (err) => {
      console.error('❌ 시리얼 포트 오류:', err.message);
      this._isConnected = false;
    });
  }

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
      if (this.testTimeout) clearTimeout(this.testTimeout);
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

        switch (true) {
          case json.belt_separator === 1:
            this.emit('hardware_event', { type: 'belt_separator_complete', data: json });
            break;
          case json.input_pet === 1:
            this.emit('hardware_event', { type: 'input_pet_detected', data: json });
            break;
          case json.clear_pet === 1 && json.err_pet === 0:
            this.emit('hardware_event', { type: 'clear_pet_detected', data: json });
            break;
          case json.clear_pet === 0 && json.err_pet === 1:
            this.emit('hardware_event', { type: 'err_pet_detected', data: json });
            break;
          case json.grinder === 1:
            this.emit('hardware_event', { type: 'grinder_direction_detected', data: json });
            break;
          case json.grinder === 0:
            this.emit('hardware_event', { type: 'grinder_end_detected', data: json });
            break;
          default:
            break;
        }
      } catch (e) {
        console.error(`[ERROR] Failed to parse JSON: "${receivedString}"`, e);
      }
    } else {
        console.log(`[INFO] Ignoring non-JSON data: "${receivedString}"`);
    }
  }

  send(data) {
    if (this.testMode) {
      console.log(`[TEST MODE] 데이터 전송 시뮬레이션: ${data}`);
      try {
        const command = JSON.parse(data);

        // 정상 배출 명령 수신 시
        if (command.status_ok === 1) {
          console.log('[TEST MODE] 정상 배출 명령 수신. 3초 후 "올바른 제품" 신호 발생');
          this.testTimeout = setTimeout(() => {
            this.handleSerialData(JSON.stringify({ clear_pet: 1, err_pet: 0 }));
          }, 3000);
        }
        // 그라인더 정방향 명령 수신 시
        else if (command.grinder_foword === 1) {
          console.log('[TEST MODE] 그라인더 정방향 명령 수신. 5초 후 "분쇄 완료" 신호 발생');
          this.testTimeout = setTimeout(() => {
            this.handleSerialData(JSON.stringify({ grinder: 0 }));
          }, 5000);
        }
        // 그라인더 정지 명령 수신 시
        else if (command.grinder_stop === 1) {
          console.log('[TEST MODE] 그라인더 정지 명령 수신. 시나리오 종료.');
          if (this.testTimeout) clearTimeout(this.testTimeout);
        }

      } catch (e) {
        console.error('[TEST MODE] 전송 데이터 파싱 오류:', e);
      }
      return;
    }

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
