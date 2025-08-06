const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const EventEmitter = require('events');

class SerialHandler extends EventEmitter {
  constructor() {
    super();
    this.port = null;
    this.parser = null; // 파서 인스턴스 추가
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

    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    this.port.open((err) => {
      if (err) {
        console.error(`❌ 포트 열기 오류 (${this.path}):`, err.message);
        this._isConnected = false;
        return;
      }
      this._isConnected = true;
      console.log(`✅ 시리얼 포트가 성공적으로 열렸습니다 (${this.path})`);
    });

    // 파서를 통해 완성된 데이터 라인을 수신
    this.parser.on('data', (data) => this.handleSerialData(data));
    
    this.port.on('close', () => {
      this._isConnected = false;
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
    console.log('Received data line:', receivedString);

    // 수신된 문자열이 유효한 JSON 형식인지 기본적인 확인
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
        console.error(`Failed to parse JSON= "${receivedString}"`, e);
      }
    } else {
      // JSON 형식이 아닌 데이터는 로그만 남기고 무시 (예: 'UART0: on')
      console.log('Ignoring non-JSON data:', receivedString);
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
