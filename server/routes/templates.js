const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all templates for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', type = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, subject, body, type, category, variables, created_at, updated_at
      FROM message_templates 
      WHERE user_id = $1
    `;
    const queryParams = [req.user.id];
    let paramCount = 1;

    // Add search functionality
    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(name) LIKE LOWER($${paramCount}) OR 
        LOWER(subject) LIKE LOWER($${paramCount}) OR 
        LOWER(body) LIKE LOWER($${paramCount}) OR
        LOWER(category) LIKE LOWER($${paramCount})
      )`;
      queryParams.push(`%${search}%`);
    }

    // Add type filtering
    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      queryParams.push(type);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM message_templates WHERE user_id = $1';
    const countParams = [req.user.id];
    let countParamIndex = 1;

    if (search) {
      countParamIndex++;
      countQuery += ` AND (
        LOWER(name) LIKE LOWER($${countParamIndex}) OR 
        LOWER(subject) LIKE LOWER($${countParamIndex}) OR 
        LOWER(body) LIKE LOWER($${countParamIndex}) OR
        LOWER(category) LIKE LOWER($${countParamIndex})
      )`;
      countParams.push(`%${search}%`);
    }

    if (type) {
      countParamIndex++;
      countQuery += ` AND type = $${countParamIndex}`;
      countParams.push(type);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalTemplates = parseInt(countResult.rows[0].count);

    // Convert snake_case to camelCase for frontend
    const templates = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      subject: row.subject,
      body: row.body,
      type: row.type,
      category: row.category,
      variables: row.variables || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      templates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTemplates / limit),
        totalTemplates,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get single template
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const templateId = req.params.id;
    const result = await pool.query(
      'SELECT * FROM message_templates WHERE id = $1 AND user_id = $2',
      [templateId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Convert snake_case to camelCase for frontend
    const template = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      subject: result.rows[0].subject,
      body: result.rows[0].body,
      type: result.rows[0].type,
      category: result.rows[0].category,
      variables: result.rows[0].variables || [],
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    res.json({ template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Create new template
router.post('/', [
  authenticateToken,
  body('name').trim().isLength({ min: 1 }).withMessage('Template name is required'),
  body('body').trim().isLength({ min: 1 }).withMessage('Template body is required'),
  body('type').isIn(['email', 'sms']).withMessage('Type must be email or sms'),
  body('subject').optional().trim(),
  body('category').optional().trim(),
  body('variables').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, subject, body, type, category, variables } = req.body;

    // Extract variables from template body
    const extractedVariables = extractVariablesFromBody(body);
    const finalVariables = variables || extractedVariables;

    const result = await pool.query(
      `INSERT INTO message_templates (user_id, name, subject, body, type, category, variables)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, name, subject || null, body, type, category || null, finalVariables]
    );

    // Convert snake_case to camelCase for frontend
    const newTemplate = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      subject: result.rows[0].subject,
      body: result.rows[0].body,
      type: result.rows[0].type,
      category: result.rows[0].category,
      variables: result.rows[0].variables || [],
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    res.status(201).json({
      message: 'Template created successfully',
      template: newTemplate
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template
router.put('/:id', [
  authenticateToken,
  body('name').optional().trim().isLength({ min: 1 }),
  body('body').optional().trim().isLength({ min: 1 }),
  body('type').optional().isIn(['email', 'sms']),
  body('subject').optional().trim(),
  body('category').optional().trim(),
  body('variables').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const templateId = req.params.id;
    const { name, subject, body, type, category, variables } = req.body;

    // Extract variables from body if body is being updated
    let finalVariables = variables;
    if (body && !variables) {
      finalVariables = extractVariablesFromBody(body);
    }

    const result = await pool.query(
      `UPDATE message_templates SET 
       name = COALESCE($1, name),
       subject = COALESCE($2, subject),
       body = COALESCE($3, body),
       type = COALESCE($4, type),
       category = COALESCE($5, category),
       variables = COALESCE($6, variables),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [name, subject, body, type, category, finalVariables, templateId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Convert snake_case to camelCase for frontend
    const updatedTemplate = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      subject: result.rows[0].subject,
      body: result.rows[0].body,
      type: result.rows[0].type,
      category: result.rows[0].category,
      variables: result.rows[0].variables || [],
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    res.json({
      message: 'Template updated successfully',
      template: updatedTemplate
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete template
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const templateId = req.params.id;
    const result = await pool.query(
      'DELETE FROM message_templates WHERE id = $1 AND user_id = $2 RETURNING id',
      [templateId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Preview template with sample data
router.post('/:id/preview', authenticateToken, async (req, res) => {
  try {
    const templateId = req.params.id;
    const { contactId } = req.body;

    // Get template
    const templateResult = await pool.query(
      'SELECT * FROM message_templates WHERE id = $1 AND user_id = $2',
      [templateId, req.user.id]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateResult.rows[0];
    let sampleData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-1234',
      company: 'Acme Corp',
      position: 'CEO'
    };

    // If contactId provided, use real contact data
    if (contactId) {
      const contactResult = await pool.query(
        'SELECT * FROM contacts WHERE id = $1 AND user_id = $2',
        [contactId, req.user.id]
      );

      if (contactResult.rows.length > 0) {
        const contact = contactResult.rows[0];
        sampleData = {
          firstName: contact.first_name,
          lastName: contact.last_name,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          position: contact.position
        };
      }
    }

    // Replace variables in template
    const previewSubject = replaceVariables(template.subject || '', sampleData);
    const previewBody = replaceVariables(template.body, sampleData);

    res.json({
      preview: {
        subject: previewSubject,
        body: previewBody,
        sampleData
      }
    });
  } catch (error) {
    console.error('Preview template error:', error);
    res.status(500).json({ error: 'Failed to preview template' });
  }
});

// Helper function to extract variables from template body
function extractVariablesFromBody(body) {
  const variableRegex = /\{\{(\w+)\}\}/g;
  const variables = [];
  let match;

  while ((match = variableRegex.exec(body)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

// Helper function to replace variables in text
function replaceVariables(text, data) {
  if (!text) return text;
  
  return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return data[variable] || match;
  });
}

module.exports = router; 