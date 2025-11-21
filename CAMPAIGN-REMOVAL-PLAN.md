# Campaign Removal Plan - Simplify to "Send Message"

## Goal
Replace "campaigns" with a simple "Send Message" flow for better user experience.

## Changes Needed

### Backend
- Remove `message_campaigns` table (or make it invisible/deprecated)
- Update message creation to work without campaigns
- Direct message sending without campaign intermediary

### Frontend  
- Rename "Messaging" page to "Send Message"
- Remove campaign creation step
- Flow: Select contacts → Choose template → Send immediately
- Remove campaign status tracking (just show message history)

### Database
- Keep message_history table (it's the actual messages)
- Either remove message_campaigns table or make it optional
- Update foreign keys to make campaign_id nullable

## Simplified User Flow
1. Go to "Send Message" page
2. Select recipients (contacts)
3. Choose template (or write message)
4. Click "Send Now"
5. View in "Message History"

No campaign drafts, no campaign status - just direct message sending!

