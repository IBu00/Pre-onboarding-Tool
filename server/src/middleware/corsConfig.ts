import cors from 'cors';
import { CONFIG } from '../config/env.config';

export const corsConfig = cors({
  origin: CONFIG.APP.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
