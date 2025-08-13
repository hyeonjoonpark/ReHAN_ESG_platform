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

    this.setupSocketEvents();
    console.log('🔌 Socket.IO 서버가 초기화되었습니다.');
  }

  /**
   * 시리얼 핸들러 설정
   * @param {SerialHandler} serialHandler - 시리얼 통신 핸들러 인스턴스
   */
  setSerialHandler(serialHandler) {
    this.serialHandler = serialHandler;

    this.serialHandler.on('hardware_event', ({ type, data }) => {
      this.notifyHardwareStatus(type, data);
    });

    console.log('🔗 시리얼 핸들러가 소켓 핸들러에 연결되었습니다.');
  }

  /**
   * Socket.IO 이벤트 설정
   */
  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log(`🔗 클라이언트 연결됨: ${socket.id}`);
      
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
        console.log(`📄 클라이언트 ${socket.id}가 ${page} 페이지에 참여`);
        
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
        console.log(`📄 클라이언트 ${socket.id}가 ${page} 페이지에서 나감`);
        
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
        console.log(`📡 클라이언트 ${socket.id}에서 시리얼 포트 열기 요청`);
        
        if (!this.serialHandler) {
          socket.emit('serial_port_error', {
            status: 'error',
            message: '시리얼 핸들러가 초기화되지 않았습니다.'
          });
          return;
        }

        try {
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
          console.error('❌ 시리얼 포트 열기 중 오류:', error.message);
          socket.emit('serial_port_error', {
            status: 'error',
            message: error.message
          });
        }
      });

      // 시리얼 포트 닫기 요청
      socket.on('serial_port_close', () => {
        console.log(`📡 클라이언트 ${socket.id}에서 시리얼 포트 닫기 요청`);
        
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
          console.error('❌ 시리얼 포트 닫기 중 오류:', error.message);
          socket.emit('serial_port_error', {
            status: 'error',
            message: error.message
          });
        }
      });

      // 현재 하드웨어 상태 요청
      socket.on('request_hardware_status', () => {
        console.log(`📊 클라이언트 ${socket.id}에서 하드웨어 상태 요청`);
        
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
          console.error('❌ 하드웨어 상태 요청 중 오류:', error.message);
          socket.emit('hardware_status_error', {
            message: error.message
          });
        }
      });
      
      // 투입구 열기 요청
      socket.on('open_gate', () => {
        console.log(`🚪 클라이언트 ${socket.id}에서 투입구 열기 요청`);
        
        if (!this.serialHandler) {
          return socket.emit('serial_port_error', { message: '시리얼 핸들러가 초기화되지 않았습니다.' });
        }
        
        try {
          if (this.serialHandler.isConnected()) {
            const command = {"motor_stop":0,"hopper_open":1,"status_ok":0,"status_error":0,"grinder_on":0,"grinder_off":0,"grinder_foword":0,"grinder_reverse":0,"grinder_stop":0};
            this.serialHandler.send(JSON.stringify(command));
            console.log('✅ 투입구 열기 명령 즉시 전송 (이미 연결됨):', command);
            return;
          }
          // 이미 열기 진행 중이면 연결 완료까지 대기 후 전송
          if (this.serialOpening) {
            console.log('⏳ 시리얼 포트 열기 진행 중, 연결 완료 후 명령 전송 예정');
            this.serialHandler.once('connected', () => {
              const command = {"motor_stop":0,"hopper_open":1,"status_ok":0,"status_error":0,"grinder_on":0,"grinder_off":0,"grinder_foword":0,"grinder_reverse":0,"grinder_stop":0};
              this.serialHandler.send(JSON.stringify(command));
              console.log('✅ 투입구 열기 명령 전송 (연결 후):', command);
              socket.emit('serial_port_opened', { status: 'opened', message: '시리얼 포트가 성공적으로 열리고 명령이 전송되었습니다.' });
            });
            return;
          }

          this.serialOpening = true;
          this.serialHandler.connect();
          this.serialHandler.once('connected', () => {
            this.serialOpening = false;
            const command = {"motor_stop":0,"hopper_open":1,"status_ok":0,"status_error":0,"grinder_on":0,"grinder_off":0,"grinder_foword":0,"grinder_reverse":0,"grinder_stop":0};
            this.serialHandler.send(JSON.stringify(command));
            console.log('✅ 투입구 열기 명령 전송 (연결 후):', command);
            socket.emit('serial_port_opened', { status: 'opened', message: '시리얼 포트가 성공적으로 열리고 명령이 전송되었습니다.' });
          });
          this.serialHandler.once('error', (err) => {
            this.serialOpening = false;
            socket.emit('serial_port_error', { status: 'error', message: `시리얼 포트 열기 실패: ${err.message}` });
          });
          
        } catch (error) {
          console.error('❌ 투입구 열기 요청 중 오류:', error.message);
          socket.emit('serial_port_error', { message: error.message });
        }
      });

      // 시리얼 데이터 수신 (프론트엔드로부터)
      socket.on('serial_data', (data) => {
        console.log(`💻 클라이언트 ${socket.id}로부터 시리얼 데이터 수신:`, data);

        // 프론트엔드에서 투입 완료 버튼을 눌렀을 때
        if (data && data.input_pet === 1) {
          if (this.serialHandler && this.serialHandler.isConnected()) {
            const command = {"motor_stop":0,"hopper_open":0,"status_ok":1,"status_error":0,"grinder_on":0,"grinder_off":0,"grinder_foword":0,"grinder_reverse":0,"grinder_stop":0};
            this.serialHandler.send(JSON.stringify(command));
            console.log('✅ 정상 배출 명령 전송 (프론트엔드 요청):', command);
            
            // 프론트엔드에 정상 종료 알림
            this.broadcastToAll('hardware_status', { 
              type: 'normally_end', 
              data: { source: 'frontend', command }, 
              timestamp: new Date().toISOString() 
            });
          } else {
            console.error('❌ 시리얼 핸들러가 연결되지 않아 정상 배출 명령을 보낼 수 없습니다.');
            socket.emit('hardware_status_error', {
              message: '시리얼 핸들러가 연결되지 않았습니다.'
            });
          }
        }
      });

      // 연결 해제 처리
      socket.on('disconnect', (reason) => {
        console.log(`🔗 클라이언트 연결 해제: ${socket.id}, 이유: ${reason}`);
        
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
        console.error(`❌ 소켓 오류 (${socket.id}):`, error);
      });
    });
  }

  /**
   * 모든 연결된 클라이언트에게 메시지 브로드캐스트
   * @param {string} event - 이벤트 이름
   * @param {Object} data - 전송할 데이터
   */
  broadcastToAll(event, data) {
    console.log(`📢 모든 클라이언트에게 브로드캐스트: ${event}`, data);
    this.io.emit(event, data);
  }

  /**
   * 특정 페이지의 클라이언트들에게만 메시지 전송
   * @param {string} page - 페이지 이름
   * @param {string} event - 이벤트 이름
   * @param {Object} data - 전송할 데이터
   */
  broadcastToPage(page, event, data) {
    console.log(`📢 ${page} 페이지 클라이언트들에게 브로드캐스트: ${event}`, data);
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
    
    console.log(`🔧 하드웨어 상태 알림:`, statusData);
    this.broadcastToAll('hardware_status', statusData);

    // 투입구가 열렸다는 신호를 받으면, 프론트엔드에 투입구 열 준비 완료를 알림
    if (type === 'belt_separator_complete') {
      this.broadcastToPage('band-split', 'hopper_ready', {
        message: 'Hopper is ready to be opened.'
      });
      console.log('✅ 띠 분리 완료, 프론트엔드에 투입구 열기 준비 알림');
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
      if (this.serialHandler && this.serialHandler.isConnected()) {
        this.serialHandler.send(JSON.stringify(command));
        console.log('✅ 정상 배출 명령 전송 (하드웨어 감지):', command);
      } else {
        console.error('❌ 시리얼 핸들러가 연결되지 않아 정상 배출 명령을 보낼 수 없습니다.');
      }

      // 프론트엔드에 투입 알림 브로드캐스트
      this.broadcastToAll('hardware_status', { type: 'pet_inserted', data, timestamp: new Date().toISOString() });
      console.log('🐾 페트병 투입 감지, 프론트엔드에 알림.');
    }

    // 올바른 제품 감지 시 -> 그라인더 정방향 회전
    if (type === 'grinder_foword_detected') {
      console.log('✅ 올바른 제품 감지, 그라인더 정방향 회전 명령 전송');
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
      if (this.serialHandler) {
        this.serialHandler.send(JSON.stringify(command));
        console.log('✅ 그라인더 정방향 회전 명령 전송:', command);
      } else {
        console.error('❌ 시리얼 핸들러가 연결되지 않아 그라인더 정방향 회전 명령을 보낼 수 없습니다.');
      }
    }
    
    // 분쇄 완료 시 -> 그라인더 정지
    if (type === 'grinder_end_detected') {
      console.log('✅ 분쇄 완료, 그라인더 정지 명령 전송');
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
      if (this.serialHandler) {
        this.serialHandler.send(JSON.stringify(command));
        console.log('✅ 분쇄 완료, 그라인더 정지 명령 전송:', command);
      } else {
        console.error('❌ 시리얼 핸들러가 연결되지 않아 그라인더 정지 명령을 보낼 수 없습니다.');
      }
    }

    // 불량 제품 감지 시 -> 비정상 반환
    if (type === 'err_pet_detected') {
      console.log('❌ 불량 제품 감지, 비정상 반환 명령 전송');
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
      if (this.serialHandler) {
        this.serialHandler.send(JSON.stringify(command));
        console.log('❌ 불량 제품 감지, 비정상 반환 명령 전송:', command);
      } else {
        console.error('❌ 시리얼 핸들러가 연결되지 않아 비정상 반환 명령을 보낼 수 없습니다.');
      }
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
}

module.exports = SocketHandler;
