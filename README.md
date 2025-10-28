# ILex Pre-Onboarding Test Application

A comprehensive pre-onboarding web application that tests client environments for compatibility with the institutionallendingexchange.com platform.

## 🎯 Overview

This application runs 8 critical security and compatibility tests and generates a detailed PDF report for clients to address issues identified by their internal security tools.

## 🧪 Tests Implemented

1. **Domain Access Test** - Tests accessibility to all pages of institutionallendingexchange.com
2. **Email Delivery Test** - Sends test email via AWS SES to verify email delivery
3. **Email 2FA Timing Test** - Tests OTP email delivery timing (target <30 seconds)
4. **File Upload Test** - Tests single and bulk file uploads (<1GB per file)
5. **File Download Test** - Tests file download capabilities and speed
6. **Intercom Widget Test** - Verifies Intercom widget can load and render
7. **Screen Resolution Test** - Detects screen dimensions and compatibility
8. **Connection Speed Test** - Measures upload/download speeds and latency

## 🛠️ Tech Stack

### Frontend
- React 18+ with TypeScript
- Tailwind CSS for styling
- Axios for HTTP requests
- jsPDF with jsPDF-AutoTable for PDF generation
- HTML5 File API

### Backend
- Node.js 18+ with Express.js
- TypeScript
- Nodemailer for email testing with AWS SES SMTP
- Multer for file upload handling
- Express CORS middleware

### Infrastructure
- AWS Elastic Beanstalk (backend)
- AWS S3 + CloudFront (frontend)
- AWS SES (email delivery)
- No database required (stateless architecture)

## 📁 Project Structure

```
/
├── client/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── server/                # Node.js Express backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── config/        # Configuration files
│   │   ├── types/         # TypeScript types
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example           # Environment variables template
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS Account with SES configured
- AWS CLI installed and configured

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Pre-onboarding-tool
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Install frontend dependencies**
```bash
cd ../client
npm install
```

4. **Configure environment variables**

Create `.env` file in the `server` directory:
```bash
cp .env.example server/.env
```

Create `.env` file in the `client` directory:
```bash
cp .env.example client/.env
```

Edit both `.env` files with your AWS credentials and configuration.

### Local Development

1. **Start the backend server**
```bash
cd server
npm run dev
```
Backend will run on http://localhost:3005

2. **Start the frontend (in a new terminal)**
```bash
cd client
npm start
```
Frontend will run on http://localhost:3002

3. **Access the application**
Open http://localhost:3002 in your browser

## 🔧 Configuration

### Backend Environment Variables (server/.env)

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3002

# AWS SES Configuration
AWS_REGION=us-east-1
AWS_SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
AWS_SES_SMTP_PORT=587
AWS_SES_SMTP_USER=your-smtp-username
AWS_SES_SMTP_PASS=your-smtp-password
SENDER_EMAIL=notification@ilex.sg

# Application Configuration
INTERCOM_APP_ID=your-intercom-app-id
MAX_FILE_SIZE=1073741824
CORS_ORIGIN=http://localhost:3002
```

### Frontend Environment Variables (client/.env)

```env
REACT_APP_API_URL=http://localhost:3005/api
REACT_APP_DOMAIN_TO_TEST=https://institutionallendingexchange.com
REACT_APP_INTERCOM_APP_ID=your-intercom-app-id
```

## 📦 Building for Production

### Frontend Build

```bash
cd client
npm run build
```

This creates an optimized production build in the `client/build` directory.

### Backend Build

```bash
cd server
npm run build
```

This compiles TypeScript to JavaScript in the `server/dist` directory.

## 🚢 AWS Deployment

### Frontend Deployment (S3 + CloudFront)

1. **Create S3 bucket**
```bash
aws s3 mb s3://ilex-preonboarding-frontend
```

2. **Build and deploy frontend**
```bash
cd client
npm run build
aws s3 sync build/ s3://ilex-preonboarding-frontend --delete
```

3. **Create CloudFront distribution**
- Origin: Your S3 bucket
- Enable HTTPS
- Set custom domain (optional)
- Configure SSL certificate

4. **Update frontend .env**
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### Backend Deployment (Elastic Beanstalk)

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize Elastic Beanstalk**
```bash
cd server
eb init -p node.js-18 ilex-preonboarding-backend --region us-east-1
```

3. **Create environment**
```bash
eb create production
```

4. **Configure environment variables in EB Console**
- Go to AWS Console → Elastic Beanstalk → Your application → Configuration
- Add all environment variables from `.env`

5. **Deploy updates**
```bash
eb deploy
```

### AWS SES Configuration

1. **Verify sender email**
```bash
aws ses verify-email-identity --email-address notification@ilex.sg --region us-east-1
```

2. **Move out of sandbox** (for production)
- Request production access in AWS SES console
- This allows sending to any email address

3. **Generate SMTP credentials**
- AWS Console → SES → SMTP Settings → Create SMTP Credentials
- Save username and password for `.env`

4. **Configure DNS records**
- Add SPF record: `v=spf1 include:amazonses.com ~all`
- Add DKIM records (provided by AWS SES)

## 🧪 Testing

### Local Testing

1. **Run backend tests**
```bash
cd server
npm test
```

2. **Run frontend tests**
```bash
cd client
npm test
```

3. **Manual testing checklist**
- [ ] All 8 tests execute successfully
- [ ] PDF report generates correctly
- [ ] Email delivery works
- [ ] File upload/download functions
- [ ] Intercom widget detects properly
- [ ] Works on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive design works

### Production Testing

1. **Test from different networks**
- Corporate network
- Home network
- VPN connection
- Mobile network

2. **Test with security tools**
- Ad blockers enabled
- Content security policies
- Firewall restrictions

3. **Load testing**
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 50 https://your-backend-url.com/api/health
```

## 🔒 Security Considerations

- All communications over HTTPS
- CORS properly configured
- File upload validation (size, type)
- Rate limiting on endpoints
- No persistent storage of sensitive data
- Environment variables for secrets
- Input validation and sanitization

## 📊 Monitoring

- AWS CloudWatch for logs and metrics
- Track test completion rates
- Monitor email delivery success
- Alert on high failure rates

## 🐛 Troubleshooting

### Email not sending
- Verify AWS SES credentials
- Check if domain is verified in SES
- Ensure SES is out of sandbox mode
- Check CloudWatch logs for errors

### CORS errors
- Verify CORS_ORIGIN in backend .env
- Check frontend API_URL configuration
- Ensure preflight requests are handled

### File upload failures
- Check MAX_FILE_SIZE setting
- Verify Multer configuration
- Check disk space on server
- Review CloudWatch logs

### Intercom widget not loading
- Verify INTERCOM_APP_ID is correct
- Check browser console for CSP errors
- Test if Intercom domain is blocked

## 📝 License

Proprietary - Institutional Lending Exchange

## 👥 Support

For issues or questions, contact: support@ilex.sg

## 🔄 Version History

- **v1.0.0** - Initial release with 8 core tests and PDF generation
