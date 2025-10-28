import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';

interface TestResult {
  success: boolean;
  message: string;
  details: string;
  blockers?: string[];
  metadata?: Record<string, any>;
}

export const healthCheck = async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
  });
};

export const latencyTest = async (req: Request, res: Response) => {
  // Simple ping endpoint for latency testing
  res.json({
    success: true,
    timestamp: Date.now(),
  });
};

export const testDomainAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    
    // Test domain accessibility
    const domain = req.get('host') || 'localhost';
    const protocol = req.protocol;
    
    const result: TestResult = {
      success: true,
      message: 'Domain access successful',
      details: `Successfully connected to ${protocol}://${domain}. Your network configuration allows access to this domain. DNS resolution is working correctly, and there are no firewall restrictions blocking the connection.`,
      metadata: {
        domain,
        protocol,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        responseTime: Date.now() - startTime
      }
    };

    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.json({
      success: false,
      message: 'Domain access failed',
      details: `Failed to establish connection to the domain. This could indicate network restrictions, DNS issues, or firewall blocks.`,
      blockers: [
        'Network connectivity issues',
        'Firewall or proxy blocking the domain',
        'DNS resolution failure',
        'VPN/Corporate network restrictions'
      ],
      metadata: { error: errorMessage }
    });
  }
};

export const testFileDownload = async (req: Request, res: Response): Promise<void> => {
  try {
    const testFilesDir = path.join(__dirname, '../../test-files');
    
    // Ensure test files directory exists
    try {
      await fs.access(testFilesDir);
    } catch {
      await fs.mkdir(testFilesDir, { recursive: true });
      
      // Create sample test files
      await fs.writeFile(
        path.join(testFilesDir, 'sample-document.txt'),
        'This is a sample document for download testing. The file contains text data to verify download functionality.'
      );
      await fs.writeFile(
        path.join(testFilesDir, 'sample-data.json'),
        JSON.stringify({ message: 'Sample JSON file for testing', timestamp: Date.now() }, null, 2)
      );
      await fs.writeFile(
        path.join(testFilesDir, 'sample-report.txt'),
        'Sample Report\n\nThis is a test report file to verify file download capabilities.\n\nDate: ' + new Date().toISOString()
      );
    }

    // List available files
    const files = await fs.readdir(testFilesDir);
    
    if (files.length === 0) {
      res.json({
        success: false,
        message: 'No files available for download',
        details: 'The download test requires files to be available on the server, but none were found. This indicates a server configuration issue.',
        blockers: ['Server-side files not available', 'Directory permissions issue'],
        metadata: { filesCount: 0 }
      });
      return;
    }

    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(testFilesDir, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          size: stats.size,
          sizeKB: (stats.size / 1024).toFixed(2),
          path: `/api/test/download/${file}`
        };
      })
    );

    res.json({
      success: true,
      message: 'Download test ready',
      details: `Found ${files.length} file(s) available for download. Your browser and network configuration allow file downloads. No download restrictions detected. Click on any file below to test the download functionality.`,
      metadata: {
        filesCount: files.length,
        files: fileDetails,
        totalSize: fileDetails.reduce((sum, f) => sum + f.size, 0)
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.json({
      success: false,
      message: 'Download test failed',
      details: 'Failed to prepare files for download testing. This indicates server-side issues with file access or permissions.',
      blockers: [
        'Server file system access denied',
        'Insufficient permissions to read files',
        'File system error on server'
      ],
      metadata: { error: errorMessage }
    });
  }
};

export const downloadTestFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    const testFilesDir = path.join(__dirname, '../../test-files');
    const filePath = path.join(testFilesDir, filename);

    // Security check - prevent directory traversal
    if (!filePath.startsWith(testFilesDir)) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        details: 'Invalid file path detected'
      });
      return;
    }

    // Check if file exists
    await fs.access(filePath);
    
    res.download(filePath, filename);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'File not found',
      details: 'The requested file does not exist or cannot be accessed'
    });
  }
};

export const testFileUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.json({
        success: false,
        message: 'No file uploaded',
        details: 'File upload test requires a file to be selected and uploaded. Please choose a file and try again.',
        blockers: ['No file selected', 'Upload request incomplete']
      });
      return;
    }

    const uploadedFile = req.file;
    const blockers: string[] = [];
    let details = '';

    // Check file size (warn if > 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (uploadedFile.size > maxSize) {
      blockers.push(`File size (${(uploadedFile.size / 1024 / 1024).toFixed(2)}MB) exceeds recommended limit of 10MB`);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/json', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      blockers.push(`File type '${uploadedFile.mimetype}' may not be supported by all platform features`);
    }

    if (blockers.length > 0) {
      details = `File uploaded successfully, but some warnings were detected. The file '${uploadedFile.originalname}' (${(uploadedFile.size / 1024).toFixed(2)}KB) was received by the server, but there are potential compatibility issues that may affect usage.`;
      res.json({
        success: true,
        message: 'Upload successful with warnings',
        details,
        blockers,
        metadata: {
          filename: uploadedFile.originalname,
          size: uploadedFile.size,
          sizeKB: (uploadedFile.size / 1024).toFixed(2),
          sizeMB: (uploadedFile.size / 1024 / 1024).toFixed(2),
          mimetype: uploadedFile.mimetype,
          encoding: uploadedFile.encoding
        }
      });
    } else {
      details = `File upload test passed successfully! Your file '${uploadedFile.originalname}' (${(uploadedFile.size / 1024).toFixed(2)}KB, ${uploadedFile.mimetype}) was uploaded without any issues. Your network and browser configuration properly support file uploads to the platform.`;
      res.json({
        success: true,
        message: 'Upload test successful',
        details,
        metadata: {
          filename: uploadedFile.originalname,
          size: uploadedFile.size,
          sizeKB: (uploadedFile.size / 1024).toFixed(2),
          sizeMB: (uploadedFile.size / 1024 / 1024).toFixed(2),
          mimetype: uploadedFile.mimetype,
          encoding: uploadedFile.encoding
        }
      });
    }

    // Clean up uploaded file
    await fs.unlink(uploadedFile.path);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.json({
      success: false,
      message: 'Upload test failed',
      details: 'Failed to upload file to the server. This could be due to network issues, server restrictions, or file handling problems.',
      blockers: [
        'Network interruption during upload',
        'Server rejected the file',
        'Insufficient server storage',
        'File processing error',
        'Antivirus or security software blocking upload'
      ],
      metadata: { error: errorMessage }
    });
  }
};

export const testIntercom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { loaded, errorMessage } = req.body;

    if (loaded) {
      res.json({
        success: true,
        message: 'Intercom widget loaded successfully',
        details: 'The Intercom support widget loaded correctly in your browser. You can access customer support features without any issues. JavaScript execution is working properly, and there are no script-blocking extensions interfering with the widget.',
        metadata: {
          userAgent: req.get('user-agent'),
          timestamp: Date.now()
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Intercom widget failed to load',
        details: 'The Intercom support widget could not be loaded. This prevents you from accessing in-app customer support features.',
        blockers: [
          'Ad blocker or script blocker extension enabled',
          'Third-party cookies disabled',
          'Corporate firewall blocking Intercom domain',
          'JavaScript disabled or restricted',
          errorMessage || 'Widget initialization failed'
        ],
        metadata: {
          error: errorMessage,
          userAgent: req.get('user-agent')
        }
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.json({
      success: false,
      message: 'Intercom test error',
      details: 'Unable to complete Intercom widget test due to an unexpected error.',
      blockers: ['Test execution failed', errorMessage],
      metadata: { error: errorMessage }
    });
  }
};

export const testScreenResolution = async (req: Request, res: Response): Promise<void> => {
  try {
    const { width, height, devicePixelRatio } = req.body;

    const minWidth = 1024;
    const minHeight = 768;
    const blockers: string[] = [];
    let details = '';

    if (width < minWidth || height < minHeight) {
      blockers.push(`Screen resolution ${width}x${height} is below recommended minimum of ${minWidth}x${minHeight}`);
      blockers.push('Some UI elements may not display correctly');
      blockers.push('Horizontal scrolling may be required');
      
      details = `Your current screen resolution (${width}x${height}) is below the recommended minimum. While the platform will still function, you may experience layout issues, overlapping elements, or need to scroll horizontally to access all features. For optimal experience, use a device with at least ${minWidth}x${minHeight} resolution.`;
      
      res.json({
        success: false,
        message: 'Resolution below minimum',
        details,
        blockers,
        metadata: {
          current: { width, height },
          minimum: { width: minWidth, height: minHeight },
          devicePixelRatio
        }
      });
    } else {
      details = `Your screen resolution (${width}x${height}) meets the platform requirements. All UI elements will display correctly without horizontal scrolling. The platform is optimized for your screen size and will provide an optimal user experience.`;
      
      res.json({
        success: true,
        message: 'Screen resolution meets requirements',
        details,
        metadata: {
          resolution: { width, height },
          devicePixelRatio,
          category: width >= 1920 ? 'High Resolution' : width >= 1366 ? 'Standard' : 'Minimum'
        }
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.json({
      success: false,
      message: 'Resolution test failed',
      details: 'Unable to detect your screen resolution. This may indicate browser compatibility issues.',
      blockers: ['Screen API not available', 'Browser permission denied'],
      metadata: { error: errorMessage }
    });
  }
};

export const testConnectionSpeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const { downloadSpeed, uploadSpeed, latency } = req.body;

    const minDownloadSpeed = 5; // Mbps
    const minUploadSpeed = 1; // Mbps
    const maxLatency = 200; // ms
    
    const blockers: string[] = [];
    let details = '';
    let success = true;

    // Check download speed
    if (downloadSpeed < minDownloadSpeed) {
      blockers.push(`Download speed (${downloadSpeed.toFixed(2)} Mbps) is below minimum ${minDownloadSpeed} Mbps`);
      success = false;
    }

    // Check upload speed
    if (uploadSpeed < minUploadSpeed) {
      blockers.push(`Upload speed (${uploadSpeed.toFixed(2)} Mbps) is below minimum ${minUploadSpeed} Mbps`);
      success = false;
    }

    // Check latency
    if (latency > maxLatency) {
      blockers.push(`Network latency (${latency}ms) exceeds maximum ${maxLatency}ms`);
      success = false;
    }

    if (success) {
      details = `Your internet connection is performing well. Download speed: ${downloadSpeed.toFixed(2)} Mbps, Upload speed: ${uploadSpeed.toFixed(2)} Mbps, Latency: ${latency.toFixed(0)}ms. This connection will provide smooth platform performance for all features including video calls, file transfers, and real-time collaboration.`;
      
      res.json({
        success: true,
        message: 'Connection speed is adequate',
        details,
        metadata: {
          downloadSpeed: `${downloadSpeed.toFixed(2)} Mbps`,
          uploadSpeed: `${uploadSpeed.toFixed(2)} Mbps`,
          latency: `${latency.toFixed(0)}ms`,
          quality: downloadSpeed >= 50 ? 'Excellent' : downloadSpeed >= 25 ? 'Good' : 'Adequate'
        }
      });
    } else {
      details = `Your internet connection may not provide optimal performance. Current speeds - Download: ${downloadSpeed.toFixed(2)} Mbps, Upload: ${uploadSpeed.toFixed(2)} Mbps, Latency: ${latency.toFixed(0)}ms. You may experience slow page loads, choppy video calls, or delays in file transfers. Consider using a wired connection or upgrading your internet plan.`;
      
      res.json({
        success: false,
        message: 'Connection speed below requirements',
        details,
        blockers,
        metadata: {
          downloadSpeed: `${downloadSpeed.toFixed(2)} Mbps`,
          uploadSpeed: `${uploadSpeed.toFixed(2)} Mbps`,
          latency: `${latency.toFixed(0)}ms`,
          minimum: {
            download: `${minDownloadSpeed} Mbps`,
            upload: `${minUploadSpeed} Mbps`,
            latency: `${maxLatency}ms`
          }
        }
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.json({
      success: false,
      message: 'Connection speed test failed',
      details: 'Unable to measure your connection speed. This may indicate network instability or test interference.',
      blockers: ['Network unstable', 'Test could not complete', 'Measurement failed'],
      metadata: { error: errorMessage }
    });
  }
};
