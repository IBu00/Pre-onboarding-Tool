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
  const [emailCode, setEmailCode] = useState('');
  const [tfaCode, setTfaCode] = useState('');
  const [waitingForEmailVerification, setWaitingForEmailVerification] = useState(false);
  const [waitingFor2FAVerification, setWaitingFor2FAVerification] = useState(false);
  
  // Refs to store email send timestamp for timing measurement
  const emailSentTimeRef = useRef<number>(0);
  const tfaSentTimeRef = useRef<number>(0);
  
  // Refs to resolve promises from button clicks
  const emailVerificationResolveRef = useRef<((code: string) => void) | null>(null);
  const tfaVerificationResolveRef = useRef<((code: string) => void) | null>(null);

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

  const handleEmailVerification = () => {
    if (emailCode.length === 6 && emailVerificationResolveRef.current) {
      emailVerificationResolveRef.current(emailCode);
      emailVerificationResolveRef.current = null;
      setWaitingForEmailVerification(false);
    }
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
    updateTestResult(1, { ...results[1], status: 'RUNNING', message: 'Sending test email...' });
    
    const startTime = Date.now();
    
    try {
      // Send test email
      const sendResult = await apiService.sendTestEmail(userEmail);
      
      if (!sendResult.success) {
        throw new Error(sendResult.message || 'Failed to send email');
      }
      
      // Record when email was sent
      emailSentTimeRef.current = Date.now();
      setWaitingForEmailVerification(true);
      setEmailCode('');
      
      updateTestResult(1, { 
        ...results[1], 
        status: 'RUNNING', 
        message: 'Email sent. Please check your inbox and enter the code...' 
      });
      
      // Wait for user to enter and verify the code
      const code = await new Promise<string>((resolve, reject) => {
        emailVerificationResolveRef.current = resolve;
        
        // Timeout after 5 minutes
        setTimeout(() => {
          if (emailVerificationResolveRef.current) {
            emailVerificationResolveRef.current = null;
            setWaitingForEmailVerification(false);
            reject(new Error('Verification timeout'));
          }
        }, 300000); // 5 minutes
      });
      
      // Calculate delivery time
      const deliveryTime = (Date.now() - emailSentTimeRef.current) / 1000;
      const duration = (Date.now() - startTime) / 1000;
      
      // Email was delivered successfully
      updateTestResult(1, {
        id: '2',
        type: TestType.EMAIL_DELIVERY,
        testName: 'Email Delivery Test',
        status: 'PASS',
        message: 'Email delivered successfully',
        details: `Test email was successfully delivered to ${userEmail}. Delivery time: ${deliveryTime.toFixed(2)} seconds. Email server is functioning correctly and emails are being delivered without issues.`,
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
      setWaitingForEmailVerification(false);
      
      updateTestResult(1, {
        id: '2',
        type: TestType.EMAIL_DELIVERY,
        testName: 'Email Delivery Test',
        status: 'FAIL',
        message: error.message || 'Email delivery failed',
        details: `Failed to deliver test email to ${userEmail}. ${error.message || 'Unknown error occurred'}`,
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
    setCurrentTestIndex(2);
    updateTestResult(2, { ...results[2], status: 'RUNNING', message: 'Sending 2FA code...' });
    
    const startTime = Date.now();
    
    try {
      // Send 2FA code
      const sendResult = await apiService.send2FACode(userEmail);
      
      if (!sendResult.success) {
        throw new Error(sendResult.message || 'Failed to send 2FA code');
      }
      
      // Record when 2FA was sent
      tfaSentTimeRef.current = Date.now();
      setWaitingFor2FAVerification(true);
      setTfaCode('');
      
      updateTestResult(2, { 
        ...results[2], 
        status: 'RUNNING', 
        message: '2FA code sent. Waiting for verification...' 
      });
      
      // Wait for user to enter and verify the code
      const code = await new Promise<string>((resolve, reject) => {
        tfaVerificationResolveRef.current = resolve;
        
        // Timeout after 5 minutes
        setTimeout(() => {
          if (tfaVerificationResolveRef.current) {
            tfaVerificationResolveRef.current = null;
            setWaitingFor2FAVerification(false);
            reject(new Error('2FA verification timeout'));
          }
        }, 300000); // 5 minutes
      });
      
      // Calculate delivery time (this is the KEY metric for 2FA)
      const deliveryTime = (Date.now() - tfaSentTimeRef.current) / 1000;
      const duration = (Date.now() - startTime) / 1000;
      
      // Determine status based on delivery time
      let status: 'PASS' | 'WARNING' | 'FAIL';
      let message: string;
      let recommendations: string[] = [];
      
      if (deliveryTime <= 5) {
        status = 'PASS';
        message = `Excellent! 2FA code delivered in ${deliveryTime.toFixed(2)} seconds`;
      } else if (deliveryTime <= 30) {
        status = 'WARNING';
        message = `2FA code delivered in ${deliveryTime.toFixed(2)} seconds (acceptable but slower than optimal)`;
        recommendations = [
          '2FA delivery time is acceptable but could be improved',
          'Consider optimizing email server settings for faster delivery',
          'Users may experience slight delays during login'
        ];
      } else {
        status = 'FAIL';
        message = `2FA code delivery is too slow: ${deliveryTime.toFixed(2)} seconds`;
        recommendations = [
          'Critical: 2FA delivery time exceeds acceptable limits',
          'Users will experience significant delays during authentication',
          'Email server optimization required',
          'Consider alternative 2FA delivery methods (SMS, authenticator app)'
        ];
      }
      
      updateTestResult(2, {
        id: '3',
        type: TestType.EMAIL_2FA,
        testName: 'Email 2FA Timing Test',
        status,
        message,
        details: `2FA code was delivered to ${userEmail} in ${deliveryTime.toFixed(2)} seconds. ${status === 'PASS' ? 'This meets the requirement for secure and timely authentication.' : status === 'WARNING' ? 'This is within acceptable limits but may cause minor user experience issues.' : 'This is too slow for reliable 2FA authentication.'}`,
        timestamp: new Date(),
        recommendations,
        duration,
        metadata: {
          email: userEmail,
          deliveryTime: parseFloat(deliveryTime.toFixed(2)),
          code: code,
          threshold: deliveryTime <= 5 ? 'optimal' : deliveryTime <= 30 ? 'acceptable' : 'too-slow'
        }
      });
      
    } catch (error: any) {
      const duration = (Date.now() - startTime) / 1000;
      setWaitingFor2FAVerification(false);
      
      updateTestResult(2, {
        id: '3',
        type: TestType.EMAIL_2FA,
        testName: 'Email 2FA Timing Test',
        status: 'FAIL',
        message: error.message || '2FA delivery failed',
        details: `Failed to deliver 2FA code to ${userEmail}. ${error.message || 'Unknown error occurred'}`,
        timestamp: new Date(),
        recommendations: [
          'Check if the email address is correct',
          'Check your spam/junk folder',
          'Verify email server is not blocking 2FA emails',
          'Contact your IT department if issue persists'
        ],
        duration,
        blockers: [
          '2FA code not delivered',
          error.message || 'Unknown error'
        ]
      });
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
            <h3 className="font-bold text-yellow-900 mb-3">📧 Email Verification Required</h3>
            <p className="text-yellow-800 mb-4">
              Check your email ({userEmail}) and enter the 6-digit code below:
            </p>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyPress={(e) => e.key === 'Enter' && emailCode.length === 6 && handleEmailVerification()}
                placeholder="000000"
                maxLength={6}
                className="flex-1 md:w-64 px-4 py-3 border-2 border-yellow-400 rounded-lg focus:border-yellow-600 focus:outline-none text-xl text-center font-mono tracking-widest"
              />
              <button
                onClick={handleEmailVerification}
                disabled={emailCode.length !== 6}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors text-lg ${
                  emailCode.length === 6
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer shadow-md'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Verify Code
              </button>
            </div>
            <p className="text-sm text-yellow-700 mt-3">
              💡 Enter the 6-digit code from your email and click "Verify Code" or press Enter
            </p>
          </div>
        )}

        {waitingFor2FAVerification && (
          <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-3">🔐 2FA Code Required</h3>
            <p className="text-blue-800 mb-4">
              Check your email ({userEmail}) and enter the 6-digit 2FA code below:
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
            <p className="text-sm text-blue-700 mt-3">
              💡 This test measures 2FA delivery speed. Enter the code quickly for accurate timing!
            </p>
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
              accept=".docx,.xlsx,.jpg,.jpeg,.txt,.pdf,.zip"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="w-full px-4 py-3 border-2 border-green-400 rounded-lg focus:border-green-600 focus:outline-none bg-white cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600"
            />
            <p className="text-sm text-green-700 mt-2">
              💡 Tip: Select all 3 files that were downloaded in the previous test (Word, Excel, and Image)
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
