export enum TestType {
  DOMAIN_ACCESS = 'domain-access',
  EMAIL_DELIVERY = 'email-delivery',
  EMAIL_2FA = 'email-2fa',
  FILE_DOWNLOAD = 'file-download',
  FILE_UPLOAD = 'file-upload',
  INTERCOM = 'intercom',
  SCREEN_RESOLUTION = 'screen-resolution',
  CONNECTION_SPEED = 'connection-speed'
}

export interface TestResult {
  id: string;
  type: TestType;
  testName: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'RUNNING' | 'PENDING';
  message: string;
  details: string;
  blockers?: string[];
  timestamp: Date;
  recommendations: string[];
  duration?: number;
  error?: string;
  metadata?: any;
}

export interface DomainTestDetails {
  testedPages: string[];
  accessiblePages: string[];
  failedPages: Array<{ url: string; error: string }>;
  corsIssues: boolean;
}

export interface EmailTestDetails {
  email: string;
  deliveryTime?: number;
  verificationCode?: string;
  sent: boolean;
}

export interface TFATestDetails {
  email: string;
  deliveryTime?: number;
  sent: boolean;
  verified: boolean;
}

export interface FileUploadDetails {
  fileCount: number;
  totalSize: number;
  totalSizeMB: number;
  uploadDuration: number;
  averageSpeed: number;
  files: Array<{
    fileName: string;
    fileSize: number;
    fileSizeMB: number;
    uploadSpeed: number;
  }>;
}

export interface FileDownloadDetails {
  fileSize: number;
  fileSizeMB: number;
  downloadDuration: number;
  downloadSpeed: number;
}

export interface IntercomTestDetails {
  widgetLoaded: boolean;
  scriptBlocked: boolean;
  intercomAvailable: boolean;
}

export interface ResolutionTestDetails {
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  actualResolution: string;
  viewportSize: string;
  isSupported: boolean;
}

export interface SpeedTestDetails {
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  classification: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export type TestStatus = 'PASS' | 'FAIL' | 'WARNING' | 'RUNNING' | 'PENDING';

export interface TestConfig {
  id: number;
  name: string;
  description: string;
  estimatedTime: string;
}
