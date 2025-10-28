# Installation Guide

Complete installation instructions for the ILex Pre-Onboarding Test Application.

## 🎯 Quick Install (Recommended)

### macOS / Linux

```bash
# Navigate to project directory
cd "Pre-onboarding tool"

# Run setup script
./setup.sh

# Start application
./start.sh
```

### Windows

```cmd
REM Navigate to project directory
cd "Pre-onboarding tool"

REM Run setup script
setup.bat

REM Start application
start.bat
```

The setup script will:
- ✅ Check Node.js installation
- ✅ Install all dependencies
- ✅ Create .env files from templates
- ✅ Create launch scripts
- ✅ Provide next steps

---

## 📋 Manual Installation

### Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Git** (optional, for version control)

Verify installation:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
```

### Step 1: Install Dependencies

```bash
# From project root directory
cd "Pre-onboarding tool"

# Install all dependencies (takes 2-3 minutes)
npm run install:all
```

Or install separately:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Configure Backend

```bash
cd server

# Copy environment template
cp .env.example .env

# Edit .env with your settings
# Required for email tests:
#   - AWS_SES_SMTP_HOST
#   - AWS_SES_SMTP_PORT  
#   - AWS_SES_SMTP_USER
#   - AWS_SES_SMTP_PASS
#   - SENDER_EMAIL
```

**Minimal Configuration (without email):**
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3002
CORS_ORIGIN=http://localhost:3002
SENDER_EMAIL=notification@ilex.sg
INTERCOM_APP_ID=your-intercom-app-id
MAX_FILE_SIZE=1073741824
```

**Full Configuration (with AWS SES):**
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3002
CORS_ORIGIN=http://localhost:3002

# AWS SES Configuration
AWS_REGION=us-east-1
AWS_SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
AWS_SES_SMTP_PORT=587
AWS_SES_SMTP_USER=AKIA****************
AWS_SES_SMTP_PASS=********************************
SENDER_EMAIL=notification@ilex.sg

# Application
INTERCOM_APP_ID=your-intercom-app-id
MAX_FILE_SIZE=1073741824
```

### Step 3: Configure Frontend

```bash
cd client

# Copy environment template
cp .env.example .env

# Edit if needed (defaults should work)
```

**Default Configuration:**
```env
REACT_APP_API_URL=http://localhost:3005/api
REACT_APP_DOMAIN_TO_TEST=https://institutionallendingexchange.com
REACT_APP_INTERCOM_APP_ID=your-intercom-app-id
```

### Step 4: Start the Application

#### Option A: Two Separate Terminals

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

Wait for:
```
🚀 Server is running on port 3001
📧 Environment: development
🌐 CORS Origin: http://localhost:3002
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

Browser should open automatically to `http://localhost:3002`

#### Option B: Using Launch Scripts

**macOS/Linux:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

### Step 5: Verify Installation

1. Backend health check:
   ```bash
   curl http://localhost:3005/api/health
   ```
   
   Should return:
   ```json
   {
     "success": true,
     "message": "Server is running",
     "timestamp": "2024-01-..."
   }
   ```

2. Frontend should load at `http://localhost:3002`

3. Click "Start Test" button

4. Enter your email address

5. Run tests!

---

## 🔧 Troubleshooting Installation

### Node.js Not Found

**macOS:**
```bash
# Install using Homebrew
brew install node

# Or download from nodejs.org
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
Download installer from [nodejs.org](https://nodejs.org/)

### npm install Fails

**EACCES Permission Error:**
```bash
# Use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Or fix permissions
sudo chown -R $USER:$(id -gn $USER) ~/.npm
sudo chown -R $USER:$(id -gn $USER) ~/.config
```

**Cannot find module errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Port Already in Use

**Error: `EADDRINUSE: address already in use :::3001`**

**macOS/Linux:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in server/.env
echo "PORT=3002" >> server/.env
```

**Windows:**
```cmd
REM Find process on port 3001
netstat -ano | findstr :3001

REM Kill process (replace PID)
taskkill /PID <PID> /F
```

### TypeScript Errors in VS Code

These are expected before dependencies are installed. After running `npm install`, reload VS Code:
- macOS: `Cmd + Shift + P` → "Reload Window"
- Windows/Linux: `Ctrl + Shift + P` → "Reload Window"

---

## 📦 What Gets Installed

### Backend Dependencies

**Core:**
- `express` - Web framework
- `typescript` - Type safety
- `dotenv` - Environment variables

**Email:**
- `nodemailer` - Email sending via AWS SES

**File Handling:**
- `multer` - File upload middleware

**Security:**
- `helmet` - Security headers
- `cors` - CORS middleware
- `express-rate-limit` - Rate limiting

**Dev Tools:**
- `ts-node` - TypeScript execution
- `nodemon` - Auto-restart on changes

### Frontend Dependencies

**Core:**
- `react` - UI framework
- `react-dom` - React rendering
- `typescript` - Type safety

**Styling:**
- `tailwindcss` - Utility-first CSS
- `postcss` - CSS processing
- `autoprefixer` - CSS vendor prefixes

**HTTP & PDF:**
- `axios` - HTTP client
- `jspdf` - PDF generation
- `jspdf-autotable` - PDF tables

**Build Tools:**
- `react-scripts` - Create React App tools

---

## 🎓 Post-Installation Steps

### 1. Test Locally

Run all 8 tests from `http://localhost:3002`:
1. Domain Access Test
2. Email Delivery Test
3. Email 2FA Timing Test
4. File Upload Test
5. File Download Test
6. Intercom Widget Test
7. Screen Resolution Test
8. Connection Speed Test

### 2. Configure AWS SES (Optional)

For full email functionality:

1. **Create AWS Account**
   - Go to [aws.amazon.com](https://aws.amazon.com)
   - Sign up or log in

2. **Set Up SES**
   - Go to AWS Console → SES
   - Select region: `us-east-1`
   - Verify email address
   - Generate SMTP credentials

3. **Request Production Access**
   - Click "Request Production Access" in SES
   - Fill out form
   - Wait 24-48 hours for approval

4. **Update server/.env**
   - Add SMTP credentials
   - Restart backend

### 3. Review Documentation

- **[README.md](./README.md)** - Project overview
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to AWS
- **[TESTING.md](./TESTING.md)** - Test scenarios
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues

### 4. Customize (Optional)

**Branding:**
- Edit `client/tailwind.config.js` for colors
- Update logo in `client/public/`
- Modify text in `TestRunner.tsx`

**Tests:**
- Add/modify tests in `client/src/services/testService.ts`
- Update test configs in `TestRunner.tsx`

**PDF Report:**
- Customize in `client/src/utils/pdfGenerator.ts`

---

## 🚀 Ready for Production?

Once everything works locally:

1. **Build Backend:**
   ```bash
   cd server
   npm run build
   ```

2. **Build Frontend:**
   ```bash
   cd client
   npm run build
   ```

3. **Deploy to AWS:**
   Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

---

## 📊 Installation Checklist

Before starting development:
- [ ] Node.js 18+ installed
- [ ] npm installed and working
- [ ] Project dependencies installed
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Backend starts successfully (port 3001)
- [ ] Frontend starts successfully (port 3000)
- [ ] Can access http://localhost:3002
- [ ] Backend health check passes
- [ ] Can run at least one test

Optional:
- [ ] AWS SES configured
- [ ] Email tests working
- [ ] All 8 tests passing

---

## 🆘 Getting Help

**Installation Issues:**
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review error messages carefully
3. Check Node.js version: `node --version`
4. Clear cache: `npm cache clean --force`
5. Reinstall: `rm -rf node_modules && npm install`

**Still Stuck?**
- Email: support@ilex.sg
- Include:
  - Operating system and version
  - Node.js version
  - Complete error message
  - Steps you've tried

---

## ✅ Next Steps After Installation

1. **Run Your First Test**
   - Go to http://localhost:3002
   - Click "Start Test"
   - Enter your email
   - Watch the magic! ✨

2. **Generate PDF Report**
   - Complete all tests
   - Click "Download PDF Report"
   - Review the detailed results

3. **Explore the Code**
   - Backend: `server/src/`
   - Frontend: `client/src/`
   - Tests: `client/src/services/testService.ts`

4. **Prepare for Deployment**
   - Read [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Set up AWS account
   - Configure production environment

**Welcome to the ILex Pre-Onboarding Tool! 🎉**
