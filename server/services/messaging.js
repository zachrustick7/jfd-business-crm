const sgMail = require('@sendgrid/mail');
const { pool } = require('../config/database');

class MessagingService {
  constructor() {
    // Initialize SendGrid
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.emailEnabled = true;
      console.log('✅ SendGrid email service initialized');
    } else {
      this.emailEnabled = false;
      console.log('⚠️  SendGrid not configured - email sending disabled');
    }

    // Initialize Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const twilio = require('twilio');
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        this.smsEnabled = true;
        this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
        console.log('✅ Twilio SMS service initialized');
      } catch (error) {
        this.smsEnabled = false;
        console.log('⚠️  Twilio configuration error - SMS sending disabled:', error.message);
      }
    } else {
      this.smsEnabled = false;
      console.log('⚠️  Twilio not configured - SMS sending disabled');
    }
  }

  /**
   * Send an email using SendGrid
   */
  async sendEmail(messageData) {
    if (!this.emailEnabled) {
      throw new Error('Email service not configured');
    }

    const { to, subject, body, messageId } = messageData;

    try {
      const msg = {
        to: to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourcrm.com',
        subject: subject,
        html: body,
        // Add custom headers for tracking
        customArgs: {
          messageId: messageId.toString()
        }
      };

      console.log(`📧 Sending email to ${to}: "${subject}"`);
      const response = await sgMail.send(msg);
      
      // SendGrid returns an array, get the first response
      const sendGridResponse = response[0];
      
      return {
        success: true,
        providerMessageId: sendGridResponse.headers['x-message-id'],
        status: 'sent',
        sentAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      
      return {
        success: false,
        status: 'failed',
        errorMessage: error.message,
        sentAt: new Date().toISOString()
      };
    }
  }

  /**
   * Send an SMS using Twilio
   */
  async sendSMS(messageData) {
    if (!this.smsEnabled) {
      throw new Error('SMS service not configured');
    }

    if (!this.twilioPhoneNumber) {
      throw new Error('Twilio phone number not configured');
    }

    const { to, body, messageId } = messageData;

    try {
      console.log(`📱 Sending SMS to ${to}: "${body.substring(0, 50)}..."`);
      
      const message = await this.twilioClient.messages.create({
        body: body,
        from: this.twilioPhoneNumber,
        to: to
      });

      return {
        success: true,
        providerMessageId: message.sid,
        status: 'sent',
        sentAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ SMS sending failed:', error.message);
      
      return {
        success: false,
        status: 'failed',
        errorMessage: error.message,
        sentAt: new Date().toISOString()
      };
    }
  }

  /**
   * Process pending messages and send them
   */
  async processPendingMessages() {
    const client = await pool.connect();
    
    try {
      console.log('🔄 Processing pending messages...');
      
      // Get all pending messages
      const result = await client.query(`
        SELECT mh.*, c.first_name, c.last_name, c.email, c.phone
        FROM message_history mh
        JOIN contacts c ON mh.contact_id = c.id
        WHERE mh.status = 'pending'
        ORDER BY mh.created_at ASC
        LIMIT 50
      `);

      const pendingMessages = result.rows;
      console.log(`📋 Found ${pendingMessages.length} pending messages`);

      if (pendingMessages.length === 0) {
        return { processed: 0, successful: 0, failed: 0 };
      }

      let successful = 0;
      let failed = 0;

      // Process each message
      for (const message of pendingMessages) {
        try {
          let sendResult;
          
          if (message.type === 'email') {
            if (!message.recipient_email) {
              throw new Error('No email address available');
            }
            
            sendResult = await this.sendEmail({
              to: message.recipient_email,
              subject: message.subject,
              body: message.body,
              messageId: message.id
            });
          } else if (message.type === 'sms') {
            if (!message.recipient_phone) {
              throw new Error('No phone number available');
            }
            
            sendResult = await this.sendSMS({
              to: message.recipient_phone,
              body: message.body,
              messageId: message.id
            });
          } else {
            throw new Error(`Unknown message type: ${message.type}`);
          }

          // Update message status in database
          await client.query(`
            UPDATE message_history 
            SET 
              status = $1,
              provider_message_id = $2,
              error_message = $3,
              sent_at = $4,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
          `, [
            sendResult.status,
            sendResult.providerMessageId || null,
            sendResult.errorMessage || null,
            sendResult.sentAt,
            message.id
          ]);

          if (sendResult.success) {
            successful++;
            console.log(`✅ Message ${message.id} sent successfully`);
          } else {
            failed++;
            console.log(`❌ Message ${message.id} failed: ${sendResult.errorMessage}`);
          }

        } catch (error) {
          failed++;
          console.error(`❌ Error processing message ${message.id}:`, error.message);
          
          // Update message as failed
          await client.query(`
            UPDATE message_history 
            SET 
              status = 'failed',
              error_message = $1,
              sent_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `, [error.message, message.id]);
        }

        // Small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Update campaign statistics
      await this.updateCampaignStats(client);

      console.log(`🎯 Processing complete: ${successful} successful, ${failed} failed`);
      
      return {
        processed: pendingMessages.length,
        successful,
        failed
      };

    } catch (error) {
      console.error('❌ Error processing pending messages:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update campaign statistics based on message status
   */
  async updateCampaignStats(client) {
    try {
      // Update campaign counts based on message statuses
      await client.query(`
        UPDATE message_campaigns 
        SET 
          sent_count = (
            SELECT COUNT(*) 
            FROM message_history 
            WHERE campaign_id = message_campaigns.id 
            AND status IN ('sent', 'delivered')
          ),
          failed_count = (
            SELECT COUNT(*) 
            FROM message_history 
            WHERE campaign_id = message_campaigns.id 
            AND status = 'failed'
          ),
          updated_at = CURRENT_TIMESTAMP
        WHERE status = 'sending'
      `);

      // Mark campaigns as completed if all messages are processed
      await client.query(`
        UPDATE message_campaigns 
        SET 
          status = 'completed',
          sent_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE status = 'sending'
        AND NOT EXISTS (
          SELECT 1 
          FROM message_history 
          WHERE campaign_id = message_campaigns.id 
          AND status = 'pending'
        )
      `);

    } catch (error) {
      console.error('❌ Error updating campaign stats:', error);
    }
  }

  /**
   * Start the message processing job (runs every 30 seconds)
   */
  startMessageProcessor() {
    console.log('🚀 Starting message processor...');
    
    // Process immediately
    this.processPendingMessages().catch(console.error);
    
    // Then process every 30 seconds
    this.processingInterval = setInterval(() => {
      this.processPendingMessages().catch(console.error);
    }, 30000); // 30 seconds

    console.log('✅ Message processor started (runs every 30 seconds)');
  }

  /**
   * Stop the message processing job
   */
  stopMessageProcessor() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('🛑 Message processor stopped');
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      email: {
        enabled: this.emailEnabled,
        provider: 'SendGrid'
      },
      sms: {
        enabled: this.smsEnabled,
        provider: 'Twilio',
        phoneNumber: this.twilioPhoneNumber
      }
    };
  }
}

// Create singleton instance
const messagingService = new MessagingService();

module.exports = messagingService; 