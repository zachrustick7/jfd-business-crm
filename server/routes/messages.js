const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { sendEmail, sendSMS } = require('../services/messaging');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/messages/status - Get messaging service status
router.get('/status', async (req, res) => {
  try {
    const status = messagingService.getStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Error getting service status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get service status'
    });
  }
});

// POST /api/messages/process - Manually trigger message processing
router.post('/process', async (req, res) => {
  try {
    console.log(`🔄 Manual message processing triggered by user ${req.user.id}`);
    
    const result = await messagingService.processPendingMessages();
    
    res.json({
      success: true,
      message: 'Message processing completed',
      result
    });
  } catch (error) {
    console.error('Error processing messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process messages',
      message: error.message
    });
  }
});

// POST /api/messages/send-test - Send a test message (for development)
router.post('/send-test', async (req, res) => {
  try {
    const { type, to, subject, body } = req.body;
    
    if (!type || !to || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, to, body'
      });
    }

    let result;
    
    if (type === 'email') {
      if (!subject) {
        return res.status(400).json({
          success: false,
          error: 'Subject is required for email'
        });
      }
      
      result = await messagingService.sendEmail({
        to,
        subject,
        body,
        messageId: 'test-' + Date.now()
      });
    } else if (type === 'sms') {
      result = await messagingService.sendSMS({
        to,
        body,
        messageId: 'test-' + Date.now()
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid message type. Must be "email" or "sms"'
      });
    }

    res.json({
      success: true,
      message: 'Test message sent',
      result
    });
    
  } catch (error) {
    console.error('Error sending test message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test message',
      message: error.message
    });
  }
});

module.exports = router; 