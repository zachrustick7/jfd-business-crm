# 🚀 JFD Business CRM Platform

A modern, full-stack Customer Relationship Management (CRM) system built for accountants and business professionals. Features contact management, email campaigns, and automated messaging.

## ✨ Features

### 📋 **Contact Management**
- Complete CRUD operations for contacts
- Search and filter functionality
- Clean, intuitive interface
- Ready for CSV import (future enhancement)

### 📧 **Email Campaign System**
- **Message Templates** with dynamic variables (e.g., `{{firstName}}`, `{{company}}`)
- **Bulk Email Campaigns** with SendGrid integration
- **Background Processing** - Automated message queue (runs every 30 seconds)
- **Message History** - Full tracking and status monitoring
- **Real-time Status Updates** (pending → sent → delivered)

### 🔐 **Authentication & Security**
- JWT-based authentication
- Secure password hashing with bcrypt
- User session management

### 🎨 **Modern UI/UX**
- Custom CSS design (no framework dependencies)
- Responsive, mobile-first design
- Clean, minimalistic interface
- Seamless sidebar navigation

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **React Router** for navigation
- **Axios** for API calls
- **Custom CSS** (lightweight, no dependencies)
- **Lucide React** for icons

### **Backend**
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **SendGrid** for email delivery
- **Twilio** ready for SMS (future)

### **Development**
- **Concurrently** for running client/server
- **Nodemon** for hot reloading
- **ESLint** for code quality

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL
- SendGrid account (for email)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jfd-business-crm
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   
   # Install server dependencies
   cd ../server && npm install
   ```

3. **Set up environment variables**
   ```bash
   # In server/.env
   DATABASE_URL=postgresql://username:password@localhost:5432/jfd_crm
   JWT_SECRET=your-super-secret-jwt-key-here
   SENDGRID_API_KEY=your-sendgrid-api-key-here
   SENDGRID_FROM_EMAIL=your-verified-email@domain.com
   PORT=5001
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb jfd_crm
   
   # Tables will be created automatically on first run
   ```

5. **Start the application**
   ```bash
   # From project root - starts both client and server
   npm run dev
   
   # OR start separately:
   # Terminal 1: cd server && npm start
   # Terminal 2: cd client && npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 📊 Database Schema

### Core Tables
- **users** - User authentication and profiles
- **contacts** - Customer contact information
- **message_templates** - Reusable email templates with variables
- **message_campaigns** - Bulk email campaign tracking
- **message_history** - Individual message status and analytics

## 🎯 Usage

### Creating Email Campaigns

1. **Create Templates** - Go to Templates tab, create reusable email templates with dynamic variables
2. **Manage Contacts** - Add contacts with email addresses
3. **Create Campaign** - Select template, choose contacts, customize message
4. **Send Campaign** - Hit the play button, messages automatically process in background
5. **Track Results** - Monitor delivery status in Message History

### Dynamic Variables
Use these in your templates:
- `{{firstName}}` - Contact's first name
- `{{lastName}}` - Contact's last name  
- `{{email}}` - Contact's email
- `{{company}}` - Contact's company
- `{{position}}` - Contact's position

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - User login

### Contacts
- `GET /api/contacts` - List contacts with pagination/search
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Templates
- `GET /api/templates` - List message templates
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `POST /api/templates/:id/preview` - Preview template with sample data

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create new campaign
- `POST /api/campaigns/:id/send` - Send campaign (starts background processing)
- `DELETE /api/campaigns/:id` - Delete campaign

### Message History
- `GET /api/message-history` - List message history with filtering

## 🚧 Future Enhancements

- [ ] SMS messaging with Twilio
- [ ] Contact import from CSV
- [ ] Email analytics (opens, clicks)
- [ ] Campaign scheduling
- [ ] Contact segmentation
- [ ] Webhook handlers for delivery status
- [ ] Campaign performance dashboard

## 🏗️ Architecture

### Background Processing
The system includes an integrated background message processor that:
- Runs every 30 seconds
- Processes messages in `pending` status
- Sends via SendGrid API
- Updates message status automatically
- Tracks campaign completion

### Data Flow
1. User creates campaign → Messages created with `draft` status
2. User hits "Send" → Campaign status: `sending`, Messages: `pending`
3. Background processor picks up `pending` messages
4. SendGrid API sends emails → Status updates to `sent`
5. Campaign marked `completed` when all messages processed

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for business professionals who need reliable customer communication.** 