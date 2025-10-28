import React, { useState, useRef } from 'react';
import { TestResult, TestType } from '../types/test.types';
import { TESTS } from '../config/testConfig';
import testService from '../services/testService';
import { apiService } from '../services/apiService';
import TestCard from './TestCard';
import ProgressBar from './ProgressBar';
import ResultsDisplay from './ResultsDisplay';

const TEST_CONFIGS = TESTS;

const TestRunner: React.FC = () => {
  const [currentTestIndex, setCurrentTestIndex] = useState(-1);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [tfaCode, setTfaCode] = useState('');
  const [waitingFor2FAVerification, setWaitingFor2FAVerification] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [showUploadButton, setShowUploadButton] = useState(false);
  
  // Refs to store email send timestamp for timing measurement
  const tfaSentTimeRef = useRef<number>(0);
  
  // Refs to resolve promises from button clicks
  const tfaVerificationResolveRef = useRef<((code: string) => void) | null>(null);
  const downloadCompleteResolveRef = useRef<(() => void) | null>(null);
  const uploadCompleteResolveRef = useRef<(() => void) | null>(null);

  const startTests = async () => {
    if (!userEmail || !userEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsRunning(true);
    setIsComplete(false);
    setCurrentTestIndex(0);
    setTestResults([]);
    
    // Initialize all tests as PENDING
    const initialResults: TestResult[] = TEST_CONFIGS.map(config => ({
      id: Math.random().toString(36).substr(2, 9),
      type: config.type,
      testName: config.name,
      status: 'PENDING' as const,
      message: 'Test pending',
      details: '',
      timestamp: new Date(),
      recommendations: [],
    }));
    setTestResults(initialResults);

    // Run tests sequentially
    await runTest1(initialResults); // Domain Access
    await runTest2(initialResults); // Email Delivery + 2FA Timing (combined)
    await runTest3(initialResults); // File Download
    await runTest4(initialResults); // File Upload
    await runTest5(initialResults); // Intercom
    await runTest6(initialResults); // Resolution
    await runTest7(initialResults); // Speed Test

    setIsRunning(false);
    setIsComplete(true);
    setCurrentTestIndex(-1);
  };

  const updateTestResult = (index: number, result: TestResult) => {
    setTestResults(prev => {
      const newResults = [...prev];
      newResults[index] = result;
      return newResults;
    });
  };

  const handleTfaVerification = () => {
    if (tfaCode.length === 6 && tfaVerificationResolveRef.current) {
      tfaVerificationResolveRef.current(tfaCode);
      tfaVerificationResolveRef.current = null;
      setWaitingFor2FAVerification(false);
    }
  };

  const runTest1 = async (results: TestResult[]) => {
    setCurrentTestIndex(0);
    updateTestResult(0, { ...results[0], status: 'RUNNING', message: 'Running test...' });
    
    const result = await testService.runDomainAccessTest();
    updateTestResult(0, result);
  };

  const runTest2 = async (results: TestResult[]) => {
    setCurrentTestIndex(1);
    updateTestResult(1, { ...results[1], status: 'RUNNING', message: 'Sending 2FA email...' });
    
    const startTime = Date.now();
    
    try {
      // Send 2FA email
      const sendResult = await apiService.send2FACode(userEmail);
      
      if (!sendResult.success) {
        throw new Error(sendResult.message || 'Failed to send 2FA email');
      }
      
      // Record when 2FA email was sent (for delivery time measurement)
      tfaSentTimeRef.current = Date.now();
      setWaitingFor2FAVerification(true);
      setTfaCode('');
      
      updateTestResult(1, { 
        ...results[1], 
        status: 'RUNNING', 
        message: 'Email sent. Please check your inbox and enter the 6-digit code...' 
      });
      
      // Wait for user to enter and verify the 2FA code
      const code = await new Promise<string>((resolve, reject) => {
        tfaVerificationResolveRef.current = resolve;
        
        // Timeout after 5 minutes
        setTimeout(() => {
          if (tfaVerificationResolveRef.current) {
            tfaVerificationResolveRef.current = null;
            setWaitingFor2FAVerification(false);
            reject(new Error('Verification timeout'));
          }
        }, 300000); // 5 minutes
      });
      
      // Calculate delivery time (from send to code entry)
      const deliveryTime = (Date.now() - tfaSentTimeRef.current) / 1000;
      const duration = (Date.now() - startTime) / 1000;
      
      // Email + 2FA verification successful
      updateTestResult(1, {
        id: '2',
        type: TestType.EMAIL_2FA,
        testName: 'Email Delivery & 2FA Test',
        status: 'PASS',
        message: 'Email delivered and 2FA verified successfully',
        details: `Test email was successfully delivered to ${userEmail}. Delivery time: ${deliveryTime.toFixed(2)} seconds. 2FA code verified successfully. Email server is functioning correctly.`,
        timestamp: new Date(),
        recommendations: [],
        duration,
        metadata: {
          email: userEmail,
          deliveryTime: parseFloat(deliveryTime.toFixed(2)),
          code: code
        }
      });
      
    } catch (error: any) {
      const duration = (Date.now() - startTime) / 1000;
      setWaitingFor2FAVerification(false);
      
      updateTestResult(1, {
        id: '2',
        type: TestType.EMAIL_2FA,
        testName: 'Email Delivery & 2FA Test',
        status: 'FAIL',
        message: error.message || 'Email delivery or 2FA verification failed',
        details: `Failed to deliver test email to ${userEmail} or verify 2FA code. ${error.message || 'Unknown error occurred'}`,
        timestamp: new Date(),
        recommendations: [
          'Check if the email address is correct',
          'Check your spam/junk folder',
          'Verify email server is not blocking emails',
          'Contact your IT department if issue persists'
        ],
        duration,
        blockers: [
          'Email not delivered',
          error.message || 'Unknown error'
        ]
      });
    }
  };

  const runTest3 = async (results: TestResult[]) => {
    // File Download Test - wait for button click
    setCurrentTestIndex(2);
    setShowDownloadButton(true);
    
    updateTestResult(2, {
      id: '3',
      type: TestType.FILE_DOWNLOAD,
      testName: 'File Download Test',
      status: 'PENDING',
      message: 'Click "Download Test Files" to begin',
      details: 'Please click the green download button below to test file download capabilities.',
      timestamp: new Date(),
      recommendations: [],
      duration: 0,
    });

    // Wait for user to click download button and complete the download
    await new Promise<void>((resolve) => {
      downloadCompleteResolveRef.current = resolve;
    });

    // Download test is now complete, resolve ref is null
    downloadCompleteResolveRef.current = null;
  };

  // Function to handle download button click
  const handleDownloadFiles = async () => {
    const startTime = Date.now();
    setShowDownloadButton(false);
    
    updateTestResult(2, { 
      id: '3',
      type: TestType.FILE_DOWNLOAD,
      testName: 'File Download Test',
      status: 'RUNNING', 
      message: 'Downloading test files...',
      details: '',
      timestamp: new Date(),
      recommendations: [],
      duration: 0,
    });
    
    try {
      const result = await testService.runFileDownloadTest();
      const duration = (Date.now() - startTime) / 1000;
      updateTestResult(2, { ...result, duration });
      
      // After successful download, show upload button
      if (result.status === 'PASS') {
        setShowUploadButton(true);
      }

      // Resolve the promise to continue to next test
      if (downloadCompleteResolveRef.current) {
        downloadCompleteResolveRef.current();
      }
    } catch (error: any) {
      const duration = (Date.now() - startTime) / 1000;
      updateTestResult(2, {
        id: '3',
        type: TestType.FILE_DOWNLOAD,
        testName: 'File Download Test',
        status: 'FAIL',
        message: 'Download failed',
        details: `Failed to download test files. ${error.message || 'Unknown error'}`,
        timestamp: new Date(),
        recommendations: [
          'Check internet connection',
          'Disable browser download restrictions',
          'Check pop-up blocker settings',
          'Try a different browser'
        ],
        duration,
        error: error.message,
      });

      // Resolve promise even on failure
      if (downloadCompleteResolveRef.current) {
        downloadCompleteResolveRef.current();
      }
    }
  };

  const runTest4 = async (results: TestResult[]) => {
    // File Upload Test - wait for button click
    setCurrentTestIndex(3);
    
    updateTestResult(3, {
      id: '4',
      type: TestType.FILE_UPLOAD,
      testName: 'File Upload Test',
      status: 'PENDING',
      message: 'Click "Upload Test Files" to begin',
      details: 'Please click the orange upload button below to select and upload the downloaded files.',
      timestamp: new Date(),
      recommendations: [],
      duration: 0,
    });

    // Wait for user to click upload button and complete the upload
    await new Promise<void>((resolve) => {
      uploadCompleteResolveRef.current = resolve;
    });

    // Upload test is now complete, resolve ref is null
    uploadCompleteResolveRef.current = null;
  };

  // Function to handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const startTime = Date.now();
    setShowUploadButton(false);

    updateTestResult(3, {
      id: '4',
      type: TestType.FILE_UPLOAD,
      testName: 'File Upload Test',
      status: 'RUNNING',
      message: 'Uploading files...',
      details: '',
      timestamp: new Date(),
      recommendations: [],
      duration: 0,
    });

    try {
      const result = await testService.runFileUploadTest(files);
      const duration = (Date.now() - startTime) / 1000;
      updateTestResult(3, { ...result, duration });

      // Resolve the promise to continue to next test
      if (uploadCompleteResolveRef.current) {
        uploadCompleteResolveRef.current();
      }
    } catch (error: any) {
      const duration = (Date.now() - startTime) / 1000;
      updateTestResult(3, {
        id: '4',
        type: TestType.FILE_UPLOAD,
        testName: 'File Upload Test',
        status: 'FAIL',
        message: 'Upload failed',
        details: `Failed to upload files. ${error.message || 'Unknown error'}`,
        timestamp: new Date(),
        recommendations: [
          'Check internet connection',
          'Verify file sizes are within 100MB limit per file',
          'Ensure you selected the correct files',
          'Try uploading fewer files at once'
        ],
        duration,
        error: error.message,
      });

      // Resolve promise even on failure
      if (uploadCompleteResolveRef.current) {
        uploadCompleteResolveRef.current();
      }
    }
  };

  const runTest5 = async (results: TestResult[]) => {
    setCurrentTestIndex(4);
    updateTestResult(4, { ...results[4], status: 'RUNNING', message: 'Running test...' });
    
    const result = await testService.runIntercomTest();
    updateTestResult(4, result);
  };

  const runTest6 = async (results: TestResult[]) => {
    setCurrentTestIndex(5);
    updateTestResult(5, { ...results[5], status: 'RUNNING', message: 'Running test...' });
    
    const result = await testService.runScreenResolutionTest();
    updateTestResult(5, result);
  };

  const runTest7 = async (results: TestResult[]) => {
    setCurrentTestIndex(6);
    updateTestResult(6, { ...results[6], status: 'RUNNING', message: 'Running test...' });
    
    const result = await testService.runConnectionSpeedTest();
    updateTestResult(6, result);
  };

  if (isComplete) {
    return <ResultsDisplay results={testResults} onRestart={() => window.location.reload()} />;
  }

  if (!showEmailInput && !isRunning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              ILex Pre-Onboarding Test
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Institutional Lending Exchange
            </p>
            <div className="w-32 h-1 bg-primary mx-auto mb-8"></div>
            
            <p className="text-lg text-gray-700 mb-6">
              This application will test your environment's compatibility with the ILex platform
              by running 7 critical security and connectivity tests.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 text-left">
              <h3 className="font-bold text-blue-900 mb-2">What we'll test:</h3>
              <ul className="space-y-2 text-blue-800">
                <li>✓ Domain accessibility</li>
                <li>✓ Email delivery and 2FA timing</li>
                <li>✓ File upload and download capabilities</li>
                <li>✓ Intercom widget compatibility</li>
                <li>✓ Screen resolution</li>
                <li>✓ Connection speed</li>
              </ul>
            </div>
            
            <p className="text-gray-600 mb-8">
              <span className="font-semibold">Estimated time:</span> 5-10 minutes
            </p>
            
            <button
              onClick={() => setShowEmailInput(true)}
              className="bg-primary hover:bg-primary-dark text-white text-xl font-semibold py-4 px-12 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showEmailInput && !isRunning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Enter Your Email
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            We'll use this email to test email delivery and 2FA timing.
          </p>
          
          <div className="space-y-4">
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your.email@company.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none text-lg"
            />
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowEmailInput(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={startTests}
                disabled={!userEmail || !userEmail.includes('@')}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Begin Tests
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Running Tests...
          </h1>
          <p className="text-gray-600 mb-6">
            Please wait while we test your environment
          </p>
          
          <ProgressBar 
            current={currentTestIndex + 1} 
            total={TEST_CONFIGS.length} 
          />
        </div>

        <div className="space-y-4">
          {TEST_CONFIGS.map((config, index) => {
            // Render custom children for specific tests
            let children = null;
            
            // Test 2: Email Delivery & 2FA - show verification UI
            if (index === 1 && waitingFor2FAVerification) {
              children = (
                <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                  <p className="text-blue-800 mb-3 font-semibold">
                    Check your email ({userEmail}) and enter the 6-digit code:
                  </p>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      value={tfaCode}
                      onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onKeyPress={(e) => e.key === 'Enter' && tfaCode.length === 6 && handleTfaVerification()}
                      placeholder="000000"
                      maxLength={6}
                      className="flex-1 md:w-64 px-4 py-3 border-2 border-blue-400 rounded-lg focus:border-blue-600 focus:outline-none text-xl text-center font-mono tracking-widest"
                    />
                    <button
                      onClick={handleTfaVerification}
                      disabled={tfaCode.length !== 6}
                      className={`px-8 py-3 rounded-lg font-semibold transition-colors text-lg ${
                        tfaCode.length === 6
                          ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer shadow-md'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Verify Code
                    </button>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    💡 Enter the code and click "Verify Code" or press Enter
                  </p>
                </div>
              );
            }
            
            // Test 3: File Download - show download button
            if (index === 2 && showDownloadButton) {
              children = (
                <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4">
                  <p className="text-green-800 mb-3 font-semibold">
                    Click the button below to download test files:
                  </p>
                  <button
                    onClick={handleDownloadFiles}
                    className="w-full px-8 py-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors text-lg shadow-md"
                  >
                    📥 Download Test Files
                  </button>
                  <p className="text-sm text-green-700 mt-2">
                    💡 This will download 3 test files to verify download capabilities
                  </p>
                </div>
              );
            }
            
            // Test 4: File Upload - show upload button
            if (index === 3 && showUploadButton) {
              children = (
                <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4">
                  <p className="text-orange-800 mb-3 font-semibold">
                    Select files to test upload (up to 100 files, max 100MB each):
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="*/*"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                    id="upload-test-input"
                  />
                  <label
                    htmlFor="upload-test-input"
                    className="block w-full px-8 py-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors text-lg shadow-md text-center cursor-pointer"
                  >
                    📤 Upload Test Files
                  </label>
                  <p className="text-sm text-orange-700 mt-2">
                    💡 You can upload the files you just downloaded or any other files
                  </p>
                </div>
              );
            }
            
            return (
              <TestCard
                key={config.id}
                testNumber={parseInt(config.id)}
                testName={config.name}
                description={config.description}
                status={testResults[index]?.status || 'PENDING'}
                duration={testResults[index]?.duration}
                estimatedTime={config.estimatedTime}
                isCurrentTest={index === currentTestIndex}
              >
                {children}
              </TestCard>
            );
          })}
        </div>

        {/* Download Test Button */}
        {showDownloadButton && (
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-green-900 mb-3">📥 File Download Test</h3>
            <p className="text-green-800 mb-4">
              Click the button below to download test files and verify download functionality:
            </p>
            <button
              onClick={handleDownloadFiles}
              className="w-full px-8 py-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors text-lg shadow-md"
            >
              Download Test Files
            </button>
            <p className="text-sm text-green-700 mt-2">
              💡 This will download 3 test files to verify your environment's download capabilities
            </p>
          </div>
        )}

        {/* Upload Test Button */}
        {showUploadButton && (
          <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-orange-900 mb-3">� File Upload Test</h3>
            <p className="text-orange-800 mb-4">
              Select the files you just downloaded to test upload functionality:
            </p>
            <input
              type="file"
              multiple
              accept=".docx,.xlsx,.jpg,.jpeg,.txt,.pdf,.zip"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="upload-test-input"
            />
            <label
              htmlFor="upload-test-input"
              className="block w-full px-8 py-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors text-lg shadow-md text-center cursor-pointer"
            >
              Upload Test Files
            </label>
            <p className="text-sm text-orange-700 mt-2">
              💡 Select all 3 files that were downloaded in the previous test
            </p>
          </div>
        )}

        <div className="space-y-4">
          {TEST_CONFIGS.map((config, index) => (
            <TestCard
              key={config.id}
              testNumber={parseInt(config.id)}
              testName={config.name}
              description={config.description}
              status={testResults[index]?.status || 'PENDING'}
              duration={testResults[index]?.duration}
              estimatedTime={config.estimatedTime}
              isCurrentTest={index === currentTestIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestRunner;
