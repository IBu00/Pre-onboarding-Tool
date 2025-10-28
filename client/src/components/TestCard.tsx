import React from 'react';
import { TestStatus } from '../types/test.types';

interface TestCardProps {
  testNumber: number;
  testName: string;
  description: string;
  status: TestStatus;
  duration?: number;
  estimatedTime: string;
  isCurrentTest: boolean;
  children?: React.ReactNode;
}

const TestCard: React.FC<TestCardProps> = ({
  testNumber,
  testName,
  description,
  status,
  duration,
  estimatedTime,
  isCurrentTest,
  children,
}) => {
  const statusColors = {
    PASS: 'bg-green-500',
    FAIL: 'bg-red-500',
    WARNING: 'bg-yellow-500',
    RUNNING: 'bg-blue-500 animate-pulse',
    PENDING: 'bg-gray-300',
  };

  const statusIcons = {
    PASS: '✓',
    FAIL: '✗',
    WARNING: '⚠',
    RUNNING: '⟳',
    PENDING: '○',
  };

  const statusText = {
    PASS: 'Passed',
    FAIL: 'Failed',
    WARNING: 'Warning',
    RUNNING: 'Running...',
    PENDING: 'Pending',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 mb-4 border-2 transition-all duration-300 ${
        isCurrentTest ? 'border-primary shadow-lg scale-105' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-gray-400">#{testNumber}</span>
            <h3 className="text-xl font-semibold text-gray-800">{testName}</h3>
          </div>
          <p className="text-sm text-gray-600 mt-2 ml-10">{description}</p>
          
          {children && (
            <div className="ml-10 mt-4">
              {children}
            </div>
          )}
          
          <div className="flex items-center space-x-4 ml-10 mt-3">
            <span className="text-xs text-gray-500">
              Estimated: {estimatedTime}
            </span>
            {duration !== undefined && (
              <span className="text-xs text-gray-500">
                Actual: {duration.toFixed(2)}s
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center ml-4">
          <div
            className={`${statusColors[status]} text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold shadow-lg`}
          >
            {statusIcons[status]}
          </div>
          <span className={`mt-2 text-sm font-medium ${
            status === 'PASS' ? 'text-green-600' :
            status === 'FAIL' ? 'text-red-600' :
            status === 'WARNING' ? 'text-yellow-600' :
            status === 'RUNNING' ? 'text-blue-600' :
            'text-gray-500'
          }`}>
            {statusText[status]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TestCard;
