# Troubleshooting Guide

Common issues and their solutions for the ILex Pre-Onboarding Test Application.

## Installation Issues

### npm install fails

**Error: `EACCES: permission denied`**

**Solution:**
```bash
# macOS/Linux
sudo npm install -g npm
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**Error: `Cannot find module 'xyz'`**

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or for entire project
rm -rf client/node_modules client/package-lock.json
rm -rf server/node_modules server/package-lock.json
npm run install:all
```

---

## Server Issues

### Server won't start

**Error: `Port 3001 already in use`**

**Solution:**
```bash
# Find and kill process on port 3001
# macOS/Linux
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change port in server/.env
PORT=3002
```

**Error: `Cannot find module 'dotenv'`**

**Solution:**
```bash
cd server
npm install
```

**Error: `Email transporter not initialized`**

**Solution:**
This is expected if AWS SES is not configured. Email tests will fail gracefully. To fix:
1. Set up AWS SES account
2. Add credentials to `server/.env`
3. Restart server

### Server crashes during file upload

**Error: `ENOMEM` or memory issues**

**Solution:**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 src/server.ts

# Or in package.json
"scripts": {
  "dev": "node --max-old-space-size=4096 --require ts-node/register src/server.ts"
}
```

**Error: File size limit exceeded**

**Solution:**
Check `MAX_FILE_SIZE` in server/.env (default 1GB):
```env
MAX_FILE_SIZE=1073741824
```

---

## Client Issues

### Frontend won't start

**Error: `Port 3000 already in use`**

**Solution:**
```bash
# Choose 'Y' when prompted to use different port
# Or kill process
lsof -ti:3000 | xargs kill -9
```

**Error: `Module not found: Can't resolve 'react'`**

**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

**Blank page after npm start**

**Solution:**
1. Check browser console (F12) for errors
2. Ensure backend is running
3. Check `REACT_APP_API_URL` in client/.env
4. Clear browser cache and reload

### TypeScript errors

**Error: `Cannot find module 'react' or its corresponding type declarations`**

**Solution:**
These errors appear in VS Code before dependencies are installed. Run:
```bash
npm run install:all
```

After installation, TypeScript errors should disappear. If not:
```bash
cd client
npm install --save-dev @types/react @types/react-dom @types/node
```

---

## Test Execution Issues

### Domain Access Test fails

**Error: All pages showing as failed**

**Possible Causes:**
1. Behind corporate firewall (expected)
2. No internet connection
3. DNS issues

**Solution:**
- Check internet connectivity
- Try accessing https://institutionallendingexchange.com manually
- Expected to fail behind some corporate firewalls

### Email Delivery Test fails

**Error: `Email transporter not initialized`**

**Solution:**
AWS SES not configured. Either:
1. Skip email tests for now (other tests will continue)
2. Configure AWS SES:
   ```bash
   # In server/.env, add:
   AWS_SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   AWS_SES_SMTP_PORT=587
   AWS_SES_SMTP_USER=your-smtp-username
   AWS_SES_SMTP_PASS=your-smtp-password
   SENDER_EMAIL=notification@ilex.sg
   ```

**Error: `MessageRejected: Email address is not verified`**

**Solution:**
AWS SES is in sandbox mode:
1. Go to AWS SES Console
2. Verify your email address
3. Or request production access

**Error: Email not received**

**Solution:**
1. Check spam folder
2. Verify email address is correct
3. Check AWS SES sending limits
4. Review CloudWatch logs for SES errors

### File Upload Test fails

**Error: `Failed to process file upload`**

**Solution:**
1. Check file size < 1GB
2. Check backend is running
3. Check network connection
4. Review server logs

**Error: Upload speed very slow**

**Solution:**
- Expected on slow connections
- Test will show WARNING with recommendations
- Try smaller files for testing

### File Download Test fails

**Error: `Failed to generate download file`**

**Solution:**
1. Check backend has enough memory
2. Try smaller file size in test
3. Check disk space on server

### Intercom Widget Test fails

**Error: `Script blocked`**

**Possible Causes:**
1. Ad blocker enabled (expected)
2. Content security policy
3. Corporate firewall

**Solution:**
- Disable ad blockers (uBlock, AdBlock, etc.)
- Try incognito mode
- Check browser console for CSP errors
- Expected to fail in some corporate environments

### Connection Speed Test slow or fails

**Error: Timeout or very slow**

**Solution:**
- Check internet connection
- Close bandwidth-heavy applications
- Try different time of day
- Slow connection is detected and reported

---

## CORS Issues

### Frontend can't connect to backend

**Error: `Access to fetch at 'http://localhost:3005' has been blocked by CORS policy`**

**Solution:**
1. Check `CORS_ORIGIN` in server/.env matches frontend URL:
   ```env
   CORS_ORIGIN=http://localhost:3002
   ```
2. Restart backend server
3. Clear browser cache
4. Check backend console for CORS middleware logs

**Error: CORS in production**

**Solution:**
Update server/.env:
```env
CORS_ORIGIN=https://your-cloudfront-domain.com
```

---

## PDF Generation Issues

### PDF download fails

**Error: Nothing happens when clicking "Download PDF"**

**Solution:**
1. Check browser console for errors
2. Allow pop-ups for localhost
3. Try different browser
4. Check if jsPDF loaded:
   ```javascript
   console.log(typeof jsPDF); // Should not be 'undefined'
   ```

**Error: PDF is blank or corrupted**

**Solution:**
1. Check test results exist
2. Review browser console for jsPDF errors
3. Ensure all test data is properly formatted

**Error: PDF generation is slow**

**Solution:**
- Expected for large result sets
- Consider reducing details in PDF
- Modern browsers should handle well

---

## Network Issues

### All tests timing out

**Possible Causes:**
1. No internet connection
2. Backend not running
3. Firewall blocking requests

**Solution:**
1. Check internet connectivity
2. Verify backend at http://localhost:3005/api/health
3. Check firewall settings
4. Try disabling VPN temporarily

### Slow test execution

**Possible Causes:**
1. Slow internet connection (expected)
2. Backend overloaded
3. Large file tests

**Solution:**
- Expected on slow connections
- Tests will report speed issues
- Consider running tests during off-peak hours

---

## Browser-Specific Issues

### Safari issues

**Problem: Tests not working in Safari**

**Solution:**
1. Enable Developer menu: Safari > Preferences > Advanced
2. Check console for errors
3. Allow cross-origin requests
4. Clear cache and cookies

### Firefox issues

**Problem: File upload not working**

**Solution:**
1. Check Content Security Policy in console
2. Allow all permissions when prompted
3. Disable strict tracking protection for localhost

### Chrome issues

**Problem: Mixed content warnings**

**Solution:**
In production, ensure both frontend and backend use HTTPS.

---

## Production/Deployment Issues

### Elastic Beanstalk deployment fails

**Error: `Application version failed to deploy`**

**Solution:**
1. Check eb logs: `eb logs`
2. Verify all environment variables are set
3. Check Node.js version: `eb platform show`
4. Ensure build succeeds: `npm run build`

**Error: Health check failing**

**Solution:**
1. Ensure app listens on port from `process.env.PORT`
2. Check health endpoint: `/api/health`
3. Review EB health dashboard

### S3/CloudFront deployment issues

**Error: 403 Forbidden on CloudFront**

**Solution:**
1. Check S3 bucket policy allows public read
2. Verify CloudFront origin settings
3. Check CloudFront behaviors

**Error: Old version showing after deployment**

**Solution:**
```bash
# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Email not working in production

**Error: `Email address not verified`**

**Solution:**
1. Move AWS SES out of sandbox mode
2. Request production access in SES console
3. Verify sender domain/email

---

## Performance Issues

### High memory usage

**Solution:**
1. Increase EC2 instance size
2. Implement file streaming (already done)
3. Monitor with CloudWatch
4. Set Node.js memory limit

### Slow response times

**Solution:**
1. Check backend logs for slow queries/operations
2. Enable CloudFront caching for frontend
3. Consider CDN for static assets
4. Monitor with AWS X-Ray

---

## Database/State Issues

### Tests showing old results

**Solution:**
Application is stateless by design. Refresh page to clear state.

### Verification codes not working

**Possible Causes:**
1. Code expired (5 minute timeout)
2. Wrong code entered
3. Email delay

**Solution:**
1. Request new code
2. Check email carefully (may look similar: 0 vs O)
3. Wait a few more seconds for email

---

## Security Issues

### Rate limiting triggered

**Error: `Too many requests from this IP`**

**Solution:**
Wait 15 minutes, then try again. If testing, temporarily disable in `server/src/server.ts`:
```typescript
// Comment out for testing
// app.use('/api/', limiter);
```

### SSL certificate errors

**Error: `NET::ERR_CERT_AUTHORITY_INVALID`**

**Solution:**
1. In development: Add exception
2. In production: Ensure valid SSL from ACM
3. Check certificate expiry date

---

## Data/Results Issues

### Test results seem incorrect

**Solution:**
1. Check test implementation in `testService.ts`
2. Verify API responses in Network tab
3. Check backend logs for processing errors
4. Try test manually to verify

### PDF missing data

**Solution:**
1. Ensure all tests completed
2. Check `testResults` array has data
3. Review console for PDF generation errors
4. Try downloading again

---

## Quick Diagnostics

Run these checks when troubleshooting:

```bash
# 1. Check if backend is running
curl http://localhost:3005/api/health

# 2. Check if frontend is accessible
curl http://localhost:3002

# 3. Check Node.js version
node --version  # Should be 18+

# 4. Check npm version
npm --version

# 5. Check TypeScript compilation
cd server && npx tsc --noEmit
cd client && npx tsc --noEmit

# 6. Check for port conflicts
lsof -i :3000
lsof -i :3001

# 7. Check environment variables
cd server && cat .env
cd client && cat .env
```

---

## Getting Help

If none of these solutions work:

1. **Check Logs:**
   ```bash
   # Backend logs
   cd server && npm run dev
   
   # Browser console
   F12 → Console tab
   ```

2. **Provide Information:**
   - Operating system and version
   - Node.js version: `node --version`
   - Browser and version
   - Complete error message
   - Steps to reproduce
   - Screenshots if helpful

3. **Contact:**
   - Email: support@ilex.sg
   - Include logs and error messages

---

## Preventive Measures

### Before Starting Development
- [ ] Node.js 18+ installed
- [ ] npm up to date
- [ ] Git installed
- [ ] Code editor ready (VS Code recommended)

### Before Running Tests
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Backend server running
- [ ] Internet connection working
- [ ] Ports 3000 and 3001 available

### Before Deploying
- [ ] All tests pass locally
- [ ] Environment variables set in AWS
- [ ] AWS SES verified and in production mode
- [ ] SSL certificates configured
- [ ] DNS records updated
- [ ] Monitoring enabled

---

**Still stuck?** Review the main [README.md](./README.md) or contact support@ilex.sg
