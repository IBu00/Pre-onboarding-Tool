export interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: any;
  timestamp: Date;
  recommendations: string[];
  duration?: number;
}

export interface EmailTestRequest {
  email: string;
}

export interface EmailTestResponse {
  success: boolean;
  verificationCode: string;
  timestamp: Date;
}

export interface Email2FARequest {
  email: string;
}

export interface Email2FAVerifyRequest {
  email: string;
  code: string;
}

export interface FileUploadResult {
  fileName: string;
  fileSize: number;
  uploadTime: number;
  uploadSpeed: number;
}

export interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  classification: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}
