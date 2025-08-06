const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user/User');
const router = express.Router();

// 회원가입 API
router.post('/signup', async (req, res) => {
  console.log('=== 회원가입 API 요청 받음 ===');
  console.log('Request body:', req.body);
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      console.log('전화번호 없음 - 400 에러');
      return res.status(400).json({
        success: false,
        error: '전화번호를 입력해주세요.'
      });
    }

    // 전화번호에서 하이픈 제거
    const cleanPhoneNumber = phone_number.replace(/[^0-9]/g, '');

    // 10~11자리 숫자인지 확인
    if (!/^[0-9]{10,11}$/.test(cleanPhoneNumber)) {
      console.log('전화번호 형식 오류 - 400 에러');
      return res.status(400).json({
        success: false,
        error: '유효한 전화번호 형식이 아닙니다.'
      });
    }

    // 중복 사용자 확인
    console.log('중복 사용자 확인 중...');
    const existingUser = await User.findOne({ 
      where: { phone_number: cleanPhoneNumber } 
    });

    if (existingUser) {
      console.log('이미 등록된 사용자 - 409 에러');
      return res.status(409).json({
        success: false,
        error: '이미 가입된 사용자입니다.'
      });
    }

    // 새 사용자 생성
    console.log('새 사용자 생성 중...');
    await User.create({
      phone_number: cleanPhoneNumber,
      user_name: ""
    });

    const responseData = {
      success: true,
      message: '회원가입 성공'
    };

    console.log('응답 데이터:', responseData);
    res.status(201).json(responseData);
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    });
  }
});

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
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 쿠키 설정
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24시간
    });
    
    const responseData = {
      success: true,
      token: token, // 토큰을 응답 본문에 추가
      user: {
        phone_number: user.phone_number,
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