const { SerialPort } = require('serialport');
const { createLogger } = require('../utils/logger');
const log = createLogger('Serial');
const EventEmitter = require('events');

class SerialHandler extends EventEmitter {
  constructor() {
    super();
    this.port = null;
    this.buffer = ''; // 데이터 조각을 저장할 버퍼
    this.path = process.env.SERIAL_PORT;
    this.baudRate = parseInt(process.env.SERIAL_BAUD_RATE, 10) || 115200;
    this._isConnected = false;
    this._opening = false;   // 동시 열기 방지
    this._closing = false;   // 동시 닫기 방지
    this.enableHardware = process.env.ENABLE_HARDWARE !== 'false';
    this.testMode = !this.enableHardware || (process.env.NODE_ENV === 'development' && !this.path);
    this.testInterval = null;
    this.prevState = { belt_separator: 0, input_pet: 0, clear_pet: 0, grinder: null, err_pet: 0 };

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
      console.log(`하드웨어 활성화: ${this.enableHardware}`);
    }
  }

  /**
   * 상승엣지 기준 상태를 초기화 (다음 belt=1을 상승엣지로 인식)
   */
  resetEdgeState() {
    this.prevState = { belt_separator: 0, input_pet: 0, clear_pet: 0, grinder: null, err_pet: 0 };
  }

  connect() {
    if (this._isConnected) {
      log.info('이미 연결되어 있습니다.');
      return;
    }
    if (this._opening) {
      log.warn('이미 포트 열기 진행 중입니다.');
      return;
    }
    
    if (this.testMode) {
      this._isConnected = true;
      log.info('✅ 테스트 모드 연결 성공.');
      if (!this.enableHardware) {
        log.info('🔧 하드웨어 비활성화 모드 - 시리얼 통신 없이 실행됩니다.');
        return;
      }
      // 5초 후에 띠 분리 완료 신호 발생
      this.testTimeout = setTimeout(() => {
        const testData = JSON.stringify({ belt_separator: 1 });
        this.handleSerialData(testData);
      }, 5000);
      return;
    }

    if (!this.path) {
      log.error('❌ 시리얼 포트 경로가 설정되지 않았습니다. .env 파일을 확인해주세요.');
      return;
    }

    this.port = new SerialPort({
      path: this.path,
      baudRate: this.baudRate,
      autoOpen: false,
    });

    const maxAttempts = 5;
    const openWithRetry = (attempt) => {
      this.port.open((err) => {
        if (err) {
          const message = err?.message || '';
          const retryable = /Resource temporarily unavailable|Cannot lock port|EBUSY|EACCES/i.test(message);
          if (retryable && attempt < maxAttempts) {
            const delayMs = 1000 * attempt; // 1s, 2s, 3s, ...
            log.warn(`포트 열기 재시도 ${attempt}/${maxAttempts - 1} (${this.path}) - ${message}. ${delayMs}ms 후 재시도`);
            setTimeout(() => openWithRetry(attempt + 1), delayMs);
            return;
          }
          log.error(`❌ 포트 열기 오류 (${this.path}): ${message}`);
          this._isConnected = false;
          this._opening = false;
          this.emit('error', err);
          return;
        }

        this._isConnected = true;
        // 상승엣지 기준을 안전하게 초기화하여 첫 belt_separator=1을 상승엣지로 인식
        this.prevState = { belt_separator: 0, input_pet: 0, clear_pet: 0, grinder: null, err_pet: 0 };
        this._opening = false;
        log.info(`✅ 시리얼 포트가 성공적으로 열렸습니다 (${this.path})`);
        this.emit('connected');
      });
    };

    // 기존 잠금이 남아있을 수 있어 최초 시도는 약간의 지연 후 실행
    this._opening = true;
    setTimeout(() => openWithRetry(1), 200);

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
      // 포트 닫힐 때도 상태 초기화하여 다음 연결에서 깨끗한 시작 보장
      this.prevState = { belt_separator: 0, input_pet: 0, clear_pet: 0, grinder: null, err_pet: 0 };
      log.info('🔌 시리얼 포트 연결이 닫혔습니다.');
    });

    this.port.on('error', (err) => {
      log.error(`❌ 시리얼 포트 오류: ${err.message}`);
      this._isConnected = false;
    });
  }

  processDataChunk(chunk) {
    log.debug(`Chunk Read: ${chunk.toString('utf8')}`);
    this.buffer += chunk.toString('utf8');
    log.debug(`Buffer State: ${this.buffer}`);
    
    let start, end;
    while ((start = this.buffer.indexOf('{')) !== -1 && (end = this.buffer.indexOf('}', start)) !== -1) {
      const potentialJson = this.buffer.substring(start, end + 1);
      // CLI에 색상이 적용된 수신 로그 출력
      log.receive(`📥 [하드웨어→시리얼] 수신: ${potentialJson}`);
      
      this.handleSerialData(potentialJson);

      this.buffer = this.buffer.substring(end + 1);
      log.debug(`Buffer after processing: ${this.buffer}`);
    }
  }

  disconnect() {
    if (this.testMode) {
      this._isConnected = false;
      if (this.testTimeout) clearTimeout(this.testTimeout);
      log.info('🧪 테스트 모드 연결이 종료되었습니다.');
      return;
    }

    if (this._closing) {
      log.warn('이미 포트 닫기 진행 중입니다.');
      return;
    }

    if (this.port) {
      try {
        this._closing = true;
        this.port.close((err) => {
          if (err) {
          return log.error(`❌ 포트 닫기 오류: ${err.message}`);
          }
        log.info('✅ 포트가 성공적으로 닫혔습니다.');
          this._closing = false;
        });
      } catch (e) {
        log.error(`❌ 포트 닫기 중 예외: ${e?.message || e}`);
      } finally {
        this._isConnected = false;
      }
    }
  }

  handleSerialData(data) {
    const receivedString = data.toString().trim();

    if (receivedString.startsWith('{') && receivedString.endsWith('}')) {
      try {
        const json = JSON.parse(receivedString);
        // 하드웨어에서 받은 데이터 - 명확한 구분을 위한 로그 형식
        log.info(`🔽 [하드웨어→서버] RX: ${JSON.stringify(json)}`);

        if (json.movement === 1) {
          this.emit('hardware_event', { type: 'movement', data: json });
        }

        const prev = this.prevState || {};

        // 상승엣지: belt_separator 0->1
        if (prev.belt_separator !== 1 && json.belt_separator === 1) {
          log.info(`✅ belt_separator 상승엣지 감지: ${prev.belt_separator} -> ${json.belt_separator}`);
          log.info(`🔧 hardware_event 발생: belt_separator_complete`);
          this.emit('hardware_event', { type: 'belt_separator_complete', data: json });
        }

        // 상승엣지: input_pet 0->1
        if (prev.input_pet !== 1 && json.input_pet === 1) {
          this.emit('hardware_event', { type: 'input_pet_detected', data: json });
        }

        // 상승엣지: clear_pet 0->1 (input_pet_detected 이벤트)
        if (prev.clear_pet !== 1 && json.clear_pet === 1) {
          log.info(`🔍 clear_pet 상승엣지 감지: ${prev.clear_pet} -> ${json.clear_pet}`);
          this.emit('hardware_event', { type: 'input_pet_detected', data: json });
          
          // grinder=1이 동시에 들어온 경우 즉시 grinder_forward_detected 실행
          if (json.grinder === 1) {
            log.info(`🔍 clear_pet=1, grinder=1 동시 감지 - 즉시 grinder_foword_detected 실행`);
            this.emit('hardware_event', { type: 'grinder_foword_detected', data: json });
          }
        }

        // 상승엣지: grinder 0->1 (clear_pet이 이미 1인 경우)
        if (prev.grinder !== 1 && json.grinder === 1 && json.clear_pet === 1) {
          log.info(`🔍 grinder 상승엣지 감지 (clear_pet=1 상태): ${prev.grinder} -> ${json.grinder}`);
          log.info(`🚀 grinder_foword_detected 이벤트 즉시 발생`);
          this.emit('hardware_event', { type: 'grinder_foword_detected', data: json });
        }

        // 상승엣지: err_pet 조건 (clear_pet=0 && err_pet=1)
        const prevErr = prev.clear_pet === 0 && prev.err_pet === 1;
        const nowErr = json.clear_pet === 0 && json.err_pet === 1;
        if (nowErr && !prevErr) {
          this.emit('hardware_event', { type: 'err_pet_detected', data: json });
        }

        // 하강엣지: grinder 1(or null/undefined) -> 0
        if (json.grinder === 0 && prev.grinder !== 0) {
          this.emit('hardware_event', { type: 'grinder_end_detected', data: json });
        }

        // 상태 업데이트: 관측된 필드만 병합
        this.prevState = { ...prev, ...json };
      } catch (e) {
        log.error(`[ERROR] Failed to parse JSON: "${receivedString}" ${e}`);
      }
    } else {
        log.info(`Ignoring non-JSON data: "${receivedString}"`);
    }
  }

  send(data) {
    if (this.testMode) {
      log.info(`🧪 [TEST MODE] [서버→하드웨어] 데이터 전송 시뮬레이션: ${data}`);
      try {
        const command = JSON.parse(data);

        // 정상 배출 명령 수신 시
        if (command.status_ok === 1) {
          log.info('[TEST MODE] 정상 배출 명령 수신. 3초 후 "올바른 제품" 신호 발생');
          this.testTimeout = setTimeout(() => {
            this.handleSerialData(JSON.stringify({ clear_pet: 1, grinder: 1 }));
          }, 3000);
        }
        // 그라인더 정방향 명령 수신 시
        else if (command.grinder_foword === 1) {
          log.info('[TEST MODE] 그라인더 정방향 명령 수신. 5초 후 "분쇄 완료" 신호 발생');
          this.testTimeout = setTimeout(() => {
            this.handleSerialData(JSON.stringify({ grinder: 0 }));
          }, 5000);
        }
        // 그라인더 정지 명령 수신 시
        else if (command.grinder_stop === 1) {
          log.info('[TEST MODE] 그라인더 정지 명령 수신. 시나리오 종료.');
          if (this.testTimeout) clearTimeout(this.testTimeout);
        }
        // movement 명령 수신 시
        else if (command.movement === 1) {
          log.info('🧪 [TEST MODE] [서버→하드웨어] movement: 1 명령 수신 - 하드웨어로 전송됨');
        }

      } catch (e) {
        log.error(`[TEST MODE] 전송 데이터 파싱 오류: ${e}`);
      }
      return;
    }

    if (this.port && this._isConnected) {
      setTimeout(() => {
        this.port.write(data, (err) => {
          if (err) {
            return log.error(`❌ TX_FAIL ${err.message} | payload=${data}`);
          }
          // CLI에 색상이 적용된 송신 로그 출력
          log.send(`📤 [시리얼→하드웨어] 송신: ${data}`);
        });
      }, 100);
    } else {
      log.error(`❌ TX_SKIP Port not open | payload=${data}`);
    }
  }

  isConnected() {
    return this._isConnected;
  }
}

module.exports = SerialHandler;
