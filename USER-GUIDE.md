# 👋 Welcome to Your JFD CRM!

## Getting Started Guide

### 1. Create Your Account
1. Visit your CRM URL: `[YOUR-VERCEL-URL]`
2. Click "Sign Up"
3. Enter your email and create a password
4. Click "Create Account"
5. You're in!

---

### 2. Upload Your Contacts

#### Option A: Add Contacts Manually
1. Click "Contacts" in the sidebar
2. Click "+ Add Contact"
3. Fill in the form:
   - **Required**: First Name, Last Name, Email
   - **Optional**: Phone, Address, City, State, ZIP, Company, Position
   - **Tax Info**: Filing Status (Single, Married, etc.)
   - **Status**: Lead, Active Client, or Inactive
   - **Tags**: Add tags like "VIP", "Tax Client", "Virginia" (comma-separated)
4. Click "Add Contact"

#### Option B: Upload CSV File
1. Click "Contacts" in the sidebar
2. Click "📤 Upload CSV"
3. Your CSV should have these columns:
   ```
   firstName,lastName,email,phone,address,city,state,zipCode,company,filingStatus,status,tags
   ```
4. Select your CSV file
5. Click "Upload"
6. All contacts are imported automatically!

**Sample CSV Format:**
```csv
firstName,lastName,email,phone,city,state,filingStatus,status,tags
John,Doe,john@example.com,703-555-0123,Richmond,VA,Married Filing Jointly,active,"VIP,Tax Client"
Jane,Smith,jane@example.com,703-555-0124,Norfolk,VA,Single,active,"Lead,Virginia"
```

---

### 3. Create Email Templates

1. Click "Templates" in the sidebar
2. Click "+ New Template"
3. Fill in:
   - **Name**: "Tax Season Reminder 2024"
   - **Type**: Email
   - **Category**: Promotional, Transactional, or Newsletter
   - **Subject**: "Time to Prepare Your 2024 Taxes!"
   - **Body**: Your message with placeholders:
     - `{{firstName}}` - Contact's first name
     - `{{lastName}}` - Contact's last name
     - `{{email}}` - Contact's email
     - `{{company}}` - Contact's company
4. Click "Create Template"

**Example Template:**
```
Subject: {{firstName}}, Your 2024 Tax Filing Checklist

Hi {{firstName}},

Tax season is here! As your trusted advisor at JFD Business Consulting, 
I wanted to send you a quick checklist to prepare for your 2024 filing.

Based on your filing status ({{filingStatus}}), here's what you need...

[Your content here]

Best regards,
JFD Business Consulting Team
```

---

### 4. Send Blast Campaigns

1. Click "Messaging" in the sidebar
2. Click "+ New Campaign"
3. Fill in:
   - **Name**: "Q1 2024 Tax Reminder"
   - **Select Template**: Choose your template
   - **Select Recipients**: Check the contacts you want to email
     - Tip: Use the search to filter by city, state, or tags!
   - **Status**: Draft (to save) or Ready (to send)
4. Click "Create Campaign"
5. Click the ▶️ Play button to send immediately

---

### 5. Filter Contacts by Location or Status

#### Search Contacts:
- Use the search bar to filter by:
  - Name (first or last)
  - Email
  - Company
  - **City** (e.g., "Richmond")
  - **State** (e.g., "VA")

#### Use Tags for Blasts:
- Add tags like "Virginia", "NewMexico", "VIP", "ActiveClient"
- When creating campaigns, search for the tag
- Select all contacts with that tag
- Send your blast!

**Example Workflow:**
1. Tag all Virginia clients with "Virginia"
2. Tag all New Mexico clients with "NewMexico"
3. Create a Virginia-specific email template
4. Create campaign → Search "Virginia" → Select all → Send!

---

### 6. Track Message History

1. Click "Message History" in the sidebar
2. View all sent messages:
   - ✅ **Sent** - Successfully delivered
   - ❌ **Failed** - Not delivered (hover for error)
   - 📧 **Delivered** - Confirmed received
   - ⚡ **Bounced** - Email invalid or bounced back
3. Filter by:
   - Message Type (Email/SMS)
   - Status
   - Campaign
4. Export history as needed

---

### 7. Monitor Your Dashboard

1. Click "Dashboard" in the sidebar
2. See at-a-glance:
   - Total Contacts
   - Active Campaigns
   - Messages Sent This Month
   - Message Success Rate
   - Recent Activity

---

## 🎯 Quick Use Cases

### Use Case 1: Send Tax Deadline Reminder to All Virginia Clients
1. Go to Contacts
2. Add tag "Virginia" to all VA clients (or search by state: VA)
3. Create template: "VA Tax Deadline Reminder"
4. Create campaign → Search "Virginia" → Select all → Send

### Use Case 2: Quarterly Newsletter to All Active Clients
1. Filter contacts by Status = "Active"
2. Create template: "Q1 2024 Newsletter"
3. Create campaign → Select all active clients → Send

### Use Case 3: Welcome Email for New Leads
1. Add new contact with Status = "Lead"
2. Add tag "NewLead"
3. Create template: "Welcome to JFD"
4. Create campaign for that one contact

---

## ⚙️ Email Configuration (Important!)

To send emails, you need a **SendGrid account**:

1. Sign up at https://signup.sendgrid.com/ (FREE - 100 emails/day)
2. Verify your business email address
3. Create API Key:
   - Settings → API Keys → Create API Key
   - Name: "JFD CRM"
   - Permission: Full Access
4. **Send the API key to your developer** to add to the system
5. Once configured, all emails will come from YOUR email address!

---

## 💡 Tips & Best Practices

### Email Best Practices:
- ✅ Always personalize with `{{firstName}}`
- ✅ Keep subject lines under 50 characters
- ✅ Include a clear call-to-action
- ✅ Test with yourself first before sending to all contacts
- ❌ Don't send more than 100 emails/day on free SendGrid tier

### Contact Management:
- **Use Tags liberally**: "VIP", "2023TaxClient", "Virginia", "HighValue"
- **Update Status regularly**: Move Leads → Active → Inactive
- **Keep Filing Status updated**: Helps with tax-specific campaigns
- **Add Notes**: Track conversations and important details

### Campaign Strategy:
- **Create drafts first**: Review before sending
- **Test on yourself**: Always send a test email first
- **Track results**: Check Message History after sending
- **Segment your audience**: Don't blast everyone - use tags and filters

---

## 🆘 Troubleshooting

### "Emails aren't sending"
- Check if SendGrid is configured (ask your developer)
- Verify you haven't exceeded 100 emails/day (free tier limit)
- Check Message History for error details

### "Can't find a contact"
- Use the search bar - it searches name, email, company, city, and state
- Check if the contact was imported successfully
- Verify spelling

### "Campaign is stuck in 'Sending' status"
- This means messages are being processed
- Check Message History to see individual message status
- If stuck for >5 minutes, contact your developer

### "CSV upload failed"
- Verify your CSV has the correct column names (firstName, lastName, email, etc.)
- Make sure emails are valid
- Check file size (should be under 5MB)

---

## 📞 Need Help?

Contact your developer if:
- Emails aren't sending after SendGrid setup
- System is slow or unresponsive
- You need custom features or integrations
- You want to upgrade (more than 100 emails/day)

---

## 🚀 You're All Set!

Start by:
1. Uploading your contacts (CSV or manual)
2. Creating your first template
3. Sending a test campaign to yourself
4. Once confirmed, send to your clients!

**Happy CRM-ing! 🎉**

