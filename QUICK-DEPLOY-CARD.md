# ⚡ Quick Deployment Reference Card

## 🎯 Your Mission
Get a shareable link to your stakeholder in 15-20 minutes!

---

## 📋 Step 1: Railway Backend (5-7 min)

1. **Sign up**: https://railway.app (use GitHub)
2. **New Project** → **Deploy from GitHub** → `jfd-business-crm`
3. **Settings** → Root Directory: `server`
4. **+ New** → **Database** → **PostgreSQL** (auto-creates!)
5. **Variables** → **Raw Editor** → Paste this:

```env
JWT_SECRET=jfd-crm-production-secret-2024-abc123
SENDGRID_API_KEY=(leave blank for now - stakeholder will provide)
SENDGRID_FROM_EMAIL=(leave blank for now)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
NODE_ENV=production
PORT=5001
```

6. **Settings** → **Networking** → **Generate Domain**
7. **✅ COPY THIS URL!** `https://________.up.railway.app`

---

## 📋 Step 2: Vercel Frontend (5-7 min)

1. **Sign up**: https://vercel.com (use GitHub)
2. **Add New** → **Project** → Import `jfd-business-crm`
3. **Configure**:
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **Environment Variables** → Add:
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-railway-url.up.railway.app/api`
5. **Deploy!**
6. **✅ COPY THIS URL!** `https://________.vercel.app`

---

## 📋 Step 3: Update CORS (2 min)

1. **Go back to Railway** → Your backend service
2. **Variables** → Add new:
   - Name: `CLIENT_URL`
   - Value: `https://your-vercel-url.vercel.app`
3. Backend auto-restarts ✅

---

## 📋 Step 4: Test (3-5 min)

Visit your Vercel URL and:
- [ ] Create account
- [ ] Add a contact
- [ ] Create a template
- [ ] Create a campaign (don't send yet - no SendGrid)
- [ ] **IF ALL WORKS → SHARE WITH STAKEHOLDER! 🎉**

---

## 📧 For Stakeholder to Enable Email

They need to:
1. Sign up: https://signup.sendgrid.com/ (FREE)
2. Verify their email address
3. Create API Key (Settings → API Keys → Full Access)
4. **Give you the API key**

You add to Railway:
- `SENDGRID_API_KEY` = (their key)
- `SENDGRID_FROM_EMAIL` = (their verified email)

Backend auto-restarts → Emails work! ✅

---

## 💰 Cost

- **Railway**: FREE for first month ($5 credit)
- **Vercel**: FREE forever
- **SendGrid**: FREE (100 emails/day)
- **TOTAL**: $0

After free credit: ~$5-10/month for Railway if running 24/7

---

## 🆘 Troubleshooting

**Backend won't deploy:**
- Check Railway logs (Deployments → View Logs)
- Verify `DATABASE_URL` exists (auto-created)

**Frontend shows "Network Error":**
- Check `REACT_APP_API_URL` has `/api` at the end
- Verify Railway backend is running (green dot)
- Check `CLIENT_URL` in Railway matches Vercel URL exactly

**Test health:**
- Visit: `https://your-backend.up.railway.app/api/health`
- Should see: `{"status":"OK"...}`

---

## 📝 What to Send Stakeholder

```
Hi [Name],

Your CRM is live! 🚀

Link: https://your-vercel-url.vercel.app

Create an account and start adding contacts!

To send emails, you'll need a free SendGrid account:
1. Sign up: https://signup.sendgrid.com/
2. Verify your email
3. Create API key
4. Send it to me to configure

User guide attached!

-Zach
```

---

## ✅ You're Ready!

Follow DEPLOY-NOW.md for detailed instructions.

**Start here**: https://railway.app

**Time estimate**: 15-20 minutes

**Let's deploy! 🚀**

