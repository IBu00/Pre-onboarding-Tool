import { config } from 'dotenv';

config();

export const CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3005', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3002',
  
  AWS: {
    REGION: process.env.AWS_REGION || 'us-east-1',
    SES_SMTP_HOST: process.env.AWS_SES_SMTP_HOST || '',
    SES_SMTP_PORT: parseInt(process.env.AWS_SES_SMTP_PORT || '587', 10),
    SES_SMTP_USER: process.env.AWS_SES_SMTP_USER || '',
    SES_SMTP_PASS: process.env.AWS_SES_SMTP_PASS || '',
  },
  
  EMAIL: {
    SENDER: process.env.SENDER_EMAIL || 'notification@ilex.sg',
  },
  
  APP: {
    INTERCOM_APP_ID: process.env.INTERCOM_APP_ID || '',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '1073741824', 10),
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3002',
  },
};
