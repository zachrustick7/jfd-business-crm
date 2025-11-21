const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const messagingService = require('../services/messaging');

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

// POST /api/messages/send-bulk - Send messages directly without campaign
router.post('/send-bulk', [
  body('templateId').isInt().withMessage('Template ID is required'),
  body('contactIds').isArray({ min: 1 }).withMessage('At least one contact is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { templateId, contactIds } = req.body;
    const userId = req.user.id;

    // Get template
    const templateResult = await pool.query(
      'SELECT * FROM message_templates WHERE id = $1 AND user_id = $2',
      [templateId, userId]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    const template = templateResult.rows[0];

    // Get contacts
    const contactsResult = await pool.query(
      'SELECT * FROM contacts WHERE id = ANY($1) AND user_id = $2',
      [contactIds, userId]
    );

    if (contactsResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No valid contacts found' });
    }

    // Create messages directly without campaign
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const messageIds = [];

      for (const contact of contactsResult.rows) {
        if (!contact.email) {
          continue; // Skip contacts without email
        }

        // Replace template variables
        let subject = template.subject || '';
        let body = template.body || '';

        subject = subject
          .replace(/\{\{firstName\}\}/g, contact.first_name || '')
          .replace(/\{\{lastName\}\}/g, contact.last_name || '')
          .replace(/\{\{email\}\}/g, contact.email || '')
          .replace(/\{\{company\}\}/g, contact.company || '');

        body = body
          .replace(/\{\{firstName\}\}/g, contact.first_name || '')
          .replace(/\{\{lastName\}\}/g, contact.last_name || '')
          .replace(/\{\{email\}\}/g, contact.email || '')
          .replace(/\{\{company\}\}/g, contact.company || '');

        // Insert message
        const messageResult = await client.query(`
          INSERT INTO message_history (
            user_id,
            contact_id,
            template_id,
            type,
            subject,
            body,
            recipient_email,
            status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
        `, [
          userId,
          contact.id,
          templateId,
          'email',
          subject,
          body,
          contact.email,
          'pending'
        ]);

        messageIds.push(messageResult.rows[0].id);
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Messages queued for sending',
        count: messageIds.length
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error sending bulk messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send messages',
      message: error.message
    });
  }
});

module.exports = router; 