# 📋 Pre-Deployment Checklist

Use this checklist before deploying to Netlify:

## ☐ Gmail Setup (Required)

- [ ] Go to https://myaccount.google.com/security
- [ ] Enable 2-Factor Authentication for mohammedibrahimah97@gmail.com
- [ ] Go to https://myaccount.google.com/apppasswords
- [ ] Create App Password named "Pre-onboarding Tool"
- [ ] Copy and save the 16-character password (format: xxxx xxxx xxxx xxxx)

## ☐ Intercom Setup (Required)

- [ ] Log into Intercom at https://app.intercom.com
- [ ] Go to Settings → Installation → Web
- [ ] Copy your App ID (looks like: abc123def)
- [ ] Open file: `client/public/index.html`
- [ ] Find line: `app_id: "YOUR_INTERCOM_APP_ID"`
- [ ] Replace `YOUR_INTERCOM_APP_ID` with your actual App ID (appears TWICE in file)
- [ ] Save the file

## ☐ Code Repository (Choose One)

### Option A: GitHub (Recommended)
- [ ] Create new repository on GitHub
- [ ] Run: `git add .`
- [ ] Run: `git commit -m "Ready for Netlify deployment"`
- [ ] Run: `git remote add origin https://github.com/YOUR_USERNAME/pre-onboarding-tool.git`
- [ ] Run: `git push -u origin main`

### Option B: Direct Netlify CLI
- [ ] Run: `npm install -g netlify-cli`
- [ ] Run: `netlify login`
- [ ] Continue to Netlify deployment step below

## ☐ Netlify Deployment (Choose One)

### Option A: Via GitHub (If you chose GitHub above)
- [ ] Go to https://app.netlify.com
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Choose GitHub
- [ ] Select your repository
- [ ] Build command: `npm run build`
- [ ] Publish directory: `client/build`
- [ ] Functions directory: `netlify/functions`
- [ ] Click "Deploy site"

### Option B: Via Netlify CLI (If you chose CLI above)
- [ ] Run: `cd "/Users/mohammad/Desktop/Pre-onboarding tool"`
- [ ] Run: `netlify init`
- [ ] Follow prompts to create new site
- [ ] Run: `netlify deploy --prod`

## ☐ Environment Variables (Required)

After deploying, in Netlify dashboard:
- [ ] Go to Site settings → Environment variables
- [ ] Click "Add a variable"
- [ ] Add variable:
  - Key: `EMAIL_USER`
  - Value: `mohammedibrahimah97@gmail.com`
- [ ] Add another variable:
  - Key: `EMAIL_PASSWORD`
  - Value: (paste your 16-character Gmail App Password)
- [ ] Save

## ☐ Post-Deployment Testing

- [ ] Visit your Netlify URL (e.g., https://your-app.netlify.app)
- [ ] Check that the page loads
- [ ] Look for Intercom widget in bottom-right corner
- [ ] Click "Begin Tests"
- [ ] Enter your email address
- [ ] Run through all 8 tests:
  - [ ] Test 1: Domain Access
  - [ ] Test 2: Email Delivery
  - [ ] Test 3: Email 2FA
  - [ ] Test 4: File Download
  - [ ] Test 5: File Upload
  - [ ] Test 6: Intercom Widget
  - [ ] Test 7: Screen Resolution
  - [ ] Test 8: Connection Speed

## ☐ Troubleshooting (If Needed)

If emails don't send:
- [ ] Check Gmail App Password is correct
- [ ] Verify 2FA is enabled on Gmail
- [ ] Check Netlify environment variables
- [ ] View Netlify function logs

If Intercom doesn't load:
- [ ] Verify App ID is correct in index.html
- [ ] Disable ad blockers
- [ ] Check browser console for errors

If files don't download:
- [ ] Allow pop-ups from your Netlify domain
- [ ] Check browser download settings

---

## ✅ Deployment Complete!

Once all checkboxes are complete, your application is live and working! 🎉

Your deployed URL: `https://________________________.netlify.app`

Date deployed: _______________
