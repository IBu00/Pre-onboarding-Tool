import { TestResult, TestType } from '../types/test.types';
import { apiService } from './apiService';

class TestService {
  private createResult(
    type: TestType,
    name: string,
    status: TestResult['status'],
    message: string,
    details: string,
    blockers?: string[],
    metadata?: Record<string, any>
  ): TestResult {
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      testName: name,
      status,
      message,
      details,
      blockers,
      timestamp: new Date(),
      recommendations: blockers || [],
      metadata
    };
  }

  async runDomainAccessTest(): Promise<TestResult> {
    try {
      const response = await apiService.testDomainAccess();
      return this.createResult(
        TestType.DOMAIN_ACCESS,
        'Domain Access Test',
        response.success ? 'PASS' : 'FAIL',
        response.message,
        response.details,
        response.blockers,
        response.metadata
      );
    } catch (error) {
      return this.createResult(
        TestType.DOMAIN_ACCESS,
        'Domain Access Test',
        'FAIL',
        'Test execution failed',
        'Unable to complete domain access test. This may indicate severe network connectivity issues.',
        ['Cannot reach test server', 'Network completely blocked'],
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async runFileDownloadTest(): Promise<TestResult> {
    try {
      const response = await apiService.testFileDownload();
      
      if (response.success && response.metadata?.files) {
        // Automatically download all files at once
        await apiService.downloadAllFiles(response.metadata.files);
        
        return this.createResult(
          TestType.FILE_DOWNLOAD,
          'File Download Test',
          'PASS',
          'All files downloaded successfully',
          `Successfully downloaded ${response.metadata.filesCount} file(s). Your browser and network allow file downloads without restrictions. Use these files for the Upload Test.`,
          undefined,
          response.metadata
        );
      }
      
      return this.createResult(
        TestType.FILE_DOWNLOAD,
        'File Download Test',
        'FAIL',
        response.message,
        response.details,
        response.blockers,
        response.metadata
      );
    } catch (error) {
      return this.createResult(
        TestType.FILE_DOWNLOAD,
        'File Download Test',
        'FAIL',
        'Download test failed',
        'Unable to prepare or retrieve files for download testing. This may indicate browser restrictions or network issues.',
        ['Server unreachable', 'Download blocked by browser or network', 'Pop-up blocker may be blocking downloads'],
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async runFileUploadTest(files: FileList | File[]): Promise<TestResult> {
    try {
      if (!files || files.length === 0) {
        return this.createResult(
          TestType.FILE_UPLOAD,
          'File Upload Test',
          'FAIL',
          'No files selected',
          'Please select the files you downloaded earlier to upload them back to the platform.',
          ['No files selected'],
          undefined
        );
      }

      const filesArray = Array.isArray(files) ? files : Array.from(files);
      const response = await apiService.uploadFiles(filesArray);
      
      const status = response.success 
        ? (response.blockers && response.blockers.length > 0 ? 'WARNING' : 'PASS')
        : 'FAIL';
      
      return this.createResult(
        TestType.FILE_UPLOAD,
        'File Upload Test',
        status,
        response.message,
        response.details,
        response.blockers,
        response.metadata
      );
    } catch (error) {
      return this.createResult(
        TestType.FILE_UPLOAD,
        'File Upload Test',
        'FAIL',
        'Upload test failed',
        'Unable to upload files to the server. This indicates network issues or upload restrictions.',
        ['Upload blocked', 'Server rejected files', 'Network timeout'],
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async runIntercomTest(): Promise<TestResult> {
    return new Promise((resolve) => {
      try {
        const checkIntercom = () => {
          // @ts-ignore - Intercom is loaded globally
          if (window.Intercom) {
            resolve(this.createResult(
              TestType.INTERCOM,
              'Intercom Widget Test',
              'PASS',
              'Intercom widget loaded successfully',
              'Widget is available and functional',
              [],
              { loaded: true, timestamp: new Date().toISOString() }
            ));
          } else {
            resolve(this.createResult(
              TestType.INTERCOM,
              'Intercom Widget Test',
              'WARNING',
              'Intercom widget not detected',
              'The Intercom support widget is not available. This may be blocked by firewall or content blocker.',
              ['Intercom widget not loaded', 'May be blocked by network policies'],
              { loaded: false, timestamp: new Date().toISOString() }
            ));
          }
        };

        setTimeout(checkIntercom, 3000);
      } catch (error) {
        resolve(this.createResult(
          TestType.INTERCOM,
          'Intercom Widget Test',
          'FAIL',
          'Test execution failed',
          'Unable to check Intercom widget status.',
          ['Test error occurred'],
          { error: error instanceof Error ? error.message : 'Unknown error' }
        ));
      }
    });
  }

  async runScreenResolutionTest(): Promise<TestResult> {
    try {
      const width = window.screen.width;
      const height = window.screen.height;
      const devicePixelRatio = window.devicePixelRatio;

      const minWidth = 1280;
      const minHeight = 720;
      const isSupported = width >= minWidth && height >= minHeight;

      const status = isSupported ? 'PASS' : 'WARNING';
      const message = isSupported 
        ? `Screen resolution ${width}x${height} meets requirements`
        : `Screen resolution ${width}x${height} is below recommended ${minWidth}x${minHeight}`;

      const details = `Current: ${width}x${height}, Pixel Ratio: ${devicePixelRatio}x`;
      const blockers = isSupported ? [] : ['Low screen resolution may affect user experience'];

      return this.createResult(
        TestType.SCREEN_RESOLUTION,
        'Screen Resolution Test',
        status,
        message,
        details,
        blockers,
        { width, height, devicePixelRatio, minWidth, minHeight }
      );
    } catch (error) {
      return this.createResult(
        TestType.SCREEN_RESOLUTION,
        'Screen Resolution Test',
        'FAIL',
        'Test execution failed',
        'Unable to detect screen resolution.',
        ['Screen API unavailable'],
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async runConnectionSpeedTest(): Promise<TestResult> {
    try {
      // Latency test using ping
      const latencyResult = await apiService.pingTest();
      const latency = latencyResult.latency;

      // Simple connection quality classification based on latency
      // We don't measure actual download/upload speeds as that requires dedicated endpoints
      const maxLatency = 200; // ms
      const goodLatency = 100; // ms

      let status: 'PASS' | 'WARNING' | 'FAIL';
      let message: string;
      const blockers: string[] = [];

      if (latency <= goodLatency) {
        status = 'PASS';
        message = 'Connection speed is good';
      } else if (latency <= maxLatency) {
        status = 'WARNING';
        message = 'Connection speed is acceptable but could be better';
        blockers.push('Higher latency may affect real-time interactions');
      } else {
        status = 'FAIL';
        message = 'Connection speed is below recommended levels';
        blockers.push('High latency will affect file transfers and real-time interactions');
      }
      
      const details = `Network Latency: ${latency} ms. ${status === 'PASS' ? 'Your connection is fast and stable.' : status === 'WARNING' ? 'Your connection is usable but may experience occasional delays.' : 'Your connection is slow and may cause issues.'}`;

      return this.createResult(
        TestType.CONNECTION_SPEED,
        'Connection Speed Test',
        status,
        message,
        details,
        blockers.length > 0 ? blockers : undefined,
        { latency, maxLatency, goodLatency }
      );
    } catch (error) {
      return this.createResult(
        TestType.CONNECTION_SPEED,
        'Connection Speed Test',
        'FAIL',
        'Speed test failed',
        `Unable to measure connection speed. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ['Network connection test failed', 'Unable to reach server'],
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async runEmailDeliveryTest(email: string): Promise<TestResult> {
    try {
      const response = await apiService.sendTestEmail(email);
      return this.createResult(
        TestType.EMAIL_DELIVERY,
        'Email Delivery Test',
        response.success ? 'PASS' : 'FAIL',
        response.message,
        response.success 
          ? `Test email successfully sent to ${email}. Please check your inbox (and spam folder) to confirm delivery. Email system is functioning correctly and your email provider is accepting messages from our domain.`
          : `Failed to send test email to ${email}. This may indicate email server issues or invalid email address.`,
        response.success ? undefined : ['Email server error', 'Invalid email address', 'Email rejected by recipient server'],
        response.metadata
      );
    } catch (error) {
      return this.createResult(
        TestType.EMAIL_DELIVERY,
        'Email Delivery Test',
        'FAIL',
        'Email test failed',
        'Unable to send test email due to server error.',
        ['Email service unavailable', 'Network error'],
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async runEmail2FATest(email: string): Promise<TestResult> {
    try {
      const startTime = Date.now();
      const response = await apiService.send2FACode(email);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const maxAcceptableTime = 5000; // 5 seconds
      const blockers: string[] = [];

      if (duration > maxAcceptableTime) {
        blockers.push(`Email delivery took ${(duration / 1000).toFixed(2)}s, exceeding acceptable ${maxAcceptableTime / 1000}s threshold`);
        blockers.push('2FA codes may arrive too late for practical use');
      }

      return this.createResult(
        TestType.EMAIL_2FA,
        'Email 2FA Timing Test',
        response.success && duration <= maxAcceptableTime ? 'PASS' : 'FAIL',
        response.message,
        response.success
          ? `2FA email sent in ${(duration / 1000).toFixed(2)} seconds. ${duration <= maxAcceptableTime ? 'Delivery time is within acceptable range for secure authentication.' : 'Delivery time is slower than recommended, which may impact user experience during login.'}`
          : 'Failed to send 2FA email. Two-factor authentication may not work properly.',
        blockers.length > 0 ? blockers : undefined,
        { ...response.metadata, deliveryTime: duration, threshold: maxAcceptableTime }
      );
    } catch (error) {
      return this.createResult(
        TestType.EMAIL_2FA,
        'Email 2FA Timing Test',
        'FAIL',
        '2FA test failed',
        'Unable to test 2FA email delivery timing.',
        ['Email service error', '2FA system unavailable'],
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }
}

const testService = new TestService();
export default testService;
