const express = require('express');
const UsageUser = require('../models/usage_user/UsageUser');
const User = require('../models/user/User');
const { Op } = require('sequelize');
const router = express.Router();

// 사용 이력 저장 API
router.post('/usage', async (req, res) => {
  console.log('=== 사용 이력 저장 API 요청 받음 ===');
  console.log('Request body:', req.body);

  try {
    const { phone_number, user_point } = req.body;

    if (!phone_number) {
      console.log('전화번호 없음 - 400 에러');
      return res.status(400).json({ success: false, error: '전화번호를 입력해주세요.' });
    }

    const cleanPhoneNumber = String(phone_number).replace(/[^0-9]/g, '');
    if (!/^[0-9]{10,11}$/.test(cleanPhoneNumber)) {
      console.log('전화번호 형식 오류 - 400 에러');
      return res.status(400).json({ success: false, error: '유효한 전화번호 형식이 아닙니다.' });
    }
    // 포인트 유효성 검사
    const nextPoints = Number(user_point);
    if (!Number.isFinite(nextPoints) || nextPoints < 0) {
      console.log('포인트 값 오류 - 400 에러');
      return res.status(400).json({ success: false, error: '유효한 포인트 값을 입력해주세요.' });
    }

    // 사용자 존재 확인 후 업데이트
    const user = await User.findByPk(cleanPhoneNumber);
    if (!user) {
      console.log('사용자 미존재 - 404 에러');
      return res.status(404).json({ success: false, error: '등록되지 않은 사용자입니다.' });
    }

    await user.update({ user_point: nextPoints }, { where: { phone_number: cleanPhoneNumber } });

    // 사용 이력 생성
    await UsageUser.create({ phone_number: cleanPhoneNumber });

    const responseData = { success: true, message: '사용 이력이 저장되었습니다.' };
    console.log('응답 데이터:', responseData);
    return res.status(201).json(responseData);
  } catch (error) {
    console.error('사용 이력 저장 오류:', error);
    return res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 오늘 사용 이력 개수 조회 API
router.get('/usage/today-count', async (req, res) => {
  try {
    const phone = String(req.query.phone_number || '').replace(/[^0-9]/g, '');
    if (!/^[0-9]{10,11}$/.test(phone)) {
      return res.status(400).json({ success: false, error: '유효한 전화번호 형식이 아닙니다.' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const count = await UsageUser.count({
      where: {
        phone_number: phone,
        created_at: { [Op.between]: [startOfDay, endOfDay] }
      }
    });

    return res.json({ success: true, count });
  } catch (error) {
    console.error('오늘 사용 이력 개수 조회 오류:', error);
    return res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;


