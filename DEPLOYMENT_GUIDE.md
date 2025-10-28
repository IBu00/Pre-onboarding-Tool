# 🚀 Deployment Guide - Pre-onboarding Tool

## ✅ All Changes Completed

All the required changes have been implemented in your application. Here's what was done:

### 1. ✅ Netlify Functions Created
- Created `netlify/functions/` directory with serverless functions:
  - `test-domain.js` - Tests the deployed Netlify URL
  - `send-email.js` - Sends emails from mohammedibrahimah97@gmail.com
  - `verify-email.js` - Verifies email codes
  - `file-download.js` - Provides test files for download
  - `file-upload.js` - Handles file uploads with validation
  - `ping.js` - Health check endpoint

### 2. ✅ Email Configuration
- Emails will be sent from: `mohammedibrahimah97@gmail.com`
- You need to configure Gmail App Password (see below)

### 3. ✅ File Tests Reordered
- **Test 4**: File Download (downloads all 3 files at once)
- **Test 5**: File Upload (uploads the downloaded files back)

### 4. ✅ Domain Test Updated
- Now tests the deployed Netlify URL instead of localhost

### 5. ✅ Intercom Integration Added
- Intercom script added to `client/public/index.html`
- You need to add your Intercom App ID (see below)

---

## 📋 Next Steps - DEPLOYMENT

### Step 1: Gmail App Password Setup

1. **Enable 2-Factor Authentication**:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification for mohammedibrahimah97@gmail.com

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it: "Pre-onboarding Tool"
   - Click **Generate**
   - Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
   - Save it securely - you'll need it for Netlify environment variables

---

### Step 2: Get Your Intercom App ID

1. Log into your Intercom trial account at https://app.intercom.com
2. Go to **Settings** → **Installation** → **Web**
3. Copy your **App ID** (looks like: `abc123def`)
4. Update the file `client/public/index.html`:
   - Find: `YOUR_INTERCOM_APP_ID` (appears twice)
   - Replace with your actual App ID

---

### Step 3: Deploy to Netlify (Option A: GitHub Integration - Recommended)

#### 3.1 Push to GitHub

```bash
cd "/Users/mohammad/Desktop/Pre-onboarding tool"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Netlify deployment with serverless functions"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/pre-onboarding-tool.git
git branch -M main
git push -u origin main
```

#### 3.2 Connect to Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `client/build`
   - **Functions directory**: `netlify/functions`

#### 3.3 Add Environment Variables

In Netlify dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add these variables:
   ```
   EMAIL_USER=mohammedibrahimah97@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password-here
   ```

3. Click **"Deploy site"**

---

### Step 4: Deploy to Netlify (Option B: Netlify CLI)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
cd "/Users/mohammad/Desktop/Pre-onboarding tool"
netlify init

# Add environment variables
netlify env:set EMAIL_USER "mohammedibrahimah97@gmail.com"
netlify env:set EMAIL_PASSWORD "your-16-char-app-password"

# Deploy
netlify deploy --prod
```

---

### Step 5: Post-Deployment Configuration

After deployment, Netlify will give you a URL like: `https://your-app-name.netlify.app`

1. **Update Intercom App ID** (if not done in Step 2):
   - Edit `client/public/index.html`
   - Replace `YOUR_INTERCOM_APP_ID` with your actual ID
   - Commit and push: `git add . && git commit -m "Add Intercom App ID" && git push`

2. **Test the Application**:
   - Visit your Netlify URL
   - Click "Begin Tests"
   - The tests will now run against your deployed site

---

## 🧪 How Tests Work Now

### Test 1: Domain Access
- ✅ Tests your deployed Netlify URL
- Checks if the domain is accessible

### Test 2: Email Delivery
- ✅ Sends email from mohammedibrahimah97@gmail.com
- User receives verification code
- User enters code to verify

### Test 3: Email 2FA Timing
- ✅ Sends 2FA code from mohammedibrahimah97@gmail.com
- Measures delivery time
- User enters code to verify

### Test 4: File Download
- ✅ Downloads 3 test files automatically
- Files save to user's Downloads folder
- Tests browser download permissions

### Test 5: File Upload
- ✅ User selects the downloaded files
- Uploads files back to platform
- Validates file types and sizes

### Test 6: Intercom Widget
- ✅ Checks if Intercom widget loads
- Tests for ad blockers or script blockers

### Test 7: Screen Resolution
- ✅ Client-side test
- Checks minimum resolution requirements

### Test 8: Connection Speed
- ✅ Tests download/upload speed
- Measures latency

---

## 🔍 Troubleshooting

### Emails Not Sending
- Verify Gmail App Password is correct
- Check 2FA is enabled on Gmail account
- Check Netlify environment variables are set
- View Netlify function logs for errors

### Files Not Downloading
- Check browser pop-up blocker settings
- Allow downloads from your Netlify domain
- Check browser console for errors

### Intercom Not Loading
- Verify App ID is correct in `index.html`
- Check browser console for errors
- Disable ad blockers temporarily
- Ensure third-party cookies are enabled

### Build Failures
- Check Netlify build logs
- Ensure all dependencies are in package.json
- Verify Node version (should be 18+)

---

## 📁 File Structure

```
Pre-onboarding tool/
├── netlify/
│   ├── functions/
│   │   ├── test-domain.js
│   │   ├── send-email.js
│   │   ├── verify-email.js
│   │   ├── file-download.js
│   │   ├── file-upload.js
│   │   └── ping.js
│   └── package.json
├── netlify.toml
├── client/
│   ├── .env.production
│   ├── public/
│   │   └── index.html (with Intercom)
│   └── src/
│       ├── services/
│       │   ├── apiService.ts (updated)
│       │   └── testService.ts (updated)
│       └── components/
│           └── TestRunner.tsx (updated)
└── package.json (updated build scripts)
```

---

## ✨ Summary

Your application is now ready for deployment! 

**What You Need to Do:**

1. ✅ Get Gmail App Password
2. ✅ Get Intercom App ID and update index.html
3. ✅ Push to GitHub
4. ✅ Deploy to Netlify
5. ✅ Add environment variables in Netlify
6. ✅ Test the deployed application

**Everything else is already configured and ready to go!** 🎉
