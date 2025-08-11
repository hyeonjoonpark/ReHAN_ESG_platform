// 환경 변수 로드
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { testConnection } = require("./src/database/sequelize");
const authRoutes = require("./src/routes/auth");
const usageRoutes = require("./src/routes/usage");

// 시리얼 통신 및 소켓 핸들러 추가
const SerialHandler = require("./src/serial/serialHandler");
const SocketHandler = require("./src/socket/socketHandler");

const app = express();
const server = http.createServer(app);

// 시리얼 핸들러 및 소켓 핸들러 초기화
const serialHandler = new SerialHandler();
const socketHandler = new SocketHandler(server);

// 시리얼 핸들러와 소켓 핸들러 연결
socketHandler.setSerialHandler(serialHandler);

// 미들웨어 설정
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
// CORS 허용 오리진 (환경변수 CORS_ORIGINS로 덮어쓰기 가능, 콤마 구분)
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost',
  'http://127.0.0.1'
];
const allowedOrigins = (process.env.CORS_ORIGINS || defaultAllowedOrigins.join(',')).split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // 모바일 앱/서버 간 통신 등 Origin 없음 허용
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// 시리얼 포트 제어 API 라우트
app.post('/api/v1/serial/open', (req, res) => {
  try {
    console.log('📡 시리얼 포트 열기 요청 수신');
    
    if (serialHandler.isConnected()) {
      console.log('✅ 시리얼 포트가 이미 열려있음');
      socketHandler.broadcastToAll('serial_port_opened', { 
        status: 'already_open', 
        message: '시리얼 포트가 이미 열려있습니다.' 
      });
      return res.json({ success: true, message: '시리얼 포트가 이미 열려있습니다.' });
    }
    
    // 시리얼 포트 열기 시도
    serialHandler.connect();
    
    // 연결 성공 시 소켓으로 브로드캐스트
    setTimeout(() => {
      if (serialHandler.isConnected()) {
        console.log('✅ 시리얼 포트 열기 성공');
        socketHandler.broadcastToAll('serial_port_opened', { 
          status: 'opened', 
          message: '시리얼 포트가 성공적으로 열렸습니다.' 
        });
        res.json({ success: true, message: '시리얼 포트가 성공적으로 열렸습니다.' });
      } else {
        console.error('❌ 시리얼 포트 열기 실패');
        socketHandler.broadcastToAll('serial_port_error', { 
          status: 'error', 
          message: '시리얼 포트 열기에 실패했습니다.' 
        });
        res.status(500).json({ success: false, message: '시리얼 포트 열기에 실패했습니다.' });
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ 시리얼 포트 열기 중 오류:', error.message);
    socketHandler.broadcastToAll('serial_port_error', { 
      status: 'error', 
      message: error.message 
    });
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/v1/serial/close', (req, res) => {
  try {
    console.log('📡 시리얼 포트 닫기 요청 수신');
    
    if (!serialHandler.isConnected()) {
      console.log('ℹ️ 시리얼 포트가 이미 닫혀있음');
      return res.json({ success: true, message: '시리얼 포트가 이미 닫혀있습니다.' });
    }
    
    // 시리얼 포트 닫기
    serialHandler.disconnect();
    console.log('✅ 시리얼 포트 닫기 성공');
    
    // 소켓으로 브로드캐스트
    socketHandler.broadcastToAll('serial_port_closed', { 
      status: 'closed', 
      message: '시리얼 포트가 닫혔습니다.' 
    });
    
    res.json({ success: true, message: '시리얼 포트가 성공적으로 닫혔습니다.' });
    
  } catch (error) {
    console.error('❌ 시리얼 포트 닫기 중 오류:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/v1/serial/status', (req, res) => {
  try {
    const isConnected = serialHandler.isConnected();
    const status = serialHandler.getCurrentHardwareStatus ? serialHandler.getCurrentHardwareStatus() : {};
    
    res.json({
      success: true,
      isConnected,
      hardwareStatus: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 시리얼 상태 확인 중 오류:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 기존 테스트 API 유지
app.post('/api/v1/hardware/test', (req, res) => {
  const { command } = req.body;
  
  try {
    console.log('🧪 하드웨어 테스트 명령:', command);
    
    switch (command) {
      case 'belt_separator_complete':
        if (serialHandler.setTestState) {
          serialHandler.setTestState({ belt_separator_complete: true });
        }
        socketHandler.broadcastToAll('hardware_status', {
          type: 'belt_separator_complete',
          data: { belt_separator: 1 },
          timestamp: new Date().toISOString()
        });
        res.json({ success: true, message: '띠분리 완료 신호 전송됨' });
        break;
        
      case 'simulate_serial':
        const testData = req.body.data || '{"belt_separator":1}';
        if (serialHandler.handleSerialData) {
          serialHandler.handleSerialData(testData);
        }
        res.json({ success: true, message: '시리얼 데이터 시뮬레이션 완료', data: testData });
        break;
        
      case 'reset_state':
        if (serialHandler.resetHardwareState) {
          serialHandler.resetHardwareState();
        }
        socketHandler.broadcastToAll('hardware_status_reset', {
          type: 'reset',
          timestamp: new Date().toISOString()
        });
        res.json({ success: true, message: '하드웨어 상태 초기화됨' });
        break;
        
      default:
        res.status(400).json({ success: false, message: '알 수 없는 명령' });
    }
  } catch (error) {
    console.error('❌ 테스트 명령 실행 중 오류:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 라우터 설정
app.use('/api/v1', authRoutes);
app.use('/api/v1', usageRoutes);

// 기본 라우트
app.get("/", (req, res) => {
  res.json({ 
    message: "ReHAN ESG 플랫폼 서버가 정상적으로 실행중입니다.",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// 헬스체크 라우트 (Docker 헬스체크용)
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// 데이터베이스 연결 테스트 및 시드 데이터 생성
const initializeDatabase = async () => {
  await testConnection();
};

initializeDatabase();

// 서버 시작
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`ReHAN ESG 플랫폼의 서버가 ${PORT}번 포트에서 실행중입니다.`);
  console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`데이터베이스 호스트: ${process.env.DB_HOST || 'localhost'}`);
});