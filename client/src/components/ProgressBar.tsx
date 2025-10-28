import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Progress: {current} of {total} tests
        </span>
        <span className="text-sm font-semibold text-primary">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
