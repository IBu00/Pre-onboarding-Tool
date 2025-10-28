# iLex Pre-Onboarding System Test

A comprehensive system compatibility testing application for the Institutional Lending Exchange (iLex) platform.

## Overview

This application tests client environments for compatibility with the iLex platform by running 7 critical security and connectivity tests. Upon completion, users receive a detailed analysis and can proceed to the platform if all tests pass.

## Tests Performed

1. **Domain Access Test** - Verifies accessibility to iLex platform
2. **Email Delivery & 2FA Test** - Confirms email delivery and measures 2FA code delivery timing
3. **File Download Test** - Tests file download capabilities with VDR test files (ZIP archive)
4. **File Upload Test** - Validates file upload functionality
5. **Intercom Widget Test** - Checks Intercom support widget compatibility
6. **Screen Resolution Test** - Validates screen dimensions meet minimum requirements
7. **Connection Speed Test** - Measures network latency and performance

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS
- jsPDF with autoTable for PDF report generation

**Backend:**
- Netlify Functions (serverless)
- Nodemailer for email testing
- Archiver for ZIP file creation

**Deployment:**
- Netlify (frontend + serverless functions)
- GitHub for version control

## Project Structure

```
/
├── client/                     # React frontend application
│   ├── src/
│   │   ├── components/        # UI components (TestRunner, TestCard, ResultsDisplay, ProgressBar)
│   │   ├── services/          # API and test services
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions (PDF generator)
│   │   └── config/            # Test configuration
│   └── public/                # Static assets and HTML template
├── netlify/
│   └── functions/             # Serverless backend functions
│       ├── send-2fa.js        # Email and 2FA code sending
│       ├── file-upload.js     # File upload handling
│       └── file-download/     # File download with VDR test files
│           ├── file-download.js
│           └── test-files/    # 21 VDR test files (~800KB)
└── netlify.toml               # Netlify deployment configuration
```

## Deployment

This application is deployed on Netlify at:
**https://ilex-test-pre-onboarding-tool.netlify.app/**

### Environment Variables Required

Set these in Netlify dashboard:

```
EMAIL_USER=mohammedibrahimah97@gmail.com
EMAIL_PASSWORD=<Gmail App Password>
NODE_VERSION=18
```

## Configuration

**Intercom Integration:**
- App ID: `qopg0dcc`
- Configured in `client/public/index.html`
- API Base: https://api-iam.intercom.io

**Email Service:**
- Gmail SMTP via Nodemailer
- Sender: mohammedibrahimah97@gmail.com
- 6-digit verification codes with 5-minute expiration

**File Download:**
- ZIP archive with 21 VDR test files
- Total size: ~800KB compressed
- Binary response handling for Lambda 6MB payload limit

**Connection Speed Test:**
- Optimized for international latency (Singapore to US)
- PASS threshold: <500ms latency
- WARNING threshold: <1000ms latency

## Local Development

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install --legacy-peer-deps

# Install Netlify functions dependencies
cd ../netlify && npm install
cd functions && npm install

# Run client locally
cd ../../client
npm start

# Build for production
npm run build
```

## Features

- Real-time test execution with progress tracking
- Email verification with 6-digit codes and timing measurement
- ZIP file download with actual VDR test files
- File upload testing with size validation
- PDF report generation with detailed test results
- Automatic scroll-to-top on test completion
- Conditional "Proceed to iLex" button (shows only when no failures)
- Professional dark navy UI (#001E34)
- Mobile-responsive design
- Comprehensive error handling and recommendations

## Design

**Color Scheme:**
- Primary: #001E34 (Dark Navy)
- Accent: #00a86b (Green for success actions)
- Clean white cards on dark background
- Professional corporate styling

**User Experience:**
- Clean, professional interface
- No emojis or AI-generated styling
- Clear status indicators (Passed, Failed, Warning, Running, Pending)
- Static glow effect on "Proceed to iLex →" button
- Smooth transitions and animations

## Recent Updates

**Version 2.0 (October 2025)**
- Redesigned UI to professional corporate style
- Changed primary color to dark navy (#001E34)
- Removed all emojis for professional appearance
- Implemented ZIP download for VDR test files
- Added scroll-to-top on test completion
- Added arrow indicator to "Proceed to iLex" button
- Optimized for international latency testing
- Fixed Lambda payload size constraints
- Improved button layout and visual hierarchy

## License

Proprietary - Institutional Lending Exchange

---

**Live Application:** https://ilex-test-pre-onboarding-tool.netlify.app/  
**Repository:** https://github.com/IBu00/Pre-onboarding-Tool
