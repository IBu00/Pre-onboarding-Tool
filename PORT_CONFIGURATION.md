# Port Configuration Update - Summary

## ✅ Changes Completed

### New Port Configuration
- **Frontend (React):** Port **3002** (previously 3000)
- **Backend (Server):** Port **3005** (previously 3001)

### Why These Ports?
- Avoiding port **3000** (commonly used by many dev servers)
- Avoiding port **5000** (commonly used by Flask, other frameworks)
- Using ports that are less likely to conflict with other applications

---

## Files Updated

### 1. Environment Configuration Files
✅ `/server/.env.example` - Updated to use port 3005 and frontend URL 3002
✅ `/server/.env` - Created from example with new ports
✅ `/client/.env.example` - Updated API URL to port 3005
✅ `/client/.env` - Created with PORT=3002 and API URL pointing to port 3005

### 2. Configuration Files
✅ `/server/src/config/env.config.ts` - Updated default ports:
   - PORT: 3005 (was 3001)
   - FRONTEND_URL: http://localhost:3002 (was 3000)
   - CORS_ORIGIN: http://localhost:3002 (was 3000)

✅ `/client/src/services/apiService.ts` - Updated fallback API URL:
   - API_URL: http://localhost:3005/api (was 3001)

### 3. Documentation Files Updated
✅ All `.md` files updated:
   - README.md
   - GET_STARTED.md
   - INSTALL.md
   - TESTING.md
   - PROJECT_SUMMARY.md
   - QUICKSTART.md
   - DEPLOYMENT.md
   - TROUBLESHOOTING.md
   - TESTING_GUIDE.md
   - IMPLEMENTATION_SUMMARY.md

---

## How to Use

### Starting the Application

**Single Command (Starts Both):**
```bash
npm run dev
```

This will:
- Start the backend server on **http://localhost:3005**
- Start the frontend on **http://localhost:3002**
- Both will run concurrently with auto-reload

### Accessing the Application

**Frontend:** http://localhost:3002
**Backend API:** http://localhost:3005/api

### Individual Commands (if needed)

**Backend only:**
```bash
cd server
npm run dev
# Runs on port 3005
```

**Frontend only:**
```bash
cd client
npm start
# Runs on port 3002
```

---

## Verification

### Server Running Successfully:
```
✅ 🚀 Server is running on port 3005
✅ 📧 Environment: development
✅ 🌐 CORS Origin: http://localhost:3002
✅ 📬 Email configured: true
```

### Frontend Starting:
```
✅ Starting the development server...
✅ Compiled successfully!
✅ You can now view the app in the browser.
✅ Local: http://localhost:3002
```

---

## Environment Variables Summary

### Server (server/.env)
```env
NODE_ENV=development
PORT=3005
FRONTEND_URL=http://localhost:3002
CORS_ORIGIN=http://localhost:3002

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
```

### Client (client/.env)
```env
REACT_APP_API_URL=http://localhost:3005/api
REACT_APP_DOMAIN_TO_TEST=https://institutionallendingexchange.com
REACT_APP_INTERCOM_APP_ID=your-intercom-app-id
PORT=3002
```

---

## Troubleshooting

### Port Already in Use

If you see "Port 3002 is already in use" or "Port 3005 is already in use":

**Find and kill the process:**
```bash
# For port 3002
lsof -ti:3002 | xargs kill -9

# For port 3005
lsof -ti:3005 | xargs kill -9
```

**Or change to different ports** by editing `.env` files:
```env
# Client .env
PORT=3008

# Server .env
PORT=3009
FRONTEND_URL=http://localhost:3008
CORS_ORIGIN=http://localhost:3008

# Also update client .env
REACT_APP_API_URL=http://localhost:3009/api
```

### CORS Errors

If you see CORS errors in browser console:
1. Verify `CORS_ORIGIN` in `server/.env` matches frontend URL
2. Verify frontend is actually running on the expected port
3. Restart both servers after changing .env files

### API Connection Errors

If frontend can't connect to backend:
1. Verify `REACT_APP_API_URL` in `client/.env` is correct
2. Check backend is running: `curl http://localhost:3005/api/health`
3. Check browser network tab for actual URL being called

---

## Testing the Setup

### 1. Start the Application
```bash
npm run dev
```

### 2. Open Browser
Navigate to: **http://localhost:3002**

### 3. Check Server Health
Open: **http://localhost:3005/api/health**

Should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-20T...",
  "environment": "development"
}
```

### 4. Run Tests
Click "Start Tests" on the frontend and verify:
- ✅ Domain Access Test connects properly
- ✅ File download works
- ✅ File upload works
- ✅ All 8 tests execute without connection errors

---

## Production Deployment

When deploying to production, update:

### Server Environment
```env
NODE_ENV=production
PORT=3005  # or your production port
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

### Client Environment
```env
REACT_APP_API_URL=https://your-domain.com/api
```

---

## Summary

✅ **`npm run dev` script exists** and starts both frontend and backend
✅ **New ports configured:**
   - Frontend: 3002 (avoiding 3000)
   - Backend: 3005 (avoiding 3001 and 5000)
✅ **All configuration files updated**
✅ **All documentation updated**
✅ **Environment files created and configured**
✅ **CORS properly configured for new ports**
✅ **Tested and working** - Both servers start successfully

You can now run `npm run dev` and access the application at **http://localhost:3002**!
