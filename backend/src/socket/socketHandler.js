/**
 * @file socketHandler.js
 * @description WebSocket 통신을 통한 실시간 하드웨어 상태 관리
 * 
 * 이 파일은 Socket.IO를 사용하여 프론트엔드와 백엔드 간의 실시간 통신을 처리합니다.
 * 시리얼 통신으로부터 받은 하드웨어 상태를 WebSocket을 통해 프론트엔드로 전송하고,
 * 프론트엔드에서 요청하는 하드웨어 제어 명령을 처리합니다.
 * 
 * @author ReHAN ESG Platform Team
 * @version 1.0.0
 */

const { Server } = require('socket.io');
const { createLogger } = require('../utils/logger');
const SerialHandler = require('../serial/serialHandler');

const log = createLogger('SocketHandler');
const UsageUser = require('../models/usage_user/UsageUser');
const PetBottle = require('../models/pet_bottle/PetBottle');

class SocketHandler {
  constructor(server) {
    // Socket.IO 서버 초기화
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.serialHandler = null;
    this.connectedClients = new Map(); // 연결된 클라이언트 관리
    this.pageRooms = new Map(); // 페이지별 룸 관리
    this.pendingCommand = null; // 보류 중인 명령
    this.serialOpening = false; // 시리얼 열기 진행 상태
    this._lastCmdTs = Object.create(null); // 명령 디듀프 타임스탬프 저장
    this._currentCycle = 0; // belt_separator 사이클 구분자
    this._gateOpenedInCycle = false; // 현재 사이클에서 투입구 열기 전송 여부
    this._lastBeltAt = 0; // 마지막 belt_separator 처리 시각 (ms)
    this._beltDebounceMs = Number(process.env.BELT_DEBOUNCE_MS || 1500); // 중복 belt 신호 억제 시간

    this.setupSocketEvents();
    log.info('🔌 Socket.IO 서버가 초기화되었습니다.');
  }

  /**
   * 하드웨어로 명령 전송(디듀프 포함)
   * @param {string} reason - 전송 사유/출처 라벨
   * @param {Object} command - 전송할 명령 객체
   * @param {string} dedupKey - 디듀프 키(같은 키는 dedupMs 내 재전송 방지)
   * @param {number} dedupMs - 디듀프 시간(ms)
   */
  sendCommand(reason, command, dedupKey, dedupMs = 1500) {
    try {
      log.info(`🔧 [명령 전송 시도] reason=${reason}, command=${JSON.stringify(command)}, dedupKey=${dedupKey}`);
      
      if (!this.serialHandler || !this.serialHandler.isConnected()) {
        return log.error(`❌ CMD_SKIP serial_disconnected | reason=${reason} | cmd=${JSON.stringify(command)}`);
      }
      
      if (dedupKey) {
        const now = Date.now();
        const last = this._lastCmdTs[dedupKey] || 0;
        if (now - last < dedupMs) {
          return log.debug(`⏭️ CMD_DEDUP key=${dedupKey} within ${dedupMs}ms | reason=${reason}`);
        }
        this._lastCmdTs[dedupKey] = now;
        log.info(`✅ 디듀프 통과: key=${dedupKey}, last=${last}, now=${now}`);
      }
      
      // 100ms 지연 후 하드웨어로 명령 전송
      log.info(`⏰ 100ms 후 명령 전송 예정: ${JSON.stringify(command)}`);
      setTimeout(() => {
        log.info(`🚀 [명령 전송 실행] reason=${reason}, command=${JSON.stringify(command)}`);
        this.serialHandler.send(JSON.stringify(command));
        log.info(`✅ [서버→하드웨어] TX_CMD reason=${reason} cmd=${JSON.stringify(command)}`);
      }, 100);
    } catch (e) {
      log.error(`❌ CMD_ERROR reason=${reason} err=${e?.message || e}`);
    }
  }

  /**
   * 시리얼 핸들러 설정
   * @param {SerialHandler} serialHandler - 시리얼 통신 핸들러 인스턴스
   */
  setSerialHandler(serialHandler) {
    this.serialHandler = serialHandler;

    this.serialHandler.on('hardware_event', ({ type, data }) => {
      log.info(`🔧 [하드웨어 이벤트 수신] type: ${type}, data: ${JSON.stringify(data)}`);
      this.notifyHardwareStatus(type, data);
      
      // 띠분리 완료 신호 수신 시 투입구 오픈 명령 전송
      if (type === 'belt_separator_complete') {
        log.info('✅ 띠분리 완료 신호 수신, 투입구 오픈 데이터 전송 시작');
        const openGateCommand = {"motor_stop":0,"hopper_open":1,"status_ok":0,"status_error":0,"grinder_on":0,"grinder_off":0,"grinder_foword":0,"grinder_reverse":0,"grinder_stop":0};
        this.sendCommand('belt_separator_complete:open_gate', openGateCommand, 'hopper_open');
        log.info('✅ 투입구 오픈 명령 전송 완료');
      }
      
      // 투입 완료 데이터 수신 시 정상 상태 데이터 전송
      if (type === 'input_pet_detected') {
        log.info('투입 완료 데이터 수신, 정상 상태 데이터 전송');
        const normalStateCommand = {"motor_stop":0,"hopper_open":0,"status_ok":1,"status_error":0,"grinder_on":0,"grinder_off":0,"grinder_foword":0,"grinder_reverse":0,"grinder_stop":0};
        this.sendCommand('input_pet_detected:normal_state', normalStateCommand, 'status_ok');
      }
      
      // 그라인더 정방향 감지 시 그라인더 정방향 작동 데이터 전송
      if (type === 'grinder_foword_detected') {
        log.info('그라인더 정방향 감지, 그라인더 정방향 작동 데이터 전송');
        const grinderForwardCommand = {"motor_stop":0,"hopper_open":0,"status_ok":0,"status_error":0,"grinder_on":0,"grinder_off":0,"grinder_foword":1,"grinder_reverse":0,"grinder_stop":0};
        this.sendCommand('grinder_foword_detected:grinder_forward', grinderForwardCommand, 'grinder_foword');
      }
      
      // 그라인더 종료 감지 시 그라인더 정지 데이터 전송
      if (type === 'grinder_end_detected') {
        log.info('그라인더 종료 감지, 그라인더 정지 데이터 전송');
        const grinderStopCommand = {"motor_stop":0,"hopper_open":0,"status_ok":0,"status_error":0,"grinder_on":0,"grinder_off":0,"grinder_foword":0,"grinder_reverse":0,"grinder_stop":1};
        this.sendCommand('grinder_end_detected:grinder_stop', grinderStopCommand, 'grinder_stop');
      }
      
      // 에러 페트 감지 시 에러 상태 데이터 전송
      if (type === 'err_pet_detected') {
        log.info('에러 페트 감지, 에러 상태 데이터 전송');
        const errorCommand = {"motor_stop":0,"hopper_open":0,"status_ok":0,"status_error":1,"grinder_on":0,"grinder_off":0,"grinder_foword":0,"grinder_reverse":0,"grinder_stop":0};
        this.sendCommand('err_pet_detected:status_error', errorCommand, 'status_error');
        this.broadcastToAll('hardware_status', { type: 'resource_error', data: {}, timestamp: new Date().toISOString() });
      }
    });

    // 모든 하드웨어 이벤트는 위의 hardware_event 핸들러에서 통합 처리됨

    // 추가 투입 및 종료 처리 로직은 기존 로직을 유지하며 필요 시 추가 구현

    log.info('🔗 시리얼 핸들러가 소켓 핸들러에 연결되었습니다.');
  }

  /**
   * Socket.IO 이벤트 설정
   */
  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      log.info(`🔗 클라이언트 연결됨: ${socket.id}`);
      
      // 연결된 클라이언트 정보 저장
      this.connectedClients.set(socket.id, {
        socket,
        connectedAt: new Date(),
        currentPage: null
      });

      // 연결 확인 응답
      socket.emit('connection_confirmed', {
        clientId: socket.id,
        timestamp: new Date().toISOString(),
        message: '서버에 성공적으로 연결되었습니다.'
      });

      // 페이지 룸 참여 이벤트
      socket.on('join_page', (data) => {
        const { page } = data;
        log.info(`📄 클라이언트 ${socket.id}가 ${page} 페이지에 참여`);
        
        socket.join(page);
        
        // 클라이언트 정보 업데이트
        const clientInfo = this.connectedClients.get(socket.id);
        if (clientInfo) {
          clientInfo.currentPage = page;
        }
        
        // 페이지 룸 정보 업데이트
        if (!this.pageRooms.has(page)) {
          this.pageRooms.set(page, new Set());
        }
        this.pageRooms.get(page).add(socket.id);
        
        socket.emit('page_joined', { page, timestamp: new Date().toISOString() });
      });

      // 페이지 룸 나가기 이벤트
      socket.on('leave_page', (data) => {
        const { page } = data;
        log.info(`📄 클라이언트 ${socket.id}가 ${page} 페이지에서 나감`);
        
        socket.leave(page);
        
        // 페이지 룸 정보 업데이트
        if (this.pageRooms.has(page)) {
          this.pageRooms.get(page).delete(socket.id);
          if (this.pageRooms.get(page).size === 0) {
            this.pageRooms.delete(page);
          }
        }
        
        socket.emit('page_left', { page, timestamp: new Date().toISOString() });
      });

      // 시리얼 포트 열기 요청
      socket.on('serial_port_open', () => {
        log.info(`📡 클라이언트 ${socket.id}에서 시리얼 포트 열기 요청`);
        
        if (!this.serialHandler) {
          socket.emit('serial_port_error', {
            status: 'error',
            message: '시리얼 핸들러가 초기화되지 않았습니다.'
          });
          return;
        }

        try {
          // 엣지/사이클 상태를 항상 초기화하여 다음 belt=1을 상승엣지로 수용
          if (typeof this.serialHandler.resetEdgeState === 'function') {
            this.serialHandler.resetEdgeState();
          }
          this._gateOpenedInCycle = false;
          this._lastBeltAt = 0;

          if (this.serialHandler.isConnected()) {
            socket.emit('serial_port_opened', {
              status: 'already_open',
              message: '시리얼 포트가 이미 열려있습니다.'
            });
          } else {
            // 시리얼 포트 열기 시도
            if (this.serialHandler.connect) {
              this.serialHandler.connect();
              
              // 연결 상태 확인 후 응답
              setTimeout(() => {
                if (this.serialHandler.isConnected()) {
                  socket.emit('serial_port_opened', {
                    status: 'opened',
                    message: '시리얼 포트가 성공적으로 열렸습니다.'
                  });
                } else {
                  socket.emit('serial_port_error', {
                    status: 'error',
                    message: '시리얼 포트 열기에 실패했습니다.'
                  });
                }
              }, 1000);
            } else {
              socket.emit('serial_port_error', {
                status: 'error',
                message: '시리얼 핸들러에 connect 메서드가 없습니다.'
              });
            }
          }
        } catch (error) {
           log.error(`❌ 시리얼 포트 열기 중 오류: ${error.message}`);
          socket.emit('serial_port_error', {
            status: 'error',
            message: error.message
          });
        }
      });

      // 시리얼 포트 닫기 요청
      socket.on('serial_port_close', () => {
        log.info(`📡 클라이언트 ${socket.id}에서 시리얼 포트 닫기 요청`);
        
        if (!this.serialHandler) {
          socket.emit('serial_port_error', {
            status: 'error',
            message: '시리얼 핸들러가 초기화되지 않았습니다.'
          });
          return;
        }

        try {
          if (this.serialHandler.disconnect) {
            this.serialHandler.disconnect();
            this.serialOpening = false;
            socket.emit('serial_port_closed', {
              status: 'closed',
              message: '시리얼 포트가 닫혔습니다.'
            });
          } else {
            socket.emit('serial_port_error', {
              status: 'error',
              message: '시리얼 핸들러에 disconnect 메서드가 없습니다.'
            });
          }
        } catch (error) {
          log.error(`❌ 시리얼 포트 닫기 중 오류: ${error.message}`);
          socket.emit('serial_port_error', {
            status: 'error',
            message: error.message
          });
        }
      });

      // 현재 하드웨어 상태 요청
      socket.on('request_hardware_status', () => {
        log.info(`📊 클라이언트 ${socket.id}에서 하드웨어 상태 요청`);
        
        if (!this.serialHandler) {
          socket.emit('hardware_status_error', {
            message: '시리얼 핸들러가 초기화되지 않았습니다.'
          });
          return;
        }

        try {
          // 현재 하드웨어 상태 가져오기
          const currentStatus = this.serialHandler.getCurrentHardwareStatus 
            ? this.serialHandler.getCurrentHardwareStatus() 
            : {};
          
          const isConnected = this.serialHandler ? this.serialHandler.isConnected() : false;

          socket.emit('current_hardware_status', {
            isConnected,
            hardwareState: currentStatus,
            timestamp: new Date().toISOString()
          });

          // 띠분리 완료 상태가 있으면 하드웨어 상태 이벤트도 전송
          if (currentStatus.belt_separator_complete) {
            socket.emit('hardware_status', {
              type: 'belt_separator_complete',
              data: { belt_separator: 1 },
              timestamp: new Date().toISOString()
            });
          }

        } catch (error) {
          log.error(`❌ 하드웨어 상태 요청 중 오류: ${error.message}`);
          socket.emit('hardware_status_error', {
            message: error.message
          });
        }
      });
      
      // 투입구 열기 요청
      socket.on('open_gate', () => {
        log.info(`🚪 클라이언트 ${socket.id}에서 투입구 열기 요청`);
        
        if (!this.serialHandler) {
          return socket.emit('serial_port_error', { message: '시리얼 핸들러가 초기화되지 않았습니다.' });
        }
        
        // 사이클당 1회만 투입구 열기 명령 허용
        if (this._gateOpenedInCycle) {
          log.debug('open_gate 요청 무시: 이미 현재 사이클에서 투입구 열림 명령 전송됨');
          return;
        }

        try {
          if (this.serialHandler.isConnected()) {
            const command = {"motor_stop":0,"hopper_open":1,"status_ok":0,"status_error":0,"grinder_on":0,"grinder_off":0,"grinder_foword":0,"grinder_reverse":0,"grinder_stop":0};
            this.sendCommand('open_gate:already_connected', command, `hopper_open:cycle:${this._currentCycle}`);
            this._gateOpenedInCycle = true;
            return;
          }
          // 이미 열기 진행 중이면 연결 완료까지 대기 후 전송
          if (this.serialOpening) {
            log.info('⏳ 시리얼 포트 열기 진행 중, 연결 완료 후 명령 전송 예정');
            this.serialHandler.once('connected', () => {
              const command = {"motor_stop":0,"hopper_open":1,"status_ok":0,"status_error":0,"grinder_on":0,"grinder_off":0,"grinder_foword":0,"grinder_reverse":0,"grinder_stop":0};
              this.sendCommand('open_gate:after_connect', command, `hopper_open:cycle:${this._currentCycle}`);
              this._gateOpenedInCycle = true;
              socket.emit('serial_port_opened', { status: 'opened', message: '시리얼 포트가 성공적으로 열리고 명령이 전송되었습니다.' });
            });
            return;
          }

          this.serialOpening = true;
          this.serialHandler.connect();
          this.serialHandler.once('connected', () => {
            this.serialOpening = false;
            const command = {"motor_stop":0,"hopper_open":1,"status_ok":0,"status_error":0,"grinder_on":0,"grinder_off":0,"grinder_foword":0,"grinder_reverse":0,"grinder_stop":0};
            this.sendCommand('open_gate:after_connect', command, `hopper_open:cycle:${this._currentCycle}`);
            this._gateOpenedInCycle = true;
            socket.emit('serial_port_opened', { status: 'opened', message: '시리얼 포트가 성공적으로 열리고 명령이 전송되었습니다.' });
          });
          this.serialHandler.once('error', (err) => {
            this.serialOpening = false;
            socket.emit('serial_port_error', { status: 'error', message: `시리얼 포트 열기 실패: ${err.message}` });
          });
          
        } catch (error) {
            log.error(`❌ 투입구 열기 요청 중 오류: ${error.message}`);
          socket.emit('serial_port_error', { message: error.message });
        }
      });

      // socket.on('movement', (data) => {
      //   log.info(`💻 클라이언트 ${socket.id}로부터 움직임 데이터 수신: ${JSON.stringify(data)}`);
      //   this.broadcastToAll('movement', data);
      // });

      // 시리얼 데이터 수신 (프론트엔드로부터)
      socket.on('serial_data', (data) => {
        log.info(`📱 [웹클라이언트→서버] 클라이언트 ${socket.id}로부터 데이터 수신: ${JSON.stringify(data)}`);

        // 프론트엔드에서 movement 데이터를 보낼 때
        if (data && data.movement === 1) {
          log.info('🚀 [서버→하드웨어] movement: 1 데이터를 하드웨어로 전송');
          if (this.serialHandler && this.serialHandler.isConnected()) {
            // 100ms 지연 후 하드웨어로 데이터 전송
            setTimeout(() => {
              this.serialHandler.send(JSON.stringify(data));
            }, 100);
          } else {
            log.error('❌ 시리얼 핸들러가 연결되지 않아 movement 데이터를 보낼 수 없습니다.');
          }
        }

        // 프론트엔드에서 투입 완료 버튼을 눌렀을 때
        if (data && data.input_pet === 1) {
          if (this.serialHandler && this.serialHandler.isConnected()) {
            const command = {"motor_stop":0,"hopper_open":0,"status_ok":1,"status_error":0,"grinder_on":0,"grinder_off":0,"grinder_foword":0,"grinder_reverse":0,"grinder_stop":0};
            this.sendCommand('frontend:status_ok', command, 'status_ok');
            
            // PetBottle 테이블에 사용자 전화번호 저장
            this.savePetBottleRecord(socket);
            
            // 프론트엔드에 정상 종료 알림
            this.broadcastToAll('hardware_status', { 
              type: 'normally_end', 
              data: { source: 'frontend', command }, 
              timestamp: new Date().toISOString() 
            });
          } else {
            log.error('❌ 시리얼 핸들러가 연결되지 않아 정상 배출 명령을 보낼 수 없습니다.');
            socket.emit('hardware_status_error', {
              message: '시리얼 핸들러가 연결되지 않았습니다.'
            });
          }
        }
      });

      // 연결 해제 처리
      socket.on('disconnect', (reason) => {
        log.info(`🔗 클라이언트 연결 해제: ${socket.id}, 이유: ${reason}`);
        
        // 연결된 클라이언트 목록에서 제거
        this.connectedClients.delete(socket.id);
        
        // 모든 페이지 룸에서 제거
        for (const [page, clients] of this.pageRooms.entries()) {
          clients.delete(socket.id);
          if (clients.size === 0) {
            this.pageRooms.delete(page);
          }
        }
      });

      // 에러 처리
      socket.on('error', (error) => {
        log.error(`❌ 소켓 오류 (${socket.id}): ${error}`);
      });
    });
  }

  /**
   * 모든 연결된 클라이언트에게 메시지 브로드캐스트
   * @param {string} event - 이벤트 이름
   * @param {Object} data - 전송할 데이터
   */
  broadcastToAll(event, data) {
    log.debug(`브로드캐스트: ${event} ${JSON.stringify(data)}`);
    this.io.emit(event, data);
  }

  /**
   * 특정 페이지의 클라이언트들에게만 메시지 전송
   * @param {string} page - 페이지 이름
   * @param {string} event - 이벤트 이름
   * @param {Object} data - 전송할 데이터
   */
  broadcastToPage(page, event, data) {
    log.debug(`브로드캐스트(${page}): ${event} ${JSON.stringify(data)}`);
    this.io.to(page).emit(event, data);
  }

  /**
   * 하드웨어 상태 변경을 모든 클라이언트에게 알림
   * @param {string} type - 하드웨어 이벤트 타입
   * @param {Object} data - 하드웨어 데이터
   */
  notifyHardwareStatus(type, data) {
    const statusData = {
      type,
      data,
      timestamp: new Date().toISOString()
    };
    
    log.info(`🔧 [하드웨어→웹클라이언트] 하드웨어 상태 알림: ${JSON.stringify(statusData)}`);
    this.broadcastToAll('hardware_status', statusData);

    // 투입구가 열렸다는 신호를 받으면, 프론트엔드에 투입구 열 준비 완료를 알림
    if (type === 'belt_separator_complete') {
      const now = Date.now();
      if (now - this._lastBeltAt < this._beltDebounceMs) {
        return log.debug(`belt_separator_complete 디바운스: ${now - this._lastBeltAt}ms < ${this._beltDebounceMs}ms`);
      }
      this._lastBeltAt = now;
      // 새 사이클 시작: 게이트 오픈 허용 상태 초기화
      this._currentCycle += 1;
      this._gateOpenedInCycle = false;
      this.broadcastToPage('band-split', 'hopper_ready', {
        message: 'Hopper is ready to be opened.'
      });
      log.info('✅ 띠 분리 완료, 프론트엔드에 투입구 열기 준비 알림');
    }

    // 페트병 투입이 감지되면: 정상 배출 명령 전송 + 프론트엔드 알림
    if (type === 'input_pet_detected') {
      // 하드웨어에 정상 배출 명령 전송
      const command = {
        "motor_stop": 0,
        "hopper_open": 0,
        "status_ok": 1,
        "status_error": 0,
        "grinder_on": 0,
        "grinder_off": 0,
        "grinder_foword": 0,
        "grinder_reverse": 0,
        "grinder_stop": 0
      };
      this.sendCommand('hw_detected:status_ok', command, 'status_ok');

      // PetBottle 테이블에 사용자 전화번호 저장 (band-split 페이지 클라이언트에게만)
      this.savePetBottleRecordForHardwareEvent();

      // 프론트엔드에 투입 알림 브로드캐스트
      this.broadcastToAll('hardware_status', { type: 'pet_inserted', data, timestamp: new Date().toISOString() });
      log.info('🐾 페트병 투입 감지, 프론트엔드에 알림.');

      // 현재 사이클에서 추가 open_gate를 명시적으로 봉인하여 중복 열림 방지
      if (!this._gateOpenedInCycle) {
        // 안전: 만약 아직 표시되지 않았다면 상태를 잠급니다
        this._gateOpenedInCycle = true;
      }
      log.debug('cycle gate locked after input_pet');
    }

    // 올바른 제품 감지 시 -> 그라인더 정방향 회전
    if (type === 'grinder_foword_detected') {
      log.info('✅ 올바른 제품 감지, 그라인더 정방향 회전 명령 전송');
      const command = {
        "motor_stop":0,
        "hopper_open":0,
        "status_ok":0,
        "status_error":0,
        "grinder_on":0,
        "grinder_off":0,
        "grinder_foword":1,
        "grinder_reverse":0,
        "grinder_stop":0
      };
      this.sendCommand('hw_detected:grinder_foword', command, 'grinder_foword');
    }
    
    // 분쇄 완료 시 -> 그라인더 정지
    if (type === 'grinder_end_detected') {
      log.info('✅ 분쇄 완료, 그라인더 정지 명령 전송');
      const command = {
        "motor_stop":0,
        "hopper_open":0,
        "status_ok":0,
        "status_error":0,
        "grinder_on":0,
        "grinder_off":0,
        "grinder_foword":0,
        "grinder_reverse":0,
        "grinder_stop":1
      };
      this.sendCommand('hw_detected:grinder_stop', command, 'grinder_stop');
    }

    // 불량 제품 감지 시 -> 비정상 반환
    if (type === 'err_pet_detected') {
      log.info('❌ 불량 제품 감지, 비정상 반환 명령 전송');
      const command = {
        "motor_stop":0,
        "hopper_open":0,
        "status_ok":0,
        "status_error":1,
        "grinder_on":0,
        "grinder_off":0,
        "grinder_foword":0,
        "grinder_reverse":0,
        "grinder_stop":0
      };
      this.sendCommand('hw_detected:status_error', command, 'status_error');
      // 프론트엔드에 에러 상태 전송
      this.broadcastToAll('hardware_status', { type: 'resource_error', data, timestamp: new Date().toISOString() });
    }
  }

  /**
   * 연결된 클라이언트 수 반환
   * @returns {number} 연결된 클라이언트 수
   */
  getConnectedClientsCount() {
    return this.connectedClients.size;
  }

  /**
   * 페이지별 클라이언트 수 반환
   * @returns {Object} 페이지별 클라이언트 수 정보
   */
  getPageRoomsInfo() {
    const roomsInfo = {};
    for (const [page, clients] of this.pageRooms.entries()) {
      roomsInfo[page] = clients.size;
    }
    return roomsInfo;
  }

  /**
   * PetBottle 테이블에 사용자 전화번호 저장
   * @param {Socket} socket - 클라이언트 소켓 객체
   */
  async savePetBottleRecord(socket) {
    try {
      // 클라이언트가 band-split 페이지에 있는지 확인
      const bandSplitClients = this.pageRooms.get('band-split');
      if (!bandSplitClients || !bandSplitClients.has(socket.id)) {
        log.debug('클라이언트가 band-split 페이지에 없어 PetBottle 기록을 저장하지 않습니다.');
        return;
      }

      // 사용자 전화번호를 가져오기 위해 프론트엔드에 요청
      socket.emit('request_phone_number');
      
      // 전화번호 응답을 받아서 PetBottle 테이블에 저장
      socket.once('phone_number_response', async (phoneNumber) => {
        if (phoneNumber) {
          try {
            await PetBottle.create({
              phone_number: phoneNumber,
              created_at: new Date(),
              updated_at: new Date()
            });
            log.info(`✅ PetBottle 테이블에 전화번호 ${phoneNumber} 저장 완료`);
          } catch (error) {
            log.error(`❌ PetBottle 테이블 저장 실패: ${error.message}`);
          }
        } else {
          log.warn('전화번호를 받지 못해 PetBottle 기록을 저장하지 않습니다.');
        }
      });

      // 5초 후 응답이 없으면 타임아웃 처리
      setTimeout(() => {
        log.warn('전화번호 응답 타임아웃으로 PetBottle 기록을 저장하지 않습니다.');
      }, 5000);

    } catch (error) {
      log.error(`❌ PetBottle 기록 저장 중 오류 발생: ${error.message}`);
    }
  }

  /**
   * 하드웨어 이벤트로 인한 PetBottle 테이블에 사용자 전화번호 저장
   * band-split 페이지에 있는 모든 클라이언트에게 전화번호 요청
   */
  async savePetBottleRecordForHardwareEvent() {
    try {
      const bandSplitClients = this.pageRooms.get('band-split');
      if (!bandSplitClients || bandSplitClients.size === 0) {
        log.debug('band-split 페이지에 클라이언트가 없어 PetBottle 기록을 저장하지 않습니다.');
        return;
      }

      // band-split 페이지의 모든 클라이언트에게 전화번호 요청
      for (const [clientId, client] of bandSplitClients.entries()) {
        const socket = this.io.sockets.sockets.get(clientId);
        if (socket) {
          socket.emit('request_phone_number');
          
          // 전화번호 응답을 받아서 PetBottle 테이블에 저장
          socket.once('phone_number_response', async (phoneNumber) => {
            if (phoneNumber) {
              try {
                await PetBottle.create({
                  phone_number: phoneNumber,
                  created_at: new Date(),
                  updated_at: new Date()
                });
                log.info(`✅ PetBottle 테이블에 전화번호 ${phoneNumber} 저장 완료 (하드웨어 이벤트)`);
                return; // 첫 번째 응답만 처리
              } catch (error) {
                log.error(`❌ PetBottle 테이블 저장 실패: ${error.message}`);
              }
            }
          });

          // 5초 후 응답이 없으면 다음 클라이언트로
          setTimeout(() => {
            log.debug('전화번호 응답 타임아웃, 다음 클라이언트로 진행');
          }, 5000);
        }
      }

    } catch (error) {
      log.error(`❌ 하드웨어 이벤트 PetBottle 기록 저장 중 오류 발생: ${error.message}`);
    }
  }
}

module.exports = SocketHandler;
