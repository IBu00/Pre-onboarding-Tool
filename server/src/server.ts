import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import { CONFIG } from './config/env.config';
import { corsConfig } from './middleware/corsConfig';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Controllers
import { 
  sendTestEmail, 
  verifyEmailCode, 
  send2FACode, 
  verify2FACode 
} from './controllers/emailController';
import { 
  upload, 
  handleFileUpload, 
  handleFileDownload, 
  handleSpeedTest 
} from './controllers/fileController';
import { 
  healthCheck, 
  latencyTest, 
  testDomainAccess,
  testFileDownload,
  downloadTestFile,
  testFileUpload,
  testIntercom,
  testScreenResolution,
  testConnectionSpeed
} from './controllers/testController';

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// CORS
app.use(corsConfig);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (CONFIG.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const uploadMiddleware = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Routes
app.get('/api/health', healthCheck);
app.get('/api/test/ping', latencyTest);

// New test routes
app.get('/api/test/domain-access', testDomainAccess);
app.get('/api/test/file-download', testFileDownload);
app.get('/api/test/download/:filename', downloadTestFile);
app.post('/api/test/file-upload', uploadMiddleware.single('file'), testFileUpload);
app.post('/api/test/intercom', testIntercom);
app.post('/api/test/screen-resolution', testScreenResolution);
app.post('/api/test/connection-speed', testConnectionSpeed);

// Email routes
app.post('/api/test/email', sendTestEmail);
app.post('/api/test/email/verify', verifyEmailCode);
app.post('/api/test/email-2fa', send2FACode);
app.post('/api/test/email-2fa/verify', verify2FACode);

// File routes (legacy)
app.post('/api/test/upload', upload.array('files', 10), handleFileUpload);
app.get('/api/test/download', handleFileDownload);
app.get('/api/test/speed-test', handleSpeedTest);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'ILex Pre-Onboarding Test API',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      ping: '/api/test/ping',
      tests: {
        domainAccess: 'GET /api/test/domain-access',
        fileDownload: 'GET /api/test/file-download',
        downloadFile: 'GET /api/test/download/:filename',
        fileUpload: 'POST /api/test/file-upload',
        intercom: 'POST /api/test/intercom',
        screenResolution: 'POST /api/test/screen-resolution',
        connectionSpeed: 'POST /api/test/connection-speed',
      },
      email: {
        send: 'POST /api/test/email',
        verify: 'POST /api/test/email/verify',
        send2FA: 'POST /api/test/email-2fa',
        verify2FA: 'POST /api/test/email-2fa/verify',
      },
      legacy: {
        upload: 'POST /api/test/upload',
        download: 'GET /api/test/download?size={MB}',
        speedTest: 'GET /api/test/speed-test?size={MB}',
      },
    },
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = CONFIG.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📧 Environment: ${CONFIG.NODE_ENV}`);
  console.log(`🌐 CORS Origin: ${CONFIG.APP.CORS_ORIGIN}`);
  console.log(`📬 Email configured: ${emailService.isConfigured()}`);
});

// Import email service to check configuration
import { emailService } from './services/emailService';

export default app;
