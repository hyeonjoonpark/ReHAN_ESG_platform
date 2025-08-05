const { Server } = require('socket.io');

class SocketHandler {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.connectedClients = new Map();
    this.serialHandler = null; // SerialHandler 참조를 저장
    this.setupEventListeners();
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    this.io.on('connection', (socket) => {
      console.log('클라이언트 연결됨:', socket.id);
      
      // 클라이언트 정보 저장
      this.connectedClients.set(socket.id, {
        id: socket.id,
        connectedAt: new Date(),
        currentPage: null
      });

      // 클라이언트에서 현재 페이지 정보 수신
      socket.on('join_page', (pageInfo) => {
        console.log(`클라이언트 ${socket.id}가 ${pageInfo.page} 페이지에 접속`);
        
        const clientInfo = this.connectedClients.get(socket.id);
        if (clientInfo) {
          clientInfo.currentPage = pageInfo.page;
          clientInfo.pageData = pageInfo;
        }

        // 페이지별 룸에 참여
        socket.join(pageInfo.page);
        
        // 현재 하드웨어 상태 전송
        const currentStatus = this.serialHandler ? 
          this.serialHandler.getCurrentHardwareStatus() : 
          { belt_separator_complete: false, hopper_opened: false };
          
        console.log('📤 페이지 접속 시 현재 하드웨어 상태 전송:', currentStatus);
        socket.emit('current_hardware_status', {
          ...currentStatus,
          timestamp: new Date().toISOString()
        });
      });

      // 클라이언트에서 페이지 떠날 때
      socket.on('leave_page', (pageInfo) => {
        console.log(`클라이언트 ${socket.id}가 ${pageInfo.page} 페이지에서 나감`);
        socket.leave(pageInfo.page);
      });

      // 하드웨어 상태 요청
      socket.on('request_hardware_status', () => {
        console.log('📥 클라이언트에서 하드웨어 상태 요청:', socket.id);
        
        const currentStatus = this.serialHandler ? 
          this.serialHandler.getCurrentHardwareStatus() : 
          { belt_separator_complete: false, hopper_opened: false };
          
        console.log('📤 하드웨어 상태 응답 전송:', currentStatus);
        socket.emit('hardware_status_response', {
          ...currentStatus,
          timestamp: new Date().toISOString()
        });
      });

      // 연결 해제
      socket.on('disconnect', (reason) => {
        console.log('클라이언트 연결 해제됨:', socket.id, reason);
        this.connectedClients.delete(socket.id);
      });

      // 에러 처리
      socket.on('error', (error) => {
        console.error('소켓 에러:', socket.id, error);
      });
    });
  }

  // 특정 페이지의 클라이언트들에게 메시지 전송
  emitToPage(page, event, data) {
    this.io.to(page).emit(event, data);
    console.log(`${page} 페이지 클라이언트들에게 ${event} 이벤트 전송:`, data);
  }

  // 모든 클라이언트에게 메시지 전송
  emitToAll(event, data) {
    this.io.emit(event, data);
    console.log(`모든 클라이언트에게 ${event} 이벤트 전송:`, data);
  }

  // 연결된 클라이언트 수 반환
  getConnectedClientsCount() {
    return this.connectedClients.size;
  }

  // 연결된 클라이언트 목록 반환
  getConnectedClients() {
    return Array.from(this.connectedClients.values());
  }

  // Socket.IO 인스턴스 반환 (SerialHandler에서 사용)
  getIO() {
    return this.io;
  }

  // SerialHandler 참조 설정
  setSerialHandler(serialHandler) {
    this.serialHandler = serialHandler;
    console.log('✅ SocketHandler에 SerialHandler 참조 설정 완료');
  }
}

module.exports = SocketHandler;