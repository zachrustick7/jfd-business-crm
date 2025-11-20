# JFD CRM - Deployment Guide

## Quick Deploy to Railway + Vercel (FREE)

### Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub (free tier: $5/month credit, no credit card required)

2. **Deploy Backend + Database**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account and select `jfd-business-crm`
   - Railway will automatically detect Node.js
   - Click "Add variables" and add these environment variables:

   ```
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-abc123xyz
   SENDGRID_API_KEY=(your stakeholder's SendGrid API key)
   SENDGRID_FROM_EMAIL=(your stakeholder's verified email)
   TWILIO_ACCOUNT_SID=(optional - leave blank for now)
   TWILIO_AUTH_TOKEN=(optional - leave blank for now)
   TWILIO_PHONE_NUMBER=(optional - leave blank for now)
   NODE_ENV=production
   PORT=5001
   ```

3. **Add PostgreSQL Database**
   - In your Railway project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create a DATABASE_URL variable
   - The backend will use this automatically!

4. **Get Your Backend URL**
   - Go to your backend service settings
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://your-app.up.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub (completely free for hobby projects)

2. **Deploy Frontend**
   - Click "Add New" → "Project"
   - Import your `jfd-business-crm` repository
   - Vercel will auto-detect it's a Create React App
   - Configure the project:
     - **Root Directory**: `client`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`
     - **Install Command**: `npm install`

3. **Add Environment Variable**
   - Before deploying, add this environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.up.railway.app
   ```
   (Replace with your Railway backend URL from Step 1)

4. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your live URL (e.g., `https://jfd-crm.vercel.app`)

### Step 3: Test & Share

1. Visit your Vercel URL
2. Create an account
3. Upload contacts
4. Create a campaign and send (once SendGrid is configured)
5. Share the Vercel URL with your stakeholder! 🎉

---

## Alternative: Render (if Railway doesn't work)

**Backend on Render:**
- Go to https://render.com
- Free tier: 750 hours/month
- Create "Web Service" from GitHub
- Add PostgreSQL database (free tier)
- Same environment variables as above

---

## Cost Breakdown

- **Railway**: $5/month credit (FREE), backend + database
- **Vercel**: Unlimited free for hobby projects
- **Total**: $0/month for low usage!

## SendGrid Setup for Stakeholder

Your stakeholder will need to:
1. Create free SendGrid account (100 emails/day free)
2. Verify their sending email address
3. Create API key with "Mail Send" permissions
4. Give you the API key to add to Railway environment variables

---

## Important Notes

- Railway's free tier gives $5/month credit (~500 hours)
- After free credit runs out, backend will sleep (~$5/month to keep running)
- Vercel frontend is FREE forever for this use case
- Database on Railway free tier: 500MB storage (enough for thousands of contacts)

