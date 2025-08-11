const express = require('express');
const UsageUser = require('../models/usage_user/UsageUser');
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

    // 사용 이력 생성
    await UsageUser.create({ phone_number: cleanPhoneNumber });
    await User.update({ user_point: user_point }, { where: { phone_number: cleanPhoneNumber } });

    const responseData = { success: true, message: '사용 이력이 저장되었습니다.' };
    console.log('응답 데이터:', responseData);
    return res.status(201).json(responseData);
  } catch (error) {
    console.error('사용 이력 저장 오류:', error);
    return res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;


