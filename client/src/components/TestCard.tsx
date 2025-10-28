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
    FAIL: '✕',
    WARNING: '!',
    RUNNING: '...',
    PENDING: '—',
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
      className={`bg-white rounded-lg shadow-sm p-6 mb-4 border transition-all duration-200 ${
        isCurrentTest ? 'border-primary shadow-md' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-gray-100 text-sm font-semibold text-gray-600">
              {testNumber}
            </span>
            <h3 className="text-lg font-semibold text-gray-900">{testName}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
          
          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
            <span>Est: {estimatedTime}</span>
            {duration !== undefined && (
              <span>Actual: {duration.toFixed(2)}s</span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center ml-6">
          <div
            className={`${statusColors[status]} text-white rounded w-20 h-10 flex items-center justify-center text-sm font-semibold`}
          >
            {statusText[status]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCard;
