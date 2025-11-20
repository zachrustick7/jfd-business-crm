const { pool } = require('../config/database');

/**
 * Contact Model
 * Handles all contact-related database operations
 */
class Contact {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id || data.userId;
    this.firstName = data.first_name || data.firstName;
    this.lastName = data.last_name || data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.company = data.company;
    this.position = data.position;
    this.address = data.address;
    this.city = data.city;
    this.state = data.state;
    this.zipCode = data.zip_code || data.zipCode;
    this.filingStatus = data.filing_status || data.filingStatus;
    this.status = data.status || 'active';
    this.notes = data.notes;
    this.tags = data.tags || [];
    this.lastContactDate = data.last_contact_date || data.lastContactDate;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  // Convert to database format (snake_case)
  toDatabase() {
    return {
      user_id: this.userId,
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      phone: this.phone,
      company: this.company,
      position: this.position,
      address: this.address,
      city: this.city,
      state: this.state,
      zip_code: this.zipCode,
      filing_status: this.filingStatus,
      status: this.status,
      notes: this.notes,
      tags: this.tags,
      last_contact_date: this.lastContactDate
    };
  }

  // Convert to API format (camelCase)
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      company: this.company,
      position: this.position,
      address: this.address,
      city: this.city,
      state: this.state,
      zipCode: this.zipCode,
      filingStatus: this.filingStatus,
      status: this.status,
      notes: this.notes,
      tags: this.tags,
      lastContactDate: this.lastContactDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Get full name
  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  // Static methods for database operations
  static async create(contactData) {
    const { 
      userId, firstName, lastName, email, phone, company, position, 
      address, city, state, zipCode, filingStatus, status = 'active', 
      notes, tags = [], lastContactDate 
    } = contactData;
    
    const query = `
      INSERT INTO contacts (
        user_id, first_name, last_name, email, phone, company, position,
        address, city, state, zip_code, filing_status, status, notes, tags, last_contact_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      userId, firstName, lastName, email, phone, company, position,
      address, city, state, zipCode, filingStatus, status, notes, tags, lastContactDate
    ]);
    return new Contact(result.rows[0]);
  }

  static async findById(id, userId) {
    const query = `
      SELECT *
      FROM contacts WHERE id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [id, userId]);
    return result.rows[0] ? new Contact(result.rows[0]) : null;
  }

  static async findByUserId(userId, options = {}) {
    const { search, limit = 100, offset = 0, orderBy = 'created_at', orderDirection = 'DESC' } = options;
    
    let query = `
      SELECT *
      FROM contacts WHERE user_id = $1
    `;
    
    const params = [userId];
    
    // Add search functionality
    if (search) {
      query += ` AND (
        first_name ILIKE $${params.length + 1} OR 
        last_name ILIKE $${params.length + 1} OR 
        email ILIKE $${params.length + 1} OR 
        company ILIKE $${params.length + 1} OR
        city ILIKE $${params.length + 1} OR
        state ILIKE $${params.length + 1}
      )`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY ${orderBy} ${orderDirection} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    return result.rows.map(row => new Contact(row));
  }

  static async update(id, userId, contactData) {
    const { 
      firstName, lastName, email, phone, company, position,
      address, city, state, zipCode, filingStatus, status,
      notes, tags, lastContactDate
    } = contactData;
    
    const query = `
      UPDATE contacts 
      SET first_name = $1, last_name = $2, email = $3, phone = $4, company = $5, 
          position = $6, address = $7, city = $8, state = $9, zip_code = $10,
          filing_status = $11, status = $12, notes = $13, tags = $14, 
          last_contact_date = $15, updated_at = CURRENT_TIMESTAMP
      WHERE id = $16 AND user_id = $17
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      firstName, lastName, email, phone, company, position,
      address, city, state, zipCode, filingStatus, status,
      notes, tags, lastContactDate, id, userId
    ]);
    return result.rows[0] ? new Contact(result.rows[0]) : null;
  }

  static async delete(id, userId) {
    const query = `DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING id`;
    const result = await pool.query(query, [id, userId]);
    return result.rows.length > 0;
  }

  static async getStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_contacts,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as contacts_with_email,
        COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END) as contacts_with_phone,
        COUNT(CASE WHEN company IS NOT NULL AND company != '' THEN 1 END) as contacts_with_company
      FROM contacts WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Bulk operations
  static async createMany(contactsData, userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const createdContacts = [];
      
      for (const contactData of contactsData) {
        const query = `
          INSERT INTO contacts (
            user_id, first_name, last_name, email, phone, company, position,
            address, city, state, zip_code, filing_status, status, notes, tags, last_contact_date
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING *
        `;
        
        const { 
          firstName, lastName, email, phone, company, position,
          address, city, state, zipCode, filingStatus, status = 'active',
          notes, tags = [], lastContactDate
        } = contactData;
        
        const result = await client.query(query, [
          userId, firstName, lastName, email, phone, company, position,
          address, city, state, zipCode, filingStatus, status, notes, tags, lastContactDate
        ]);
        createdContacts.push(new Contact(result.rows[0]));
      }
      
      await client.query('COMMIT');
      return createdContacts;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Validation methods
  static validate(contactData) {
    const errors = [];
    
    if (!contactData.firstName || contactData.firstName.trim().length < 1) {
      errors.push('First name is required');
    }
    
    if (!contactData.lastName || contactData.lastName.trim().length < 1) {
      errors.push('Last name is required');
    }
    
    if (contactData.email && !contactData.email.includes('@')) {
      errors.push('Valid email format required');
    }
    
    if (contactData.firstName && contactData.firstName.length > 100) {
      errors.push('First name must be less than 100 characters');
    }
    
    if (contactData.lastName && contactData.lastName.length > 100) {
      errors.push('Last name must be less than 100 characters');
    }
    
    return errors;
  }
}

module.exports = Contact; 