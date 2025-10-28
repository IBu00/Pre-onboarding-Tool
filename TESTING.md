# Testing Guide for ILex Pre-Onboarding Application

## Overview

This guide covers all testing scenarios for the pre-onboarding application, from local development to production deployment.

---

## Phase 1: Local Development Testing

### Prerequisites

- Node.js 18+ installed
- Backend and frontend running locally
- Test email account accessible

### Setup

```bash
# Install all dependencies
npm run install:all

# Start backend
cd server
cp .env.example .env
# Edit .env with your AWS SES credentials
npm run dev

# In a new terminal, start frontend
cd client
cp .env.example .env
# Edit .env with backend URL
npm start
```

### Test Checklist

#### 1. Domain Access Test

**Expected Result:** PASS (or WARNING if behind firewall)

- [ ] Test initiates and shows "Running" status
- [ ] At least 1 page is accessible
- [ ] Results show list of tested pages
- [ ] CORS issues are detected if present
- [ ] Test completes within 1 minute

**Common Issues:**
- Corporate firewall blocking access → Expected, will show in recommendations
- DNS issues → Check internet connection

#### 2. Email Delivery Test

**Expected Result:** PASS

- [ ] Email input field appears
- [ ] Email is sent successfully
- [ ] Verification code received in inbox
- [ ] Code entry field appears
- [ ] Entering correct code marks test as PASS
- [ ] Delivery time is calculated

**Test Cases:**
- Valid corporate email → Should PASS
- Invalid email format → Should show validation error
- Incorrect code → Should show error
- Timeout (5 min) → Should FAIL with timeout message

**Common Issues:**
- Email not received → Check spam folder
- "Email transporter not initialized" → AWS SES not configured
- Slow delivery (>60s) → Check SES configuration

#### 3. Email 2FA Timing Test

**Expected Result:** PASS (<30s), WARNING (30-60s), FAIL (>60s)

- [ ] 2FA code sent automatically after email test
- [ ] Code received in inbox
- [ ] Code input field appears
- [ ] Correct code validates successfully
- [ ] Timing is measured and displayed
- [ ] Status reflects timing (PASS/WARNING/FAIL)

**Test Cases:**
- Code received <30s → PASS
- Code received 30-60s → WARNING
- Code received >60s → FAIL
- Code not received → FAIL after timeout

#### 4. File Upload Test

**Expected Result:** PASS

- [ ] Test uploads files successfully
- [ ] Single file upload works
- [ ] Multiple files upload works
- [ ] Upload speed is calculated
- [ ] File metadata is displayed
- [ ] Large files (up to 1GB) are supported

**Test Cases:**
- 1MB file → Should PASS quickly
- 10MB file → Should PASS
- 100MB file → Should PASS (may take time)
- Multiple files → Should PASS with aggregate stats
- File size >1GB → Should FAIL with error

**Manual Test (Optional):**
You can modify the code to allow file selection:
- Add file input in TestRunner
- Test various file types: PDF, DOCX, XLSX, PNG, JPG, ZIP

#### 5. File Download Test

**Expected Result:** PASS

- [ ] File download initiates
- [ ] Download completes successfully
- [ ] Download speed is calculated
- [ ] File size is displayed
- [ ] Speed is reasonable (>1 Mbps)

**Test Cases:**
- 10MB download → Should PASS
- 100MB download → Should PASS
- Slow connection → WARNING with recommendations

#### 6. Intercom Widget Test

**Expected Result:** PASS (or FAIL if blocked)

- [ ] Intercom script loads
- [ ] Widget detection works
- [ ] Script blocking is detected if present
- [ ] Timeout after 15s if blocked

**Test Cases:**
- No ad blocker → Should PASS
- Ad blocker enabled → Should FAIL with recommendation
- Content blocker → Should FAIL with recommendation

**Manual Test:**
- Enable uBlock Origin or AdBlock
- Run test → Should detect blocking

#### 7. Screen Resolution Test

**Expected Result:** PASS (if ≥1280×720)

- [ ] Screen dimensions detected
- [ ] Device pixel ratio calculated
- [ ] Viewport size measured
- [ ] Minimum resolution check passes
- [ ] Recommendations for low resolution

**Test Cases:**
- Desktop (1920×1080) → PASS
- Laptop (1366×768) → PASS
- Small screen (<1280×720) → WARNING
- Mobile device → May show WARNING

**Manual Test:**
- Resize browser window to small size
- Run test → Should detect and warn

#### 8. Connection Speed Test

**Expected Result:** PASS (>10 Mbps)

- [ ] Download speed test runs
- [ ] Upload speed test runs
- [ ] Latency (ping) measured
- [ ] Classification assigned (Excellent/Good/Fair/Poor)
- [ ] Recommendations for slow connections

**Test Cases:**
- Fast connection (>25 Mbps) → Excellent, PASS
- Medium connection (10-25 Mbps) → Good, PASS
- Slow connection (5-10 Mbps) → Fair, WARNING
- Very slow (<5 Mbps) → Poor, FAIL

**Manual Test:**
- Throttle network in Chrome DevTools:
  - F12 → Network tab → Throttling dropdown
  - Select "Fast 3G" or "Slow 3G"
  - Run test → Should classify appropriately

---

## Phase 2: PDF Report Testing

### Test Checklist

- [ ] "Download PDF Report" button appears
- [ ] PDF downloads successfully
- [ ] PDF opens without errors
- [ ] All test results are included
- [ ] Summary section is accurate
- [ ] Pass/Warning/Fail counts correct
- [ ] Overall status is correct
- [ ] Details for each test are present
- [ ] Recommendations are listed
- [ ] Formatting is clean and professional
- [ ] Multiple pages work correctly
- [ ] Footer with page numbers present

### Test Cases

**All Tests Pass:**
- [ ] Overall status: "ALL PASSED" (green)
- [ ] No critical issues section
- [ ] Success message present

**Some Tests Fail:**
- [ ] Overall status: "NEEDS ATTENTION" (red)
- [ ] Critical issues listed with recommendations
- [ ] Contact support section appears

**Some Tests Warn:**
- [ ] Overall status: "PASSED WITH WARNINGS" (yellow)
- [ ] Warnings section with recommendations

---

## Phase 3: User Experience Testing

### Navigation Flow

1. **Landing Page**
   - [ ] Clear value proposition
   - [ ] Professional design
   - [ ] "Start Test" button prominent
   - [ ] Responsive on mobile

2. **Email Input**
   - [ ] Email validation works
   - [ ] Back button returns to landing
   - [ ] Begin button disabled until valid email

3. **Test Execution**
   - [ ] Progress bar updates correctly
   - [ ] Current test is highlighted
   - [ ] Status updates in real-time
   - [ ] Email/2FA input appears when needed
   - [ ] No crashes during execution

4. **Results Display**
   - [ ] Summary stats displayed clearly
   - [ ] Individual test results expandable
   - [ ] Color coding correct (green/yellow/red)
   - [ ] PDF download button works
   - [ ] "Start New Test" button works

### Error Handling

- [ ] Network errors are caught and displayed
- [ ] Timeout errors are handled gracefully
- [ ] Invalid input shows appropriate messages
- [ ] Backend errors don't crash frontend
- [ ] CORS errors are detected and reported

### Accessibility

- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Color contrast is sufficient
- [ ] Screen reader friendly (test with NVDA/VoiceOver)

---

## Phase 4: Cross-Browser Testing

### Desktop Browsers

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 90+ | [ ] | Primary target |
| Firefox | 88+ | [ ] | |
| Edge | 90+ | [ ] | Chromium-based |
| Safari | 14+ | [ ] | macOS only |

**Test in each browser:**
- [ ] All 8 tests run successfully
- [ ] PDF downloads correctly
- [ ] No console errors
- [ ] Styling is consistent
- [ ] Email/file inputs work

### Mobile Browsers

| Device | Browser | Status | Notes |
|--------|---------|--------|-------|
| iPhone | Safari | [ ] | iOS 14+ |
| Android | Chrome | [ ] | Android 10+ |

**Mobile-specific tests:**
- [ ] Responsive layout works
- [ ] Touch interactions work
- [ ] File inputs accessible
- [ ] PDF downloads work
- [ ] Virtual keyboard doesn't break layout

---

## Phase 5: Network Condition Testing

### Test Scenarios

1. **Fast Connection (100+ Mbps)**
   - Expected: All PASS, Excellent classification
   - [ ] Tests complete quickly (<2 min total)
   - [ ] Speed test shows >25 Mbps

2. **Normal Connection (10-25 Mbps)**
   - Expected: All PASS, Good classification
   - [ ] Tests complete in 3-5 min
   - [ ] Speed test shows 10-25 Mbps

3. **Slow Connection (1-5 Mbps)**
   - Expected: Some WARNING/FAIL
   - [ ] Tests may timeout
   - [ ] Speed test shows Fair/Poor
   - [ ] Recommendations provided

4. **VPN Connection**
   - Expected: Varies
   - [ ] Domain access may fail
   - [ ] Latency may be high
   - [ ] Speed may be reduced

5. **Corporate Firewall**
   - Expected: Some FAIL
   - [ ] Domain access may fail
   - [ ] Intercom likely blocked
   - [ ] Appropriate recommendations shown

### Chrome DevTools Throttling

Use Chrome DevTools to simulate:
- [ ] Fast 3G (1.6 Mbps down, 750 Kbps up)
- [ ] Slow 3G (500 Kbps down, 500 Kbps up)
- [ ] Offline (should show errors)

---

## Phase 6: Security Testing

### Input Validation

- [ ] Email format validated
- [ ] SQL injection attempts rejected (if any DB)
- [ ] XSS attempts sanitized
- [ ] File upload size limited
- [ ] File type validation (if implemented)

### CORS Testing

```bash
# Test CORS from different origin
curl -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  http://localhost:3005/api/test/email
```

Expected: Proper CORS headers or rejection

### Rate Limiting

```bash
# Send 100+ requests rapidly
for i in {1..110}; do
  curl -X POST http://localhost:3005/api/test/email \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
done
```

Expected: Rate limit error after 100 requests

---

## Phase 7: Load Testing

### Tools

- Artillery: `npm install -g artillery`
- Apache Bench: Pre-installed on macOS/Linux
- k6: Modern load testing tool

### Basic Load Test

```bash
# Artillery test
artillery quick --count 10 --num 50 http://localhost:3005/api/health

# Apache Bench
ab -n 1000 -c 10 http://localhost:3005/api/health
```

**Expected Results:**
- [ ] No errors under normal load (10 concurrent users)
- [ ] Response time <500ms for simple endpoints
- [ ] No memory leaks after 1000 requests

### Stress Test

```bash
# Gradually increase load
artillery quick --count 50 --num 100 http://localhost:3005/api/health
```

**Monitor:**
- CPU usage
- Memory usage
- Response times
- Error rate

---

## Phase 8: Production Testing

### Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] AWS SES in production mode
- [ ] SSL certificates valid
- [ ] DNS records configured
- [ ] Monitoring enabled
- [ ] Backup plan ready

### Post-Deployment Tests

1. **Smoke Test**
   - [ ] Application loads
   - [ ] Backend responds
   - [ ] No JavaScript errors

2. **Full Test Run**
   - [ ] Run all 8 tests from production URL
   - [ ] All tests complete successfully
   - [ ] PDF downloads correctly
   - [ ] Email delivery works

3. **From Different Networks**
   - [ ] Test from office network
   - [ ] Test from home network
   - [ ] Test from mobile network
   - [ ] Test from different geographic location (VPN)

4. **Monitor Logs**
   ```bash
   # Backend logs
   eb logs --stream
   
   # CloudWatch metrics
   # Check in AWS Console
   ```

### User Acceptance Testing

**Pilot Group:**
- Select 3-5 internal users
- Ask them to run complete test
- Collect feedback on:
  - [ ] Clarity of instructions
  - [ ] Ease of use
  - [ ] Results usefulness
  - [ ] PDF report quality
  - [ ] Any bugs or issues

---

## Automated Testing (Future Enhancement)

### Backend Unit Tests

```typescript
// Example with Jest
describe('Email Controller', () => {
  test('should send email with valid address', async () => {
    const result = await sendTestEmail('test@example.com');
    expect(result.success).toBe(true);
  });
});
```

### Frontend Component Tests

```typescript
// Example with React Testing Library
describe('TestCard', () => {
  test('renders test name', () => {
    render(<TestCard testName="Domain Test" status="PASS" />);
    expect(screen.getByText('Domain Test')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
// Example with Playwright
test('complete test flow', async ({ page }) => {
  await page.goto('http://localhost:3002');
  await page.click('text=Start Test');
  await page.fill('input[type=email]', 'test@example.com');
  await page.click('text=Begin Tests');
  // Wait for completion
  await page.waitForSelector('text=Download PDF Report');
});
```

---

## Bug Reporting Template

When reporting issues, include:

```
**Issue Title:** Brief description

**Environment:**
- Browser: Chrome 120
- OS: macOS Sonoma
- Network: Corporate WiFi

**Steps to Reproduce:**
1. Go to landing page
2. Click "Start Test"
3. Enter email: test@example.com
4. Observe error

**Expected Behavior:**
Email should be sent successfully

**Actual Behavior:**
Error message: "Email transporter not initialized"

**Screenshots:**
[Attach screenshot]

**Console Errors:**
[Paste console output]

**Additional Context:**
Testing locally with dev environment
```

---

## Success Criteria

The application is production-ready when:

- [ ] All 8 tests execute reliably
- [ ] 95%+ success rate in diverse environments
- [ ] PDF generation works consistently
- [ ] Email delivery <60s in 90%+ cases
- [ ] Works on 95%+ of corporate networks
- [ ] Mobile responsive and functional
- [ ] Zero critical bugs
- [ ] Clear, actionable recommendations
- [ ] Positive UAT feedback
- [ ] Performance meets targets (<10 min total)
