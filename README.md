# ILex Pre-Onboarding Test Application

A comprehensive pre-onboarding compatibility testing application for the Institutional Lending Exchange (ILex) platform.

## 🎯 Overview

This application tests client environments for compatibility with the ILex platform by running 8 critical security and connectivity tests. Upon completion, users receive a detailed analysis and can proceed to the platform if all tests pass.

## 🧪 Tests Performed

1. **Domain Access Test** - Verifies accessibility to ILex platform
2. **Email Delivery Test** - Confirms email can be delivered
3. **Email 2FA Timing Test** - Measures 2FA code delivery speed (target < 5 seconds)
4. **File Download Test** - Tests file download capabilities with real documents
5. **File Upload Test** - Validates file upload functionality
6. **Intercom Widget Test** - Checks Intercom support widget compatibility
7. **Screen Resolution Test** - Detects screen dimensions
8. **Connection Speed Test** - Measures network performance

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS
- jsPDF for report generation

**Backend:**
- Netlify Functions (serverless)
- Nodemailer for email testing

**Deployment:**
- Netlify (frontend + serverless functions)
- GitHub for version control

## 📁 Project Structure

```
/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript definitions
│   └── public/            # Static assets
├── netlify/
│   ├── functions/         # Serverless backend functions
│   └── test-files/        # Files for download test
├── VDR Test Files/        # Original test files
└── netlify.toml          # Netlify configuration
```

## 🚀 Deployment

This application is deployed on Netlify at:
**https://ilex-test-pre-onboarding-tool.netlify.app/**

### Environment Variables Required

Set these in Netlify dashboard:

```
EMAIL_USER=mohammedibrahimah97@gmail.com
EMAIL_PASSWORD=<Gmail App Password>
```

## 📝 Configuration

**Intercom Integration:**
- App ID: `qopg0dcc`
- Configured in `client/public/index.html`

**Email Service:**
- Gmail SMTP via Nodemailer
- Sender: mohammedibrahimah97@gmail.com

## 🔧 Local Development

```bash
# Install dependencies
npm install
cd client && npm install --legacy-peer-deps

# Run client locally
cd client
npm start

# Build for production
npm run build
```

## 📊 Features

- ✅ Real-time test execution with progress tracking
- ✅ Email verification with 6-digit codes
- ✅ Precise 2FA timing measurement
- ✅ Actual file download/upload testing
- ✅ PDF report generation
- ✅ Automatic redirect to ILex platform on success
- ✅ Mobile-responsive design
- ✅ Comprehensive error handling

## 📄 License

Proprietary - Institutional Lending Exchange

---

**Live Application:** https://ilex-test-pre-onboarding-tool.netlify.app/  
**Repository:** https://github.com/IBu00/Pre-onboarding-Tool
