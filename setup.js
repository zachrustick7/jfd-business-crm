#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up JFD CRM Platform...\n');

// Check if .env file exists
const envPath = path.join(__dirname, 'server', '.env');
const exampleEnvPath = path.join(__dirname, 'server', 'config.example.env');

if (!fs.existsSync(envPath) && fs.existsSync(exampleEnvPath)) {
  console.log('📝 Creating .env file from template...');
  fs.copyFileSync(exampleEnvPath, envPath);
  console.log('✅ .env file created at server/.env');
  console.log('⚠️  Please edit server/.env with your actual configuration values\n');
} else if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists\n');
}

// Display setup checklist
console.log('📋 Setup Checklist:');
console.log('1. ✅ Project structure created');
console.log('2. ⏳ Install dependencies with: npm run setup');
console.log('3. ⏳ Set up PostgreSQL database named "jfd_crm"');
console.log('4. ⏳ Configure server/.env with your database credentials');
console.log('5. ⏳ Add email service credentials (SendGrid or Mailgun)');
console.log('6. ⏳ Add SMS credentials (Twilio) - optional');
console.log('7. ⏳ Start the application with: npm run dev\n');

console.log('📚 Next Steps:');
console.log('• Read the README.md for detailed setup instructions');
console.log('• Use sample-contacts.csv as a template for importing contacts');
console.log('• Check the API documentation section for endpoint details\n');

console.log('🎯 Quick Start Commands:');
console.log('  npm run setup     # Install all dependencies');
console.log('  npm run dev       # Start both frontend and backend');
console.log('  npm run server:dev # Start only backend server');
console.log('  npm run client:dev # Start only frontend\n');

console.log('📧 Email Services Setup:');
console.log('• SendGrid: https://sendgrid.com/ (Recommended)');
console.log('• Mailgun: https://www.mailgun.com/\n');

console.log('📱 SMS Service Setup:');
console.log('• Twilio: https://www.twilio.com/\n');

console.log('✨ Setup script completed!');
console.log('💡 Need help? Check the troubleshooting section in README.md'); 