# Pre-onboarding Tool - Comprehensive Testing Guide

This guide explains how to test each feature by simulating different scenarios to confirm the tests are actually working.

## Table of Contents
1. [Domain Access Test](#1-domain-access-test)
2. [Email Delivery Test](#2-email-delivery-test)
3. [Email 2FA Timing Test](#3-email-2fa-timing-test)
4. [File Download Test](#4-file-download-test)
5. [File Upload Test](#5-file-upload-test)
6. [Intercom Widget Test](#6-intercom-widget-test)
7. [Screen Resolution Test](#7-screen-resolution-test)
8. [Connection Speed Test](#8-connection-speed-test)
9. [Production Deployment](#9-production-deployment)

---

## 1. Domain Access Test

### ✅ Test Passing Scenario
**How to Test:**
- Simply run the application normally
- The test should pass automatically when the page loads

**Expected Result:**
- Status: PASS
- Message: "Domain access successful"
- Details: Shows successful connection to domain with response time

**What It Tests:**
- Basic connectivity to the application
- DNS resolution working
- No firewall blocking the domain

### ❌ Test Failing Scenario
**How to Simulate Failure:**

**Method 1: Disconnect Internet**
```bash
# On macOS, turn off Wi-Fi or disconnect Ethernet
```

**Method 2: Block Domain (Advanced)**
```bash
# Edit /etc/hosts file (requires sudo)
sudo nano /etc/hosts

# Add this line:
127.0.0.1 localhost.localdomain
```

**Method 3: Use Browser Extension**
- Install "Block Site" extension
- Block the domain pattern

**Expected Result:**
- Status: FAIL
- Blockers shown:
  - Network connectivity issues
  - Firewall or proxy blocking the domain
  - DNS resolution failure

---

## 2. Email Delivery Test

### ✅ Test Passing Scenario
**How to Test:**
1. Enter a valid, accessible email address (your own)
2. Click to send test email
3. Check your inbox/spam folder

**Expected Result:**
- Status: PASS
- Message: "Test email successfully sent"
- Details: Explains email was sent successfully
- You should receive an email

**What It Tests:**
- Email service (AWS SES) is configured correctly
- SMTP server is reachable
- Email address is valid
- No email blocks in place

### ❌ Test Failing Scenario
**Method 1: Invalid Email Format**
```
Enter: notanemail@
or: test@
or: invalid.email
```

**Method 2: Stop Email Service**
```bash
# In server/.env file, set invalid credentials:
AWS_SES_SMTP_USER=invalid
AWS_SES_SMTP_PASS=invalid
```

**Method 3: Non-existent Domain**
```
Enter: test@nonexistentdomain123456789.com
```

**Expected Result:**
- Status: FAIL
- Blockers shown:
  - Email server error
  - Invalid email address
  - Email rejected by recipient server

---

## 3. Email 2FA Timing Test

### ✅ Test Passing Scenario
**How to Test:**
1. Enter valid email (Gmail, Outlook recommended for fast delivery)
2. Send 2FA code
3. Code should arrive within 5 seconds

**Expected Result:**
- Status: PASS
- Message: "2FA email sent in X.XX seconds"
- Details: Explains delivery time is acceptable
- Delivery time < 5 seconds

**What It Tests:**
- Email delivery speed for time-sensitive codes
- SMTP server performance
- Email routing efficiency

### ❌ Test Failing Scenario
**Method 1: Add Artificial Delay (Server Code)**
```typescript
// In server/src/controllers/emailController.ts
// Add before sending email:
await new Promise(resolve => setTimeout(resolve, 6000)); // 6 second delay
```

**Method 2: Use Slow Email Service**
- Configure with a slower SMTP server
- Use email providers with slower delivery

**Expected Result:**
- Status: FAIL or WARNING
- Blockers shown:
  - Email delivery took X.XX seconds, exceeding 5s threshold
  - 2FA codes may arrive too late for practical use

---

## 4. File Download Test

### ✅ Test Passing Scenario
**How to Test:**
1. Run the test
2. Application shows list of available files
3. Click on any file to download
4. File downloads successfully

**Expected Result:**
- Status: PASS
- Message: "Download test ready"
- Details: Shows number of files available
- Metadata: Lists all downloadable files with sizes

**What It Tests:**
- Server has test files available
- Browser allows downloads
- No download blockers active
- File transfer works correctly

**Pre-existing Files Location:**
```
server/test-files/
├── sample-document.txt
├── sample-data.json
└── sample-report.txt
```

### ❌ Test Failing Scenario

**Method 1: Delete Test Files**
```bash
# In server directory:
rm -rf test-files/
```

**Method 2: Remove Read Permissions**
```bash
chmod 000 server/test-files
```

**Method 3: Block Downloads in Browser**

**Chrome:**
1. Settings → Privacy and security
2. Site Settings → Additional permissions
3. Automatic downloads → Block

**Firefox:**
1. Preferences → General → Downloads
2. Set to always ask where to save files
3. Cancel download when prompted

**Method 4: Antivirus Blocking**
- Some antivirus software blocks downloads
- Configure antivirus to block all downloads temporarily

**Expected Result:**
- Status: FAIL
- Blockers shown:
  - Server-side files not available
  - Directory permissions issue
  - Browser blocking downloads

---

## 5. File Upload Test

### ✅ Test Passing Scenario
**How to Test:**
1. Click "Choose File" button
2. Select a small file (< 10MB)
3. Choose common file type (.txt, .pdf, .jpg, .png, .json, .docx)
4. Upload the file

**Expected Result:**
- Status: PASS
- Message: "Upload test successful"
- Details: Shows file name, size, type
- No blockers

**What It Tests:**
- Browser supports file uploads
- Network allows file uploads
- Server can receive and process files
- File handling works correctly

### ⚠️ Test Warning Scenario
**How to Test:**
1. Upload a large file (> 10MB but < 50MB)
2. Or upload an uncommon file type (.exe, .zip, .dmg)

**Expected Result:**
- Status: WARNING
- Message: "Upload successful with warnings"
- Blockers shown:
  - File size exceeds recommended limit
  - File type may not be supported

### ❌ Test Failing Scenario

**Method 1: Exceed Server Limit**
```bash
# Try uploading file > 50MB (configured limit in server)
# Create large test file:
dd if=/dev/zero of=large-file.bin bs=1M count=100
# This creates 100MB file
```

**Method 2: Remove Upload Directory Permissions**
```bash
chmod 000 server/uploads/
```

**Method 3: Disconnect During Upload**
- Start uploading a large file
- Disconnect internet immediately
- Network interruption will cause failure

**Method 4: Firewall Blocking**
- Configure firewall to block POST requests
- Or block the upload endpoint specifically

**Expected Result:**
- Status: FAIL
- Blockers shown:
  - Network interruption during upload
  - Server rejected the file
  - Insufficient server storage
  - File processing error
  - Antivirus blocking upload

---

## 6. Intercom Widget Test

### ✅ Test Passing Scenario
**How to Test:**
1. Ensure Intercom script is loaded (check browser console)
2. Run the test
3. Widget should be detected

**Mock Setup (For Testing):**
```html
<!-- Add to client/public/index.html -->
<script>
  window.Intercom = function() { 
    console.log('Intercom mock loaded'); 
  };
</script>
```

**Expected Result:**
- Status: PASS
- Message: "Intercom widget loaded successfully"
- Details: Widget detected, JavaScript working properly

**What It Tests:**
- Third-party scripts can load
- JavaScript execution works
- No script blockers interfering

### ❌ Test Failing Scenario

**Method 1: Install Ad Blocker**
- Install uBlock Origin, AdBlock, or Privacy Badger
- These extensions block Intercom by default

**Method 2: Block Third-Party Cookies**

**Chrome:**
1. Settings → Privacy and security
2. Cookies and other site data
3. Select "Block third-party cookies"

**Firefox:**
1. Preferences → Privacy & Security
2. Enhanced Tracking Protection → Strict

**Method 3: Block Intercom Domain**
```bash
# Edit /etc/hosts
sudo nano /etc/hosts

# Add:
127.0.0.1 widget.intercom.io
127.0.0.1 js.intercomcdn.com
```

**Method 4: Browser Extensions**
- Install Ghostery
- Enable all tracking protection
- Intercom will be blocked

**Expected Result:**
- Status: FAIL
- Blockers shown:
  - Ad blocker or script blocker extension enabled
  - Third-party cookies disabled
  - Corporate firewall blocking Intercom domain
  - JavaScript disabled or restricted

---

## 7. Screen Resolution Test

### ✅ Test Passing Scenario
**How to Test:**
- Use screen with resolution ≥ 1024x768
- Run test normally

**Expected Result:**
- Status: PASS
- Message: "Screen resolution meets requirements"
- Details: Shows current resolution and category (High/Standard/Minimum)
- Resolution listed (e.g., 1920x1080)

**What It Tests:**
- Screen size meets minimum requirements
- UI will display properly
- No horizontal scrolling needed

### ❌ Test Failing Scenario

**Method 1: Resize Browser Window**
```
1. Open Chrome DevTools (F12)
2. Toggle Device Toolbar (Cmd+Shift+M on Mac, Ctrl+Shift+M on Windows)
3. Select "Responsive" mode
4. Set dimensions to 800x600
5. Run test
```

**Method 2: Use Mobile Device Emulation**
```
1. Chrome DevTools (F12)
2. Device Toolbar
3. Select "iPhone SE" or "Galaxy S5"
4. Run test
```

**Method 3: Change OS Display Scaling**

**Windows:**
1. Settings → Display
2. Scale and layout → 150% or higher
3. This makes effective resolution smaller

**macOS:**
1. System Preferences → Displays
2. Select "More Space" (lower resolution)

**Expected Result:**
- Status: FAIL
- Blockers shown:
  - Screen resolution XXXxYYY is below recommended minimum 1024x768
  - Some UI elements may not display correctly
  - Horizontal scrolling may be required

---

## 8. Connection Speed Test

### ✅ Test Passing Scenario
**How to Test:**
- Use good internet connection (> 5 Mbps download, > 1 Mbps upload)
- Run test normally

**Expected Result:**
- Status: PASS
- Message: "Connection speed is adequate"
- Details: Shows download/upload speeds and latency
- Quality rating (Excellent/Good/Adequate)

**What It Tests:**
- Internet connection speed
- Network latency
- Upload/download performance
- Connection stability

### ❌ Test Failing Scenario

**Method 1: Chrome DevTools Network Throttling**
```
1. Open Chrome DevTools (F12)
2. Network tab
3. Throttling dropdown (next to "Disable cache")
4. Select "Slow 3G" or "Fast 3G"
5. Run test
```

**Throttling Options:**
- Slow 3G: 0.4 Mbps download, 0.4 Mbps upload, 2000ms RTT
- Fast 3G: 1.6 Mbps download, 0.75 Mbps upload, 562ms RTT

**Method 2: Router QoS Settings**
```
1. Access router admin panel
2. Find QoS (Quality of Service) settings
3. Limit device bandwidth to 2 Mbps
4. Run test
```

**Method 3: Bandwidth Saturation**
```
1. Start downloading a large file (e.g., Linux ISO)
2. While download is running, run the speed test
3. Your available bandwidth will be consumed
```

**Method 4: VPN Connection**
```
- Connect to a free VPN service
- Free VPNs typically have slower speeds
- Run test
```

**Expected Result:**
- Status: FAIL
- Blockers shown:
  - Download speed (X.XX Mbps) is below minimum 5 Mbps
  - Upload speed (X.XX Mbps) is below minimum 1 Mbps
  - Network latency (XXXms) exceeds maximum 200ms

---

## 9. Production Deployment

### Domain Configuration for Web Hosting

When hosting on a real domain (e.g., `preonboarding.example.com`):

#### Backend Configuration

**1. Update Environment Variables** (`server/.env`):
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://preonboarding.example.com

# AWS SES Configuration
AWS_REGION=us-east-1
AWS_SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
AWS_SES_SMTP_PORT=587
AWS_SES_SMTP_USER=your-actual-smtp-username
AWS_SES_SMTP_PASS=your-actual-smtp-password
SENDER_EMAIL=notification@yourdomain.com

# CORS
CORS_ORIGIN=https://preonboarding.example.com
```

**2. Update CORS Configuration** (`server/src/middleware/corsConfig.ts`):
```typescript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://preonboarding.example.com',
  credentials: true,
  optionsSuccessStatus: 200
};
```

#### Frontend Configuration

**1. Update Environment Variables** (`client/.env`):
```env
REACT_APP_API_URL=https://preonboarding.example.com/api
REACT_APP_DOMAIN_TO_TEST=https://institutionallendingexchange.com
REACT_APP_INTERCOM_APP_ID=your-actual-intercom-app-id
```

**2. Update API Base URL** (if not using env vars):
```typescript
// client/src/services/apiService.ts
const API_URL = 'https://preonboarding.example.com/api';
```

#### SSL/HTTPS Requirements

**Required for Production:**
- ✅ HTTPS for all communications
- ✅ Valid SSL certificate
- ✅ Secure email transmission
- ✅ Browser security requirements

**Getting SSL Certificate:**
```bash
# Using Let's Encrypt (free)
sudo certbot --nginx -d preonboarding.example.com
```

#### Deployment Checklist

**Before Deployment:**
- [ ] Domain DNS configured correctly
- [ ] SSL certificate installed and valid
- [ ] Environment variables set for production
- [ ] CORS configured for production domain
- [ ] Email service credentials verified
- [ ] File directories have correct permissions
- [ ] Firewall rules allow ports 80 and 443
- [ ] Server dependencies installed (`npm install`)
- [ ] Client built for production (`npm run build`)

**Directory Permissions:**
```bash
# On server
chmod 755 test-files/
chmod 755 uploads/
chmod 644 test-files/*
```

**Start Server:**
```bash
# Build and start
cd server
npm run build
npm start

# Or using PM2 (recommended for production)
pm2 start dist/server.js --name preonboarding-api
```

**Serve Frontend:**
```bash
# Build frontend
cd client
npm run build

# The build/ directory can be served with:
# - Nginx
# - Apache
# - AWS S3 + CloudFront
# - Netlify
# - Vercel
```

#### Expected Behavior in Production

**Differences from Localhost:**

1. **HTTPS Only**: All requests use HTTPS protocol
2. **Real Email**: Actual emails sent via AWS SES
3. **CDN Assets**: Static files served via CDN (faster)
4. **Caching**: Browser caches more aggressively
5. **Performance**: Better overall performance
6. **Geographic Latency**: Users farther from server see higher latency
7. **Corporate Firewalls**: May block some tests for office users

**Same Functionality:**
- All 8 tests work identically
- Same pass/fail criteria
- Same blocker detection
- Same detailed explanations
- Same PDF report generation

#### Testing in Production

**Test from Different Environments:**

1. **Home Network**: Test with regular internet
2. **Corporate Network**: Test with corporate firewall
3. **Mobile Network**: Test with 4G/5G
4. **VPN**: Test with VPN enabled
5. **Different Browsers**: Chrome, Firefox, Safari, Edge
6. **Different Devices**: Desktop, laptop, tablet, mobile

**Monitor Common Issues:**
```bash
# Server logs
pm2 logs preonboarding-api

# Check disk space
df -h

# Check memory
free -m

# Check network
netstat -tlnp
```

#### Troubleshooting Production

**Issue: CORS Errors**
```
Solution: Verify CORS_ORIGIN in server/.env matches frontend domain exactly
Check: Browser console for specific CORS error message
```

**Issue: Email Not Sending**
```
Solution: Verify AWS SES credentials are correct
Check: AWS SES sending limits and verified email addresses
Check: Server logs for SMTP errors
```

**Issue: File Upload Fails**
```
Solution: Check uploads/ directory permissions
Check: Server disk space available
Check: Nginx/Apache upload size limits
```

**Issue: Downloads Blocked**
```
Solution: Verify test-files/ directory exists and has files
Check: File permissions (should be readable)
Check: Server logs for file access errors
```

#### Monitoring and Logging

**Recommended Tools:**
- **PM2**: Process management and monitoring
- **CloudWatch**: AWS logging and monitoring
- **Datadog**: Application performance monitoring
- **Sentry**: Error tracking and reporting

**Key Metrics to Monitor:**
- Test execution frequency
- Pass/fail rates per test
- Geographic distribution of users
- Common blockers encountered
- Email delivery success rate
- Average test completion time
- Server resource usage

---

## Summary

This testing guide provides comprehensive scenarios for validating each test in the pre-onboarding tool. By following these methods, you can:

1. **Verify Tests Work Correctly**: Simulate both passing and failing scenarios
2. **Understand Blockers**: See exactly what blockers are reported
3. **Production Ready**: Ensure the app works in real-world conditions
4. **Troubleshoot Issues**: Know how to diagnose and fix problems

**Remember:** The detailed explanations and blocker lists help users understand exactly what's preventing them from using the platform, making it easier for them to work with their IT departments to resolve issues.
