const express = require('express');
const router = express.Router();
const { ErrorReport } = require('../models');

router.post('/error-report', async (req, res) => {
  console.log("=== Error Report API 호출 ===");
  console.log("요청 URL:", req.url);
  console.log("요청 메서드:", req.method);
  console.log("req.body", req.body);
  console.log("req.headers", req.headers);
  console.log("Content-Type:", req.headers['content-type']);
  
  const { phone_number, error_content } = req.body;
  console.log("phone_number", phone_number);
  console.log("error_content", error_content);

  if (!phone_number || !error_content) {
    console.error('필수 필드 누락:', { phone_number, error_content });
    return res.status(400).json({ 
      message: 'Missing required fields',
      received: { phone_number, error_content }
    });
  }

  try {
    console.log('ErrorReport 모델 생성 시도...');
    const result = await ErrorReport.create({
      phone_number,
      error_content
    });
    console.log('Error report saved successfully:', result.toJSON());
    res.status(201).json({ 
      message: 'Error report saved successfully',
      id: result.id
    });
  } catch (error) {
    console.error('Error saving report:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Failed to save error report',
      error: error.message
    });
  }
});

module.exports = router;