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
    const startTime = Date.now();
    
    try {
      if (!files || files.length === 0) {
        return this.createResult(
          TestType.FILE_UPLOAD,
          'File Upload Test',
          'FAIL',
          'No files selected',
          'Please select files to upload.',
          ['No files selected'],
          undefined
        );
      }

      const filesArray = Array.isArray(files) ? files : Array.from(files);
      
      // Validate file count (max 100 files)
      if (filesArray.length > 100) {
        throw new Error(`Too many files selected. Maximum 100 files allowed, you selected ${filesArray.length} files.`);
      }

      // Validate file sizes (max 100MB per file)
      const maxFileSize = 100 * 1024 * 1024; // 100MB in bytes
      const oversizedFiles: string[] = [];
      
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        if (file.size > maxFileSize) {
          oversizedFiles.push(`${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
        }
      }
      
      if (oversizedFiles.length > 0) {
        throw new Error(`Files exceed 100MB limit: ${oversizedFiles.join(', ')}`);
      }
      
      // Upload files
      const response = await apiService.uploadFiles(filesArray);
      
      if (!response.success) {
        throw new Error(response.message || 'Upload failed');
      }
      
      const duration = (Date.now() - startTime) / 1000;
      const uploadedCount = response.uploadedFiles?.length || filesArray.length;
      const totalSize = filesArray.reduce((sum, file) => sum + file.size, 0);
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      
      // Check for any warnings from the server and clean up file paths
      const warnings = response.warnings || [];
      const cleanedWarnings = warnings.map((w: string) => {
        // Clean up file paths to show only file names
        return w.replace(/File ".*[\/\\]([^\/\\]+)"/g, 'File "$1"');
      });
      const hasWarnings = cleanedWarnings.length > 0;
      
      return this.createResult(
        TestType.FILE_UPLOAD,
        'File Upload Test',
        hasWarnings ? 'WARNING' : 'PASS',
        hasWarnings 
          ? `${uploadedCount} file(s) uploaded successfully with some warnings` 
          : `${uploadedCount} file(s) uploaded successfully`,
        `Successfully uploaded ${uploadedCount} file(s) (${totalSizeMB} MB total) in ${duration.toFixed(2)} seconds. ${hasWarnings ? 'Some warnings were detected but files were uploaded.' : 'All files uploaded without issues.'}`,
        hasWarnings ? cleanedWarnings : undefined,
        {
          fileCount: uploadedCount,
          totalSize: parseFloat(totalSizeMB),
          duration: parseFloat(duration.toFixed(2)),
          uploadSpeed: parseFloat((parseFloat(totalSizeMB) / duration).toFixed(2))
        }
      );
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      
      return this.createResult(
        TestType.FILE_UPLOAD,
        'File Upload Test',
        'FAIL',
        'File upload failed',
        error instanceof Error ? error.message : 'Unknown error occurred during upload',
        [
          'File upload failed',
          error instanceof Error ? error.message : 'Unknown error'
        ],
        {
          duration: parseFloat(duration.toFixed(2)),
          error: error instanceof Error ? error.message : 'Unknown error'
        }
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
    const startTime = Date.now();
    
    try {
      // Test 1: Measure download speed using file download
      const downloadStart = Date.now();
      const downloadResponse = await apiService.testFileDownload();
      const downloadTime = (Date.now() - downloadStart) / 1000;
      
      // Calculate download speed (test files are ~150KB total)
      const downloadSizeKB = 150;
      const downloadSpeedKbps = (downloadSizeKB * 8) / downloadTime; // Convert to Kbps
      const downloadSpeedMbps = downloadSpeedKbps / 1000;
      
      // Test 2: Measure upload speed
      const testData = new Blob([new ArrayBuffer(500 * 1024)]); // 500KB test file
      const testFile = new File([testData], 'speed-test.bin');
      
      const uploadStart = Date.now();
      await apiService.uploadFiles([testFile]);
      const uploadTime = (Date.now() - uploadStart) / 1000;
      
      const uploadSizeKB = 500;
      const uploadSpeedKbps = (uploadSizeKB * 8) / uploadTime;
      const uploadSpeedMbps = uploadSpeedKbps / 1000;
      
      // Test 3: Check latency with ping
      const pingStart = Date.now();
      await apiService.pingTest();
      const latency = Date.now() - pingStart;
      
      const duration = (Date.now() - startTime) / 1000;
      
      // Determine status
      // Good: Download > 10 Mbps, Upload > 5 Mbps, Latency < 100ms
      // Acceptable: Download > 5 Mbps, Upload > 2 Mbps, Latency < 200ms
      // Slow: Anything below acceptable
      
      let status: 'PASS' | 'WARNING' | 'FAIL';
      let message: string;
      let recommendations: string[] = [];
      
      if (downloadSpeedMbps >= 10 && uploadSpeedMbps >= 5 && latency < 100) {
        status = 'PASS';
        message = 'Connection speed is excellent';
      } else if (downloadSpeedMbps >= 5 && uploadSpeedMbps >= 2 && latency < 200) {
        status = 'WARNING';
        message = 'Connection speed is acceptable but could be improved';
        recommendations = [
          'Connection speed is functional but may cause delays with large files',
          'Consider upgrading internet connection for better performance',
          'Close bandwidth-heavy applications during platform use'
        ];
      } else {
        status = 'FAIL';
        message = 'Connection speed is below recommended minimum';
        recommendations = [
          'Internet connection speed is insufficient for optimal performance',
          'Large file transfers will be significantly delayed',
          'Video calls and real-time features may not work properly',
          'Contact IT department to investigate network issues'
        ];
      }
      
      const blockers: string[] = [];
      if (downloadSpeedMbps < 5) blockers.push('Download speed too slow (minimum 5 Mbps required)');
      if (uploadSpeedMbps < 2) blockers.push('Upload speed too slow (minimum 2 Mbps required)');
      if (latency >= 200) blockers.push('Network latency too high (maximum 200ms acceptable)');
      
      return this.createResult(
        TestType.CONNECTION_SPEED,
        'Connection Speed Test',
        status,
        message,
        `Download: ${downloadSpeedMbps.toFixed(2)} Mbps | Upload: ${uploadSpeedMbps.toFixed(2)} Mbps | Latency: ${latency} ms. ${status === 'PASS' ? 'Your connection provides sufficient speed for all platform features.' : status === 'WARNING' ? 'Your connection is adequate for basic usage but may experience delays.' : 'Your connection speed may cause performance issues.'}`,
        blockers.length > 0 ? blockers : undefined,
        {
          downloadSpeed: parseFloat(downloadSpeedMbps.toFixed(2)),
          uploadSpeed: parseFloat(uploadSpeedMbps.toFixed(2)),
          latency: latency,
          duration: parseFloat(duration.toFixed(2))
        }
      );
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      
      return this.createResult(
        TestType.CONNECTION_SPEED,
        'Connection Speed Test',
        'FAIL',
        'Connection speed test failed',
        'Unable to complete speed test. Network connection may be unstable or interrupted.',
        [
          'Network connection unstable',
          'Unable to complete speed test',
          error instanceof Error ? error.message : 'Unknown error'
        ],
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: parseFloat(duration.toFixed(2))
        }
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
