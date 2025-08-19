const express = require('express');
const router = express.Router();
const { ErrorReport } = require('../models');

router.post('/error-report', async (req, res) => {
  console.log("req.body", req.body);
  const { phone_number, error_content } = req.body;
  console.log("phone_number", phone_number);
  console.log("error_content", error_content);

  try {
    await ErrorReport.create({
      phone_number,
      error_content
    });
    console.log('Error report saved successfully');
    res.status(201).json({ message: 'Error report saved successfully' });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ message: 'Failed to save error report' });
  }
});

module.exports = router;