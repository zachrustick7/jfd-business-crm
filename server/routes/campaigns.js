const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all campaigns for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', type = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        c.id, c.name, c.template_id, c.type, c.status,
        c.total_recipients, c.sent_count, c.delivered_count, c.failed_count,
        c.scheduled_at, c.sent_at, c.created_at, c.updated_at,
        t.name as template_name
      FROM message_campaigns c
      LEFT JOIN message_templates t ON c.template_id = t.id
      WHERE c.user_id = $1
    `;
    const queryParams = [req.user.id];
    let paramCount = 1;

    // Add status filtering
    if (status) {
      paramCount++;
      query += ` AND c.status = $${paramCount}`;
      queryParams.push(status);
    }

    // Add type filtering
    if (type) {
      paramCount++;
      query += ` AND c.type = $${paramCount}`;
      queryParams.push(type);
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM message_campaigns WHERE user_id = $1';
    const countParams = [req.user.id];
    let countParamIndex = 1;

    if (status) {
      countParamIndex++;
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
    }

    if (type) {
      countParamIndex++;
      countQuery += ` AND type = $${countParamIndex}`;
      countParams.push(type);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCampaigns = parseInt(countResult.rows[0].count);

    // Convert snake_case to camelCase for frontend
    const campaigns = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      templateId: row.template_id,
      templateName: row.template_name,
      type: row.type,
      status: row.status,
      totalRecipients: row.total_recipients,
      sentCount: row.sent_count,
      deliveredCount: row.delivered_count,
      failedCount: row.failed_count,
      scheduledAt: row.scheduled_at,
      sentAt: row.sent_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      campaigns,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCampaigns / limit),
        totalCampaigns,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Get single campaign with message details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const campaignId = req.params.id;
    
    // Get campaign details
    const campaignResult = await pool.query(
      `SELECT 
        c.*, t.name as template_name, t.subject as template_subject, t.body as template_body
       FROM message_campaigns c
       LEFT JOIN message_templates t ON c.template_id = t.id
       WHERE c.id = $1 AND c.user_id = $2`,
      [campaignId, req.user.id]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get message history for this campaign
    const messagesResult = await pool.query(
      `SELECT 
        mh.*, 
        c.first_name, c.last_name, c.email, c.phone, c.company
       FROM message_history mh
       LEFT JOIN contacts c ON mh.contact_id = c.id
       WHERE mh.campaign_id = $1
       ORDER BY mh.created_at DESC`,
      [campaignId]
    );

    // Convert to camelCase
    const campaign = {
      id: campaignResult.rows[0].id,
      name: campaignResult.rows[0].name,
      templateId: campaignResult.rows[0].template_id,
      templateName: campaignResult.rows[0].template_name,
      templateSubject: campaignResult.rows[0].template_subject,
      templateBody: campaignResult.rows[0].template_body,
      type: campaignResult.rows[0].type,
      status: campaignResult.rows[0].status,
      totalRecipients: campaignResult.rows[0].total_recipients,
      sentCount: campaignResult.rows[0].sent_count,
      deliveredCount: campaignResult.rows[0].delivered_count,
      failedCount: campaignResult.rows[0].failed_count,
      scheduledAt: campaignResult.rows[0].scheduled_at,
      sentAt: campaignResult.rows[0].sent_at,
      createdAt: campaignResult.rows[0].created_at,
      updatedAt: campaignResult.rows[0].updated_at
    };

    const messages = messagesResult.rows.map(row => ({
      id: row.id,
      contactId: row.contact_id,
      contactName: `${row.first_name} ${row.last_name}`.trim(),
      contactEmail: row.email,
      contactPhone: row.phone,
      contactCompany: row.company,
      type: row.type,
      subject: row.subject,
      body: row.body,
      recipientEmail: row.recipient_email,
      recipientPhone: row.recipient_phone,
      status: row.status,
      providerMessageId: row.provider_message_id,
      errorMessage: row.error_message,
      sentAt: row.sent_at,
      deliveredAt: row.delivered_at,
      openedAt: row.opened_at,
      clickedAt: row.clicked_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({ campaign, messages });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// Create new campaign
router.post('/', [
  authenticateToken,
  body('name').trim().isLength({ min: 1 }).withMessage('Campaign name is required'),
  body('templateId').isInt().withMessage('Template ID is required'),
  body('contactIds').isArray({ min: 1 }).withMessage('At least one contact is required'),
  body('type').isIn(['email', 'sms']).withMessage('Type must be email or sms'),
  body('scheduledAt').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, templateId, contactIds, type, scheduledAt } = req.body;

    // Verify template exists and belongs to user
    const templateResult = await pool.query(
      'SELECT * FROM message_templates WHERE id = $1 AND user_id = $2',
      [templateId, req.user.id]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Verify contacts exist and belong to user
    const contactsResult = await pool.query(
      'SELECT * FROM contacts WHERE id = ANY($1) AND user_id = $2',
      [contactIds, req.user.id]
    );

    if (contactsResult.rows.length !== contactIds.length) {
      return res.status(400).json({ error: 'Some contacts not found or do not belong to user' });
    }

    // Create campaign
    const campaignResult = await pool.query(
      `INSERT INTO message_campaigns (user_id, name, template_id, type, total_recipients, scheduled_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, name, templateId, type, contactIds.length, scheduledAt || null]
    );

    const campaign = campaignResult.rows[0];

    // Create individual message records
    const template = templateResult.rows[0];
    const contacts = contactsResult.rows;

    for (const contact of contacts) {
      // Replace variables in template
      let subject = template.subject;
      let body = template.body;

      const variables = {
        firstName: contact.first_name,
        lastName: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        position: contact.position
      };

      // Replace variables in subject and body
      if (subject) {
        subject = replaceVariables(subject, variables);
      }
      body = replaceVariables(body, variables);

      await pool.query(
        `INSERT INTO message_history (
          campaign_id, user_id, contact_id, template_id, type, subject, body,
          recipient_email, recipient_phone, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          campaign.id,
          req.user.id,
          contact.id,
          templateId,
          type,
          subject,
          body,
          type === 'email' ? contact.email : null,
          type === 'sms' ? contact.phone : null,
          'draft'
        ]
      );
    }

    // Convert to camelCase for response
    const newCampaign = {
      id: campaign.id,
      name: campaign.name,
      templateId: campaign.template_id,
      type: campaign.type,
      status: campaign.status,
      totalRecipients: campaign.total_recipients,
      sentCount: campaign.sent_count,
      deliveredCount: campaign.delivered_count,
      failedCount: campaign.failed_count,
      scheduledAt: campaign.scheduled_at,
      sentAt: campaign.sent_at,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at
    };

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign: newCampaign
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Update campaign status (for sending, completing, etc.)
router.patch('/:id/status', [
  authenticateToken,
  body('status').isIn(['draft', 'sending', 'completed', 'failed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const campaignId = req.params.id;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE message_campaigns SET 
       status = $1,
       sent_at = CASE WHEN $1 = 'sending' THEN CURRENT_TIMESTAMP ELSE sent_at END,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [status, campaignId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = result.rows[0];
    res.json({
      message: 'Campaign status updated successfully',
      campaign: {
        id: campaign.id,
        status: campaign.status,
        sentAt: campaign.sent_at,
        updatedAt: campaign.updated_at
      }
    });
  } catch (error) {
    console.error('Update campaign status error:', error);
    res.status(500).json({ error: 'Failed to update campaign status' });
  }
});

// Delete campaign
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const result = await pool.query(
      'DELETE FROM message_campaigns WHERE id = $1 AND user_id = $2 RETURNING id',
      [campaignId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// POST /api/campaigns/:id/send - Send a campaign (mark as sending and update message statuses)
router.post('/:id/send', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const campaignId = req.params.id;
    const userId = req.user.id;

    // First, verify the campaign exists and belongs to the user
    const campaignResult = await client.query(
      'SELECT * FROM message_campaigns WHERE id = $1 AND user_id = $2',
      [campaignId, userId]
    );

    if (campaignResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = campaignResult.rows[0];

    // Check if campaign is in draft status
    if (campaign.status !== 'draft') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Campaign can only be sent from draft status',
        currentStatus: campaign.status 
      });
    }

    // Update campaign status to 'sending'
    await client.query(
      `UPDATE message_campaigns 
       SET status = 'sending', sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [campaignId]
    );

    // Update all pending messages for this campaign to 'pending' status (ready for background processing)
    // In a real implementation, this is where the background job would pick them up
    const messageUpdateResult = await client.query(
      `UPDATE message_history 
       SET status = 'pending', updated_at = CURRENT_TIMESTAMP 
       WHERE campaign_id = $1 AND status = 'draft'`,
      [campaignId]
    );

    // Get the count of messages that will be sent
    const messageCount = messageUpdateResult.rowCount;

    // Update campaign with message counts
    await client.query(
      `UPDATE message_campaigns 
       SET total_recipients = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [campaignId, messageCount]
    );

    await client.query('COMMIT');

    // Get updated campaign data
    const updatedCampaignResult = await client.query(
      `SELECT 
        c.id, c.name, c.template_id as "templateId", c.type, c.status,
        c.total_recipients as "totalRecipients", 
        c.sent_count as "sentCount", 
        c.delivered_count as "deliveredCount", 
        c.failed_count as "failedCount",
        c.scheduled_at as "scheduledAt", 
        c.sent_at as "sentAt", 
        c.created_at as "createdAt", 
        c.updated_at as "updatedAt",
        t.name as "templateName"
       FROM message_campaigns c
       LEFT JOIN message_templates t ON c.template_id = t.id
       WHERE c.id = $1`,
      [campaignId]
    );

    res.json({
      message: 'Campaign sent successfully',
      campaign: updatedCampaignResult.rows[0],
      messagesQueued: messageCount
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Send campaign error:', error);
    res.status(500).json({ 
      error: 'Failed to send campaign',
      details: error.message 
    });
  } finally {
    client.release();
  }
});

// Helper function to replace variables in text
function replaceVariables(text, variables) {
  if (!text) return text;
  
  return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return variables[variable] || match;
  });
}

module.exports = router; 