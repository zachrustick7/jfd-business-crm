const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'jfd_crm',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test the connection
pool.on('connect', () => {
  console.log('📊 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        company_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Contacts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        company VARCHAR(255),
        position VARCHAR(255),
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(2), -- Two-letter state code (e.g., VA, NM)
        zip_code VARCHAR(10),
        filing_status VARCHAR(50), -- Tax filing status
        status VARCHAR(50) DEFAULT 'active', -- Lead, Active, Inactive
        notes TEXT,
        tags TEXT[], -- Array of tags for categorization
        last_contact_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns if they don't exist (for existing databases)
    await pool.query(`
      ALTER TABLE contacts 
      ADD COLUMN IF NOT EXISTS position VARCHAR(255),
      ADD COLUMN IF NOT EXISTS address VARCHAR(255),
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS state VARCHAR(2),
      ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10),
      ADD COLUMN IF NOT EXISTS filing_status VARCHAR(50),
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP
    `);

    // Message templates table (email only)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS message_templates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        body TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'email', -- 'email' only (SMS removed)
        category VARCHAR(100), -- 'promotional', 'transactional', 'newsletter', etc.
        variables TEXT[], -- Dynamic variables like {first_name}, {company}
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Message campaigns table (email only)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS message_campaigns (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        template_id INTEGER REFERENCES message_templates(id) ON DELETE SET NULL,
        type VARCHAR(50) DEFAULT 'email', -- 'email' only (SMS removed)
        status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sending', 'completed', 'failed'
        total_recipients INTEGER DEFAULT 0,
        sent_count INTEGER DEFAULT 0,
        delivered_count INTEGER DEFAULT 0,
        failed_count INTEGER DEFAULT 0,
        scheduled_at TIMESTAMP,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Message history table (email messages only)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS message_history (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER REFERENCES message_campaigns(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
        template_id INTEGER REFERENCES message_templates(id) ON DELETE SET NULL,
        type VARCHAR(50) DEFAULT 'email', -- 'email' only (SMS removed)
        subject VARCHAR(500) NOT NULL,
        body TEXT NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
        provider_message_id VARCHAR(255), -- ID from SendGrid
        error_message TEXT,
        sent_at TIMESTAMP,
        delivered_at TIMESTAMP,
        opened_at TIMESTAMP, -- email opens
        clicked_at TIMESTAMP, -- email clicks
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
      CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
      CREATE INDEX IF NOT EXISTS idx_message_campaigns_user_id ON message_campaigns(user_id);
      CREATE INDEX IF NOT EXISTS idx_message_history_user_id ON message_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_message_history_campaign_id ON message_history(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_message_history_contact_id ON message_history(contact_id);
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};

module.exports = {
  pool,
  initializeDatabase
}; 