const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Get all contacts for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', tags = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, first_name, last_name, email, phone, company, position, notes, tags, created_at, updated_at
      FROM contacts 
      WHERE user_id = $1
    `;
    const queryParams = [req.user.id];
    let paramCount = 1;

    // Add search functionality
    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(first_name) LIKE LOWER($${paramCount}) OR 
        LOWER(last_name) LIKE LOWER($${paramCount}) OR 
        LOWER(email) LIKE LOWER($${paramCount}) OR 
        LOWER(company) LIKE LOWER($${paramCount})
      )`;
      queryParams.push(`%${search}%`);
    }

    // Add tag filtering
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      paramCount++;
      query += ` AND tags && $${paramCount}`;
      queryParams.push(tagArray);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM contacts WHERE user_id = $1';
    const countParams = [req.user.id];
    let countParamIndex = 1;

    if (search) {
      countParamIndex++;
      countQuery += ` AND (
        LOWER(first_name) LIKE LOWER($${countParamIndex}) OR 
        LOWER(last_name) LIKE LOWER($${countParamIndex}) OR 
        LOWER(email) LIKE LOWER($${countParamIndex}) OR 
        LOWER(company) LIKE LOWER($${countParamIndex})
      )`;
      countParams.push(`%${search}%`);
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      countParamIndex++;
      countQuery += ` AND tags && $${countParamIndex}`;
      countParams.push(tagArray);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalContacts = parseInt(countResult.rows[0].count);

    // Convert snake_case to camelCase for frontend
    const contacts = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      position: row.position,
      notes: row.notes,
      tags: row.tags || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalContacts / limit),
        totalContacts,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get single contact
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const contactId = req.params.id;
    const result = await pool.query(
      'SELECT * FROM contacts WHERE id = $1 AND user_id = $2',
      [contactId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ contact: result.rows[0] });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// Create new contact
router.post('/', [
  authenticateToken,
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('position').optional().trim(),
  body('notes').optional().trim(),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phone, company, position, notes, tags } = req.body;

    const result = await pool.query(
      `INSERT INTO contacts (user_id, first_name, last_name, email, phone, company, position, notes, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.id, firstName, lastName, email || null, phone || null, company || null, position || null, notes || null, tags || []]
    );

    // Convert snake_case to camelCase for frontend
    const newContact = {
      id: result.rows[0].id,
      userId: result.rows[0].user_id,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      company: result.rows[0].company,
      position: result.rows[0].position,
      notes: result.rows[0].notes,
      tags: result.rows[0].tags || [],
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    res.status(201).json({
      message: 'Contact created successfully',
      contact: newContact
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Update contact
router.put('/:id', [
  authenticateToken,
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('position').optional().trim(),
  body('notes').optional().trim(),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contactId = req.params.id;
    const { firstName, lastName, email, phone, company, position, notes, tags } = req.body;

    const result = await pool.query(
      `UPDATE contacts SET 
       first_name = COALESCE($1, first_name),
       last_name = COALESCE($2, last_name),
       email = COALESCE($3, email),
       phone = COALESCE($4, phone),
       company = COALESCE($5, company),
       position = COALESCE($6, position),
       notes = COALESCE($7, notes),
       tags = COALESCE($8, tags),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [firstName, lastName, email, phone, company, position, notes, tags, contactId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Convert snake_case to camelCase for frontend
    const updatedContact = {
      id: result.rows[0].id,
      userId: result.rows[0].user_id,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      company: result.rows[0].company,
      position: result.rows[0].position,
      notes: result.rows[0].notes,
      tags: result.rows[0].tags || [],
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    res.json({
      message: 'Contact updated successfully',
      contact: updatedContact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const contactId = req.params.id;
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING id',
      [contactId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Upload contacts from CSV
router.post('/upload-csv', authenticateToken, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file provided' });
    }

    const contacts = [];
    const errors = [];

    // Parse CSV from buffer
    const stream = Readable.from(req.file.buffer);
    
    stream
      .pipe(csv())
      .on('data', (data) => {
        // Validate required fields
        if (!data.firstName || !data.lastName) {
          errors.push(`Missing required fields for row: ${JSON.stringify(data)}`);
          return;
        }

        contacts.push({
          firstName: data.firstName?.trim(),
          lastName: data.lastName?.trim(),
          email: data.email?.trim() || null,
          phone: data.phone?.trim() || null,
          company: data.company?.trim() || null,
          notes: data.notes?.trim() || null,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
        });
      })
      .on('end', async () => {
        try {
          let successCount = 0;

          // Insert contacts in batches
          for (const contact of contacts) {
            try {
              await pool.query(
                `INSERT INTO contacts (user_id, first_name, last_name, email, phone, company, notes, tags)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [req.user.id, contact.firstName, contact.lastName, contact.email, 
                 contact.phone, contact.company, contact.notes, contact.tags]
              );
              successCount++;
            } catch (dbError) {
              errors.push(`Failed to insert contact ${contact.firstName} ${contact.lastName}: ${dbError.message}`);
            }
          }

          res.json({
            message: 'CSV upload completed',
            successCount,
            totalProcessed: contacts.length,
            errors: errors.length > 0 ? errors : undefined
          });
        } catch (error) {
          console.error('CSV processing error:', error);
          res.status(500).json({ error: 'Failed to process CSV data' });
        }
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
        res.status(400).json({ error: 'Invalid CSV format' });
      });

  } catch (error) {
    console.error('CSV upload error:', error);
    res.status(500).json({ error: 'Failed to upload CSV' });
  }
});

// Get contact statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const totalResult = await pool.query(
      'SELECT COUNT(*) as total FROM contacts WHERE user_id = $1',
      [req.user.id]
    );

    const emailResult = await pool.query(
      'SELECT COUNT(*) as with_email FROM contacts WHERE user_id = $1 AND email IS NOT NULL',
      [req.user.id]
    );

    const phoneResult = await pool.query(
      'SELECT COUNT(*) as with_phone FROM contacts WHERE user_id = $1 AND phone IS NOT NULL',
      [req.user.id]
    );

    res.json({
      totalContacts: parseInt(totalResult.rows[0].total),
      contactsWithEmail: parseInt(emailResult.rows[0].with_email),
      contactsWithPhone: parseInt(phoneResult.rows[0].with_phone)
    });
  } catch (error) {
    console.error('Contact stats error:', error);
    res.status(500).json({ error: 'Failed to fetch contact statistics' });
  }
});

module.exports = router; 