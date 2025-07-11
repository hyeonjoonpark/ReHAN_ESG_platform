const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user/User');
const router = express.Router();

// 로그인 API
router.post('/login', async (req, res) => {
  console.log('=== 로그인 API 요청 받음 ===');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  try {
    const { phone_number } = req.body;
    
    console.log('받은 전화번호:', phone_number);
    
    if (!phone_number) {
      console.log('전화번호 없음 - 400 에러');
      return res.status(400).json({ 
        success: false, 
        error: '전화번호를 입력해주세요.' 
      });
    }

    // 전화번호에서 하이픈 제거
    const cleanPhoneNumber = phone_number.replace(/[^0-9]/g, '');
    console.log('정제된 전화번호:', cleanPhoneNumber);
    
    // 사용자 조회
    console.log('데이터베이스에서 사용자 조회 중...');
    const user = await User.findOne({ 
      where: { phone_number: cleanPhoneNumber } 
    });
    
    console.log('조회된 사용자:', user ? user.toJSON() : 'null');
    
    if (!user) {
      console.log('사용자 없음 - 404 에러');
      return res.status(404).json({ 
        success: false, 
        error: '등록되지 않은 사용자입니다.' 
      });
    }
    
    // JWT 토큰 생성
    console.log('JWT 토큰 생성 중...');
    const token = jwt.sign(
      { 
        phone_number: user.phone_number, 
        user_name: user.user_name 
      },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '24h' }
    );
    
    // 쿠키 설정
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24시간
    });
    
    const responseData = {
      success: true,
      user: {
        phone_number: user.phone_number,
        user_name: user.user_name,
        user_point: user.user_point
      }
    };
    
    console.log('응답 데이터:', responseData);
    res.json(responseData);
    
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    });
  }
});

module.exports = router; 