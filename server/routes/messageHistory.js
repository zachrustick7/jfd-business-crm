const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/message-history - Get all message history with filtering
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      type, 
      status, 
      search, 
      page = 1, 
      limit = 50,
      campaignId 
    } = req.query;

    // Build WHERE clause
    let whereConditions = ['mh.user_id = $1'];
    let queryParams = [userId];
    let paramIndex = 2;

    if (type && type !== 'all') {
      whereConditions.push(`mh.type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }

    if (status && status !== 'all') {
      whereConditions.push(`mh.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (campaignId) {
      whereConditions.push(`mh.campaign_id = $${paramIndex}`);
      queryParams.push(campaignId);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(
        mh.subject ILIKE $${paramIndex} OR 
        mh.body ILIKE $${paramIndex} OR 
        mh.recipient_email ILIKE $${paramIndex} OR 
        mh.recipient_phone ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // Calculate offset for pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM message_history mh
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get messages with pagination
    const messagesQuery = `
      SELECT 
        mh.id,
        mh.campaign_id as "campaignId",
        mh.user_id as "userId",
        mh.contact_id as "contactId",
        mh.template_id as "templateId",
        mh.type,
        mh.subject,
        mh.body,
        mh.recipient_email as "recipientEmail",
        mh.recipient_phone as "recipientPhone",
        mh.status,
        mh.provider_message_id as "providerMessageId",
        mh.error_message as "errorMessage",
        mh.sent_at as "sentAt",
        mh.delivered_at as "deliveredAt",
        mh.opened_at as "openedAt",
        mh.clicked_at as "clickedAt",
        mh.created_at as "createdAt",
        mh.updated_at as "updatedAt",
        mc.name as "campaignName",
        mt.name as "templateName",
        c.first_name as "contactFirstName",
        c.last_name as "contactLastName"
      FROM message_history mh
      LEFT JOIN message_campaigns mc ON mh.campaign_id = mc.id
      LEFT JOIN message_templates mt ON mh.template_id = mt.id
      LEFT JOIN contacts c ON mh.contact_id = c.id
      ${whereClause}
      ORDER BY mh.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(messagesQuery, queryParams);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      messages: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching message history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch message history',
      details: error.message 
    });
  }
});

// GET /api/message-history/:id - Get single message details
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.id;

    const query = `
      SELECT 
        mh.id,
        mh.campaign_id as "campaignId",
        mh.user_id as "userId",
        mh.contact_id as "contactId",
        mh.template_id as "templateId",
        mh.type,
        mh.subject,
        mh.body,
        mh.recipient_email as "recipientEmail",
        mh.recipient_phone as "recipientPhone",
        mh.status,
        mh.provider_message_id as "providerMessageId",
        mh.error_message as "errorMessage",
        mh.sent_at as "sentAt",
        mh.delivered_at as "deliveredAt",
        mh.opened_at as "openedAt",
        mh.clicked_at as "clickedAt",
        mh.created_at as "createdAt",
        mh.updated_at as "updatedAt",
        mc.name as "campaignName",
        mt.name as "templateName",
        c.first_name as "contactFirstName",
        c.last_name as "contactLastName",
        c.email as "contactEmail",
        c.phone as "contactPhone",
        c.company as "contactCompany"
      FROM message_history mh
      LEFT JOIN message_campaigns mc ON mh.campaign_id = mc.id
      LEFT JOIN message_templates mt ON mh.template_id = mt.id
      LEFT JOIN contacts c ON mh.contact_id = c.id
      WHERE mh.id = $1 AND mh.user_id = $2
    `;

    const result = await pool.query(query, [messageId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: result.rows[0] });

  } catch (error) {
    console.error('Error fetching message details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch message details',
      details: error.message 
    });
  }
});

// GET /api/message-history/stats - Get message statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = '30d' } = req.query;

    // Calculate date range
    let dateFilter = '';
    if (timeRange !== 'all') {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      dateFilter = `AND mh.created_at >= NOW() - INTERVAL '${days} days'`;
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN mh.status IN ('sent', 'delivered') THEN 1 END) as sent_messages,
        COUNT(CASE WHEN mh.status = 'pending' THEN 1 END) as pending_messages,
        COUNT(CASE WHEN mh.status IN ('failed', 'bounced') THEN 1 END) as failed_messages,
        COUNT(CASE WHEN mh.type = 'email' THEN 1 END) as email_messages,
        COUNT(CASE WHEN mh.type = 'sms' THEN 1 END) as sms_messages,
        COUNT(CASE WHEN mh.opened_at IS NOT NULL THEN 1 END) as opened_messages,
        COUNT(CASE WHEN mh.clicked_at IS NOT NULL THEN 1 END) as clicked_messages
      FROM message_history mh
      WHERE mh.user_id = $1 ${dateFilter}
    `;

    const result = await pool.query(statsQuery, [userId]);
    const stats = result.rows[0];

    // Calculate rates
    const totalSent = parseInt(stats.sent_messages);
    const openRate = totalSent > 0 ? (parseInt(stats.opened_messages) / totalSent * 100).toFixed(2) : 0;
    const clickRate = totalSent > 0 ? (parseInt(stats.clicked_messages) / totalSent * 100).toFixed(2) : 0;
    const deliveryRate = parseInt(stats.total_messages) > 0 ? (totalSent / parseInt(stats.total_messages) * 100).toFixed(2) : 0;

    res.json({
      stats: {
        totalMessages: parseInt(stats.total_messages),
        sentMessages: parseInt(stats.sent_messages),
        pendingMessages: parseInt(stats.pending_messages),
        failedMessages: parseInt(stats.failed_messages),
        emailMessages: parseInt(stats.email_messages),
        smsMessages: parseInt(stats.sms_messages),
        openedMessages: parseInt(stats.opened_messages),
        clickedMessages: parseInt(stats.clicked_messages),
        openRate: parseFloat(openRate),
        clickRate: parseFloat(clickRate),
        deliveryRate: parseFloat(deliveryRate)
      },
      timeRange
    });

  } catch (error) {
    console.error('Error fetching message statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch message statistics',
      details: error.message 
    });
  }
});

module.exports = router; 