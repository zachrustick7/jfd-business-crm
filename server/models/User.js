const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Handles all user-related database operations
 */
class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.first_name || data.firstName;
    this.lastName = data.last_name || data.lastName;
    this.companyName = data.company_name || data.companyName;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  // Convert to database format (snake_case)
  toDatabase() {
    return {
      email: this.email,
      first_name: this.firstName,
      last_name: this.lastName,
      company_name: this.companyName
    };
  }

  // Convert to API format (camelCase) - excludes sensitive data
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      companyName: this.companyName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Static methods for database operations
  static async create(userData) {
    const { email, password, firstName, lastName, companyName } = userData;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, company_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, company_name, created_at, updated_at
    `;
    
    const result = await pool.query(query, [email, passwordHash, firstName, lastName, companyName]);
    return new User(result.rows[0]);
  }

  static async findById(id) {
    const query = `
      SELECT id, email, first_name, last_name, company_name, created_at, updated_at
      FROM users WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  static async findByEmail(email) {
    const query = `
      SELECT id, email, password_hash, first_name, last_name, company_name, created_at, updated_at
      FROM users WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] ? { ...result.rows[0], passwordHash: result.rows[0].password_hash } : null;
  }

  static async update(id, userData) {
    const { firstName, lastName, companyName } = userData;
    
    const query = `
      UPDATE users 
      SET first_name = $1, last_name = $2, company_name = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, email, first_name, last_name, company_name, created_at, updated_at
    `;
    
    const result = await pool.query(query, [firstName, lastName, companyName, id]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  static async delete(id) {
    const query = `DELETE FROM users WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }

  // Validation methods
  static validate(userData) {
    const errors = [];
    
    if (!userData.email || !userData.email.includes('@')) {
      errors.push('Valid email is required');
    }
    
    if (!userData.password || userData.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (!userData.firstName || userData.firstName.trim().length < 1) {
      errors.push('First name is required');
    }
    
    if (!userData.lastName || userData.lastName.trim().length < 1) {
      errors.push('Last name is required');
    }
    
    return errors;
  }
}

module.exports = User; 