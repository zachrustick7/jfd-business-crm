# 🚀 Quick Deployment Guide - JFD CRM

## Prerequisites
- GitHub account (free)
- Railway account (sign up with GitHub at https://railway.app)
- Vercel account (sign up with GitHub at https://vercel.com)

---

## 🎯 Step-by-Step Deployment (15 minutes)

### 1️⃣ Push to GitHub (if not done)

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

### 2️⃣ Deploy Backend to Railway

**A. Create Railway Project**
1. Go to https://railway.app and sign in with GitHub
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select your `jfd-business-crm` repository
5. Railway will detect it's a Node.js app

**B. Configure Backend Service**
1. Click on the deployed service
2. Go to "Settings" tab
3. Under "Root Directory", enter: `server`
4. Under "Start Command", it should show: `node index.js`

**C. Add PostgreSQL Database**
1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create it and link it to your backend
4. The `DATABASE_URL` environment variable is auto-created!

**D. Add Environment Variables**
1. Click on your backend service
2. Go to "Variables" tab
3. Click "Raw Editor" and paste this:

```env
JWT_SECRET=jfd-crm-super-secret-key-production-2024-change-this
SENDGRID_API_KEY=your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
NODE_ENV=production
PORT=5001
```

**E. Generate Public URL**
1. Go to "Settings" tab
2. Scroll to "Networking"
3. Click "Generate Domain"
4. **SAVE THIS URL** (e.g., `https://jfd-business-crm-production.up.railway.app`)

**F. Wait for Deployment**
- Watch the "Deployments" tab
- Should take 2-3 minutes
- Look for "✓ Build successful" and "✓ Deployed"

**G. Test Backend**
- Visit: `https://your-backend-url.up.railway.app/api/health`
- Should see: `{"status":"OK","message":"JFD CRM Server is running"}`

---

### 3️⃣ Deploy Frontend to Vercel

**A. Import Project**
1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New" → "Project"
3. Import your `jfd-business-crm` repository

**B. Configure Build Settings**
1. **Framework Preset**: Create React App
2. **Root Directory**: `client`
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`
5. **Install Command**: `npm install`

**C. Add Environment Variable**
1. Click "Environment Variables"
2. Add this variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-url.up.railway.app/api`
   (Use the Railway backend URL from Step 2E)

**D. Deploy**
1. Click "Deploy"
2. Wait 2-3 minutes
3. Vercel will show your live URL (e.g., `https://jfd-crm.vercel.app`)

---

### 4️⃣ Configure CORS for Production

**Go back to Railway:**
1. Click on your backend service
2. Go to "Variables" tab
3. Add one more variable:
   - **Name**: `CLIENT_URL`
   - **Value**: `https://your-frontend.vercel.app`
   (Use your Vercel URL from Step 3D)
4. This will restart the backend with proper CORS settings

---

### 5️⃣ Test the Deployment

1. **Visit your Vercel frontend URL**
2. **Create an account** (use a real email)
3. **Add a contact manually**
4. **Test CSV upload** (optional)
5. **Create a template**
6. **Create a campaign** (but don't send yet - need SendGrid)

---

## 📧 SendGrid Setup (Required for Email Sending)

### For Your Stakeholder:
1. Create free SendGrid account: https://signup.sendgrid.com/
2. Verify their business email address
3. Create API Key:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name: "JFD CRM Production"
   - Permissions: "Full Access" or "Mail Send"
   - Copy the API key (shown once!)

4. **Update Railway Environment Variables:**
   - `SENDGRID_API_KEY` = (paste the API key)
   - `SENDGRID_FROM_EMAIL` = (verified email address)

5. Backend will automatically restart and emails will work!

---

## 🎉 Share with Stakeholder

**Send them:**
- Frontend URL: `https://your-app.vercel.app`
- Instructions: "Create an account, upload your contacts, and start sending campaigns!"

**Tell them they need:**
- SendGrid account (free tier: 100 emails/day)
- To give you their API key and verified email to enable sending

---

## 💰 Cost Breakdown

- **Railway Free Tier**: $5/month credit (enough for ~500 hours of backend runtime)
  - After credit exhausted: ~$5-10/month to keep running
  - Includes PostgreSQL database (500MB free)

- **Vercel**: Completely FREE for hobby projects
  - Unlimited deployments
  - Unlimited bandwidth for personal use

**Total**: FREE for first month, then ~$5-10/month if backend runs 24/7

**To reduce costs**: Railway can "sleep" the backend when not in use (free tier)

---

## 🔧 Troubleshooting

### Backend won't deploy
- Check "Deployments" tab for errors
- Verify all environment variables are set
- Make sure `DATABASE_URL` exists (auto-created by Railway PostgreSQL)

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` has `/api` at the end
- Check Railway backend is running (green status)
- Verify CORS `CLIENT_URL` matches your Vercel URL

### Emails not sending
- Check SendGrid API key is valid
- Verify `SENDGRID_FROM_EMAIL` is verified in SendGrid
- Check SendGrid hasn't exceeded daily limit (100/day on free)

### Database connection fails
- Railway PostgreSQL must be in the same project
- `DATABASE_URL` should be auto-created
- Check "Variables" tab to verify it exists

---

## 📱 Next Steps After Deployment

1. ✅ Test full user flow
2. ✅ Configure SendGrid with stakeholder's account
3. ✅ Send test campaign
4. ✅ Monitor Railway usage (keep under $5 credit)
5. ✅ Consider custom domain for frontend (optional)

---

## 🆘 Need Help?

- **Railway Docs**: https://docs.railway.app/
- **Vercel Docs**: https://vercel.com/docs
- **SendGrid Docs**: https://docs.sendgrid.com/

