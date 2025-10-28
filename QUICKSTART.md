# Quick Start Guide

Get the ILex Pre-Onboarding Test Application running in 5 minutes!

## Prerequisites

- Node.js 18+ installed ([download](https://nodejs.org/))
- A code editor (VS Code recommended)
- Terminal/Command Line access

## Step 1: Install Dependencies

```bash
# Navigate to project directory
cd "Pre-onboarding tool"

# Install all dependencies (this may take 2-3 minutes)
npm run install:all
```

## Step 2: Configure Backend

```bash
# Go to server directory
cd server

# Copy environment template
cp .env.example .env

# Open .env in your editor and configure:
# - For QUICK TEST: You can skip email configuration (tests will run in mock mode)
# - For FULL TEST: Add your AWS SES SMTP credentials
```

**Minimal .env for Quick Test:**
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3002
CORS_ORIGIN=http://localhost:3002
SENDER_EMAIL=notification@ilex.sg
INTERCOM_APP_ID=your-intercom-app-id
MAX_FILE_SIZE=1073741824
```

## Step 3: Configure Frontend

```bash
# Go to client directory (from project root)
cd client

# Copy environment template
cp .env.example .env

# The defaults should work for local testing
```

**Default client/.env:**
```env
REACT_APP_API_URL=http://localhost:3005/api
REACT_APP_DOMAIN_TO_TEST=https://institutionallendingexchange.com
REACT_APP_INTERCOM_APP_ID=your-intercom-app-id
```

## Step 4: Start Backend Server

```bash
# From server directory
npm run dev
```

You should see:
```
🚀 Server is running on port 3001
📧 Environment: development
🌐 CORS Origin: http://localhost:3002
```

**Keep this terminal running!**

## Step 5: Start Frontend (New Terminal)

Open a NEW terminal window:

```bash
# Navigate to project directory
cd "Pre-onboarding tool"

# Go to client directory
cd client

# Start development server
npm start
```

Your browser should automatically open to `http://localhost:3002`

## Step 6: Run Your First Test!

1. Click **"Start Test"** button
2. Enter your email address (e.g., `your.email@company.com`)
3. Click **"Begin Tests"**
4. Watch as all 8 tests run automatically!
5. When complete, click **"Download PDF Report"**

## What's Being Tested?

✓ **Domain Access** - Can you reach institutionallendingexchange.com?  
✓ **Email Delivery** - Email system working? (requires AWS SES)  
✓ **Email 2FA Timing** - How fast do verification emails arrive?  
✓ **File Upload** - Can you upload files?  
✓ **File Download** - Can you download files?  
✓ **Intercom Widget** - Is the support widget accessible?  
✓ **Screen Resolution** - Is your screen resolution adequate?  
✓ **Connection Speed** - How fast is your internet?

## Troubleshooting

### Backend won't start

**Error: Port 3001 already in use**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in server/.env:
PORT=3002
```

**Error: Cannot find module 'dotenv'**
```bash
# Reinstall dependencies
cd server
npm install
```

### Frontend won't start

**Error: Port 3000 already in use**
- Choose 'Y' when prompted to run on different port
- Or kill process: `lsof -ti:3000 | xargs kill -9`

**Blank page**
- Check browser console (F12) for errors
- Ensure backend is running
- Check `REACT_APP_API_URL` in client/.env

### Email tests failing

**"Email transporter not initialized"**
- This is EXPECTED if AWS SES is not configured
- Email tests will show as FAIL but other tests will continue
- To fix: Add AWS SES credentials to server/.env

### CORS errors

**"Access to fetch blocked by CORS policy"**
- Ensure backend is running on port 3001
- Check `CORS_ORIGIN` in server/.env matches frontend URL
- Try restarting both servers

## Next Steps

### Configure AWS SES for Email Tests

1. Create AWS account
2. Go to AWS SES Console
3. Verify email address (notification@ilex.sg or your domain)
4. Generate SMTP credentials
5. Add to server/.env:
   ```env
   AWS_SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   AWS_SES_SMTP_PORT=587
   AWS_SES_SMTP_USER=your-smtp-username
   AWS_SES_SMTP_PASS=your-smtp-password
   ```
6. Restart backend server

### Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete AWS deployment guide.

### Run Tests

See [TESTING.md](./TESTING.md) for comprehensive testing guide.

## Development Commands

```bash
# Backend
cd server
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Run production build

# Frontend
cd client
npm start           # Start development server
npm run build       # Build for production
npm test           # Run tests

# Both (from root)
npm run install:all # Install all dependencies
npm run dev         # Run both servers (requires concurrently)
```

## Project Structure

```
Pre-onboarding tool/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API & test services
│   │   ├── utils/         # PDF generator
│   │   └── types/         # TypeScript types
│   └── public/           # Static files
│
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── config/        # Configuration
│   └── dist/             # Compiled output
│
├── README.md             # Main documentation
├── DEPLOYMENT.md         # AWS deployment guide
└── TESTING.md           # Testing guide
```

## Get Help

- 📖 Read [README.md](./README.md) for full documentation
- 🚀 Read [DEPLOYMENT.md](./DEPLOYMENT.md) for AWS deployment
- 🧪 Read [TESTING.md](./TESTING.md) for testing guide
- 📧 Email: support@ilex.sg
- 🐛 Found a bug? Check console logs and server logs

## Quick Tips

💡 **Mock Mode**: Email tests will run in "mock mode" if AWS SES is not configured  
💡 **Fast Testing**: Use Chrome DevTools Network throttling to test speed detection  
💡 **Ad Blockers**: Disable them to test Intercom widget properly  
💡 **Mobile**: Open http://localhost:3002 on your phone (same network)  
💡 **PDF Issues**: Try different browsers if PDF download fails

## Common Test Results

**All Green (PASS)**: Your environment is ready! 🎉  
**Some Yellow (WARNING)**: Minor issues, see recommendations  
**Some Red (FAIL)**: Critical issues need attention

---

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup.

**Need more testing?** See [TESTING.md](./TESTING.md) for comprehensive test scenarios.

Happy testing! 🚀
