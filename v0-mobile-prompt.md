# V0 Prompt: Mobile CRM - Contact Manager & Messaging App

## Overview
Build a mobile-first, responsive web application for contact management and bulk messaging. This is a simplified version of a full CRM system, focusing on two core workflows: managing contacts and sending messages to selected recipients.

## Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React hooks (useState, useEffect)
- **Icons**: Lucide React
- **Database**: Mock data (use localStorage for persistence)

## Design Requirements
- **Mobile-first**: Optimized for phones (320px - 428px width)
- **Modern UI**: Clean, professional design with smooth animations
- **Color Scheme**: 
  - Primary: Blue (#3b82f6)
  - Success: Green (#10b981)
  - Error: Red (#ef4444)
  - Neutral: Gray scale
- **Typography**: Sans-serif, readable font sizes (minimum 16px for body text)

---

## Page 1: Contacts Manager

### Layout
- **Header**: Fixed top navigation with title "My Contacts" and a "+ Add Contact" button
- **Search Bar**: Sticky below header with search icon and placeholder "Search contacts..."
- **Contact List**: Scrollable card-based layout showing all contacts
- **Empty State**: Friendly illustration/icon with "No contacts yet" message when list is empty

### Contact Card Design
Each contact should display as a card with:
- **Avatar**: Circular icon with initials (generated from first/last name)
- **Name**: Bold, 16px font (e.g., "John Smith")
- **Phone**: Gray text with phone icon (e.g., "📱 +1 (555) 123-4567")
- **Email**: Gray text with email icon (e.g., "✉️ john@example.com")
- **Tags**: Small pill badges (e.g., "Customer", "Lead", "VIP")
- **Actions**: 
  - Edit button (pencil icon)
  - Delete button (trash icon)

### Add/Edit Contact Form (Modal or Slide-up Sheet)
Form fields:
1. **First Name** (required, text input)
2. **Last Name** (required, text input)
3. **Phone Number** (required, tel input with US format validation)
4. **Email** (optional, email input)
5. **Tags** (optional, multi-select or comma-separated input - e.g., "Customer, VIP, Lead")
6. **Notes** (optional, textarea)

**Buttons**:
- "Save Contact" (primary blue button)
- "Cancel" (secondary gray button)

**Validation**:
- Show error messages inline for invalid inputs
- Prevent submission until required fields are valid
- Phone format: (XXX) XXX-XXXX or +1XXXXXXXXXX

### Features
- **Search**: Real-time filtering by name, phone, or email
- **Sort**: Alphabetical by first name (default)
- **Delete Confirmation**: "Are you sure?" alert before deletion
- **Local Storage**: Persist contacts between sessions

### Sample Data Structure
```javascript
const contact = {
  id: "uuid-here",
  firstName: "John",
  lastName: "Smith",
  phone: "+15551234567",
  email: "john@example.com",
  tags: ["Customer", "VIP"],
  notes: "Met at conference 2024",
  createdAt: "2024-11-16T10:30:00Z"
}
```

---

## Page 2: Send Message

### Layout
- **Header**: Fixed top with title "Send Message" and back arrow to contacts
- **Message Composer**: Large textarea taking ~40% of screen
- **Recipient Selector**: Below message box
- **Preview**: Shows selected recipient count
- **Send Button**: Fixed at bottom, full width, prominent

### Message Composer
- **Textarea**:
  - Placeholder: "Type your message here..."
  - Min height: 150px
  - Auto-resize as user types
  - Character counter at bottom right (e.g., "0/500 characters")
  - Max length: 500 characters
- **Variable Support** (bonus feature):
  - Show hint: "Use {{firstName}} to personalize"
  - Example: "Hi {{firstName}}, thanks for being a valued customer!"

### Recipient Selector
- **Button**: "Select Recipients" that opens a modal/sheet
- **Display**: Show count like "3 recipients selected" or "No recipients selected"
- **Modal/Sheet Contents**:
  - **Search Bar**: Filter contacts
  - **Select All Checkbox**: At top
  - **Contact List**: 
    - Checkbox next to each contact
    - Show name and phone number
    - Show avatar/initials
  - **Selected Counter**: "X of Y contacts selected" at bottom
  - **Done Button**: Close and return to message composer

### Message Preview Section (Optional Enhancement)
- Expandable section showing how message will look
- If using variables, show example with first selected contact's data

### Send Button
- **State 1 (Disabled)**: Gray, "Select Recipients First" - when no recipients
- **State 2 (Disabled)**: Gray, "Enter Message" - when no message text
- **State 3 (Ready)**: Blue, "Send to X Recipients" - when ready
- **State 4 (Sending)**: Loading spinner, "Sending..."
- **State 5 (Success)**: Green checkmark animation, "Sent Successfully!"

### After Send
- Show success modal with:
  - Checkmark icon
  - "Message Sent!"
  - "Your message was sent to X recipients"
  - "View Details" button (shows recipient list)
  - "Send Another" button (clears form)

### Sample Message Data Structure
```javascript
const message = {
  id: "uuid-here",
  text: "Hi {{firstName}}, thanks for being a valued customer!",
  recipientIds: ["contact-id-1", "contact-id-2"],
  sentAt: "2024-11-16T11:00:00Z",
  status: "sent"
}
```

---

## Navigation
- **Bottom Tab Bar** (fixed):
  - **Tab 1**: Contacts icon + "Contacts" label
  - **Tab 2**: Message icon + "Messages" label
- Active tab highlighted in blue
- Inactive tabs in gray

---

## Key Interactions & Animations
1. **Form Slide-Up**: Smooth slide animation when opening add/edit contact
2. **Button Press**: Subtle scale-down effect (scale: 0.95)
3. **Card Swipe** (optional): Swipe left on contact card to reveal delete
4. **Success Confetti** (optional): Brief confetti animation after message sent
5. **Loading States**: Skeleton loaders while data loads
6. **Toast Notifications**: Small popup for errors/confirmations

---

## Accessibility
- Proper ARIA labels for all interactive elements
- Focus states visible on all inputs/buttons
- Color contrast meets WCAG AA standards
- Touch targets minimum 44x44px
- Screen reader friendly

---

## Error Handling
- **No Internet**: Show offline banner at top
- **Failed to Save**: Toast notification "Unable to save contact. Try again."
- **Failed to Send**: Modal with "Message failed to send" and retry option
- **Invalid Input**: Inline error messages in red below field

---

## Sample User Flows

### Flow 1: Add a New Contact
1. User opens app → sees Contacts page
2. Taps "+ Add Contact" button
3. Form slides up from bottom
4. Fills in: First Name "Sarah", Last Name "Johnson", Phone "+15559876543"
5. Taps "Save Contact"
6. Form closes, new contact appears in list
7. Toast shows "Contact saved successfully"

### Flow 2: Send Message to Multiple Contacts
1. User navigates to "Messages" tab
2. Types message: "Hi {{firstName}}, special offer just for you!"
3. Taps "Select Recipients"
4. Modal opens with contact list
5. Searches for "John", checks his box
6. Clears search, checks "Sarah" and 2 more contacts
7. Sees "4 of 10 contacts selected"
8. Taps "Done"
9. Back on message page, sees "4 recipients selected"
10. Taps "Send to 4 Recipients"
11. Button shows loading spinner
12. Success modal appears: "Message Sent! Sent to 4 recipients"
13. Taps "Send Another" to continue

---

## Data Persistence
Use **localStorage** to store:
- `contacts`: Array of all contacts
- `messages`: Array of sent message history (optional)
- Auto-save on every change
- Load on app initialization

---

## Bonus Features (If Time Permits)
1. **Message History**: View past sent messages
2. **Contact Groups**: Create groups like "VIP Customers", "Leads"
3. **Scheduled Messages**: Send message at specific time
4. **Message Templates**: Save frequently used messages
5. **Import Contacts**: Upload CSV file
6. **Dark Mode**: Toggle between light/dark themes

---

## Example Screenshots to Reference
Think of the UI style similar to:
- **WhatsApp**: Clean message composer
- **iOS Contacts App**: Simple, elegant contact cards
- **Notion Mobile**: Smooth modals and interactions
- **Linear Mobile**: Modern, minimal design

---

## Technical Implementation Notes
- Use **shadcn/ui** components: Button, Input, Textarea, Card, Dialog, Sheet, Checkbox
- Implement **form validation** with React Hook Form or native validation
- Use **Tailwind CSS** utilities for responsive design
- Create **reusable components**: ContactCard, MessageComposer, RecipientSelector
- Implement **optimistic UI updates** for instant feedback

---

## Deliverables
1. Fully functional Next.js application
2. Mobile-responsive (looks great on phones)
3. Clean, modern UI matching the design requirements
4. Working contact CRUD operations
5. Working message sending with recipient selection
6. LocalStorage persistence
7. Smooth animations and transitions
8. Accessible and user-friendly

---

## Color Palette Reference
```css
/* Primary Colors */
--primary: #3b82f6;
--primary-hover: #2563eb;
--primary-light: #dbeafe;

/* Success */
--success: #10b981;
--success-light: #d1fae5;

/* Error */
--error: #ef4444;
--error-light: #fee2e2;

/* Neutral */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-600: #4b5563;
--gray-800: #1f2937;
```

---

## Final Notes
This is a streamlined, mobile-first CRM focused on the essentials: managing contacts and sending messages. Keep the UI clean, interactions smooth, and the user experience delightful. The app should feel professional yet approachable, perfect for small business owners or sales professionals who need quick contact management on the go.

**Good luck building! 🚀**

