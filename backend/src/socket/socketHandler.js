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

    this.setupSocketEvents();
    console.log('🔌 Socket.IO 서버가 초기화되었습니다.');
  }

  /**
   * 시리얼 핸들러 설정
   * @param {SerialHandler} serialHandler - 시리얼 통신 핸들러 인스턴스
   */
  setSerialHandler(serialHandler) {
    this.serialHandler = serialHandler;

    // SerialHandler에서 발생하는 하드웨어 이벤트를 수신하여 클라이언트에 전파
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
      
      // 투입구 열기 요청 (serial_port_open 과 동일한 역할)
      socket.on('open_gate', () => {
        console.log(`🚪 클라이언트 ${socket.id}에서 투입구 열기 요청`);
        
        if (!this.serialHandler) {
          return socket.emit('serial_port_error', { message: '시리얼 핸들러가 초기화되지 않았습니다.' });
        }
        
        try {
          if (this.serialHandler.isConnected()) {
            return socket.emit('serial_port_opened', { status: 'already_open', message: '시리얼 포트가 이미 열려있습니다.' });
          }
          
          this.serialHandler.connect();
          setTimeout(() => {
            if (this.serialHandler.isConnected()) {
              socket.emit('serial_port_opened', { status: 'opened', message: '시리얼 포트가 성공적으로 열렸습니다.' });
            } else {
              socket.emit('serial_port_error', { status: 'error', message: '시리얼 포트 열기에 실패했습니다.' });
            }
          }, 1000);
          
        } catch (error) {
          console.error('❌ 투입구 열기 요청 중 오류:', error.message);
          socket.emit('serial_port_error', { message: error.message });
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
