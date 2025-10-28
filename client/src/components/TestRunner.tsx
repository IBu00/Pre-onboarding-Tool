import React, { useState } from 'react';
import { TestResult, TestType } from '../types/test.types';
import { TESTS, TestConfig } from '../config/testConfig';
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
  const [emailCode, setEmailCode] = useState('');
  const [tfaCode, setTfaCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [tfaSent, setTfaSent] = useState(false);
  const [waitingForEmailVerification, setWaitingForEmailVerification] = useState(false);
  const [waitingFor2FAVerification, setWaitingFor2FAVerification] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);

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
    await runTest2(initialResults); // Email Delivery
    await runTest3(initialResults); // Email 2FA
    await runTest4(initialResults); // File Download
    await runTest5(initialResults); // File Upload
    await runTest6(initialResults); // Intercom
    await runTest7(initialResults); // Resolution
    await runTest8(initialResults); // Speed Test

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

  const runTest1 = async (results: TestResult[]) => {
    setCurrentTestIndex(0);
    updateTestResult(0, { ...results[0], status: 'RUNNING', message: 'Running test...' });
    
    const result = await testService.runDomainAccessTest();
    updateTestResult(0, result);
  };

  const runTest2 = async (results: TestResult[]) => {
    setCurrentTestIndex(1);
    updateTestResult(1, { ...results[1], status: 'RUNNING' });
    
    const startTime = Date.now();
    
    try {
      // Send test email
      await apiService.sendTestEmail(userEmail);
      setEmailSent(true);
      setWaitingForEmailVerification(true);
      
      // Wait for user to enter code (with timeout)
      const verified = await new Promise<boolean>((resolve) => {
        const checkInterval = setInterval(() => {
          if (emailCode && emailCode.length === 6) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 500);
        
        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(false);
        }, 300000);
      });
      
      if (verified) {
        const verifyResult = await apiService.verifyEmailCode(userEmail, emailCode);
        const duration = (Date.now() - startTime) / 1000;
        
        updateTestResult(1, {
          id: '2',
          type: TestType.EMAIL_DELIVERY,
          testName: 'Email Delivery Test',
          status: 'PASS',
          message: 'Email delivered successfully',
          details: JSON.stringify({
            email: userEmail,
            deliveryTime: verifyResult.deliveryTime,
            sent: true,
          }),
          timestamp: new Date(),
          recommendations: [],
          duration,
        });
      } else {
        const duration = (Date.now() - startTime) / 1000;
        updateTestResult(1, {
          id: '2',
          type: TestType.EMAIL_DELIVERY,
          testName: 'Email Delivery Test',
          status: 'FAIL',
          message: 'Email verification timed out',
          details: JSON.stringify({ email: userEmail, sent: true }),
          timestamp: new Date(),
          recommendations: ['Email verification timed out. Check email delivery.'],
          duration,
        });
      }
    } catch (error: any) {
      const duration = (Date.now() - startTime) / 1000;
      updateTestResult(1, {
        id: '2',
        type: TestType.EMAIL_DELIVERY,
        testName: 'Email Delivery Test',
        status: 'FAIL',
        message: error.message || 'Failed to send test email',
        details: JSON.stringify({ email: userEmail, sent: false }),
        timestamp: new Date(),
        recommendations: ['Failed to send test email. Check email configuration.'],
        duration,
        error: error.message,
      });
    } finally {
      setWaitingForEmailVerification(false);
    }
  };

  const runTest3 = async (results: TestResult[]) => {
    setCurrentTestIndex(2);
    updateTestResult(2, { ...results[2], status: 'RUNNING' });
    
    const startTime = Date.now();
    
    try {
      // Send 2FA code
      await apiService.send2FACode(userEmail);
      setTfaSent(true);
      setWaitingFor2FAVerification(true);
      
      // Wait for user to enter code
      const verified = await new Promise<boolean>((resolve) => {
        const checkInterval = setInterval(() => {
          if (tfaCode && tfaCode.length === 6) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 500);
        
        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(false);
        }, 300000);
      });
      
      if (verified) {
        const verifyResult = await apiService.verify2FACode(userEmail, tfaCode);
        const duration = (Date.now() - startTime) / 1000;
        
        updateTestResult(2, {
          id: '3',
          type: TestType.EMAIL_2FA,
          testName: 'Email 2FA Timing Test',
          status: verifyResult.status,
          message: `2FA delivered in ${verifyResult.deliveryTime}s`,
          details: JSON.stringify({
            email: userEmail,
            deliveryTime: verifyResult.deliveryTime,
            sent: true,
            verified: true,
          }),
          timestamp: new Date(),
          recommendations: verifyResult.deliveryTime > 30 
            ? ['2FA email delivery is slow. Consider optimizing email service.']
            : [],
          duration,
        });
      } else {
        const duration = (Date.now() - startTime) / 1000;
        updateTestResult(2, {
          id: '3',
          type: TestType.EMAIL_2FA,
          testName: 'Email 2FA Timing Test',
          status: 'FAIL',
          message: '2FA verification timed out',
          details: JSON.stringify({ email: userEmail, sent: true, verified: false }),
          timestamp: new Date(),
          recommendations: ['2FA verification timed out.'],
          duration,
        });
      }
    } catch (error: any) {
      const duration = (Date.now() - startTime) / 1000;
      updateTestResult(2, {
        id: '3',
        type: TestType.EMAIL_2FA,
        testName: 'Email 2FA Timing Test',
        status: 'FAIL',
        message: error.message || 'Failed to send 2FA code',
        details: JSON.stringify({ email: userEmail, sent: false }),
        timestamp: new Date(),
        recommendations: ['Failed to send 2FA code.'],
        duration,
        error: error.message,
      });
    } finally {
      setWaitingFor2FAVerification(false);
    }
  };

  const runTest4 = async (results: TestResult[]) => {
    // File Download Test
    setCurrentTestIndex(3);
    updateTestResult(3, { ...results[3], status: 'RUNNING', message: 'Downloading test files...' });
    
    try {
      const result = await testService.runFileDownloadTest();
      updateTestResult(3, result);
    } catch (error: any) {
      updateTestResult(3, {
        id: '4',
        type: TestType.FILE_DOWNLOAD,
        testName: 'File Download Test',
        status: 'FAIL',
        message: 'Download test failed',
        details: JSON.stringify({ error: error.message }),
        timestamp: new Date(),
        recommendations: ['File download failed. Check network connection.'],
        duration: 0,
        error: error.message,
      });
    }
  };

  const runTest5 = async (results: TestResult[]) => {
    // File Upload Test
    setCurrentTestIndex(4);
    updateTestResult(4, { ...results[4], status: 'RUNNING', message: 'Waiting for file selection...' });
    
    // Wait for user to select files
    // This test will be triggered by the file input onChange event
    // For now, we'll show a message prompting the user
    updateTestResult(4, {
      id: '5',
      type: TestType.FILE_UPLOAD,
      testName: 'File Upload Test',
      status: 'PENDING',
      message: 'Please select and upload the downloaded files',
      details: 'Use the file input below to select the files you just downloaded',
      timestamp: new Date(),
      recommendations: ['Select the downloaded files to proceed with upload test'],
      duration: 0,
    });
  };

  // Separate function to handle file upload when user selects files
  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    updateTestResult(4, {
      id: '5',
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
      updateTestResult(4, result);
    } catch (error: any) {
      updateTestResult(4, {
        id: '5',
        type: TestType.FILE_UPLOAD,
        testName: 'File Upload Test',
        status: 'FAIL',
        message: 'Upload test failed',
        details: JSON.stringify({ error: error.message }),
        timestamp: new Date(),
        recommendations: ['File upload failed. Check network connection and file size limits.'],
        duration: 0,
        error: error.message,
      });
    }
  };

  const runTest6 = async (results: TestResult[]) => {
    setCurrentTestIndex(5);
    updateTestResult(5, { ...results[5], status: 'RUNNING', message: 'Running test...' });
    
    const result = await testService.runIntercomTest();
    updateTestResult(5, result);
  };

  const runTest7 = async (results: TestResult[]) => {
    setCurrentTestIndex(6);
    updateTestResult(6, { ...results[6], status: 'RUNNING', message: 'Running test...' });
    
    const result = await testService.runScreenResolutionTest();
    updateTestResult(6, result);
  };

  const runTest8 = async (results: TestResult[]) => {
    setCurrentTestIndex(7);
    updateTestResult(7, { ...results[7], status: 'RUNNING', message: 'Running test...' });
    
    const result = await testService.runConnectionSpeedTest();
    updateTestResult(7, result);
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
              by running 8 critical security and connectivity tests.
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

        {waitingForEmailVerification && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-yellow-900 mb-3">Email Verification Required</h3>
            <p className="text-yellow-800 mb-4">
              Check your email ({userEmail}) and enter the 6-digit code below:
            </p>
            <input
              type="text"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="w-full md:w-64 px-4 py-2 border-2 border-yellow-400 rounded-lg focus:border-yellow-600 focus:outline-none text-lg text-center font-mono"
            />
          </div>
        )}

        {waitingFor2FAVerification && (
          <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-3">2FA Code Required</h3>
            <p className="text-blue-800 mb-4">
              Check your email ({userEmail}) and enter the 6-digit 2FA code below:
            </p>
            <input
              type="text"
              value={tfaCode}
              onChange={(e) => setTfaCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="w-full md:w-64 px-4 py-2 border-2 border-blue-400 rounded-lg focus:border-blue-600 focus:outline-none text-lg text-center font-mono"
            />
          </div>
        )}

        {/* File Upload Section for Test 5 */}
        {currentTestIndex >= 4 && testResults[4]?.status === 'PENDING' && (
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-green-900 mb-3">📁 File Upload Test</h3>
            <p className="text-green-800 mb-4">
              Please select the files you just downloaded to test the upload functionality:
            </p>
            <input
              type="file"
              multiple
              accept=".txt"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="w-full px-4 py-3 border-2 border-green-400 rounded-lg focus:border-green-600 focus:outline-none bg-white cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600"
            />
            <p className="text-sm text-green-700 mt-2">
              💡 Tip: Select all 3 files that were downloaded in the previous test
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
