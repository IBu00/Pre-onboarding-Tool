import React from 'react';
import { TestResult } from '../types/test.types';
import { generatePDFReport } from '../utils/pdfGenerator';

interface ResultsDisplayProps {
  results: TestResult[];
  onRestart: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onRestart }) => {
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warnCount = results.filter(r => r.status === 'WARNING').length;
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

  const overallStatus = failCount > 0 ? 'NEEDS ATTENTION' : warnCount > 0 ? 'PASSED WITH WARNINGS' : 'ALL PASSED';
  const statusColor = failCount > 0 ? 'bg-red-500' : warnCount > 0 ? 'bg-yellow-500' : 'bg-green-500';

  const handleDownloadPDF = () => {
    generatePDFReport(results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Test Results
          </h1>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-800">{results.length}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{passCount}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">{warnCount}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{failCount}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{totalDuration.toFixed(1)}s</div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>

          {/* Overall Status */}
          <div className={`${statusColor} text-white rounded-xl p-6 mb-6 text-center`}>
            <h2 className="text-2xl md:text-3xl font-bold">{overallStatus}</h2>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 bg-primary hover:bg-primary-dark text-white text-lg font-semibold py-4 px-8 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              📄 Download PDF Report
            </button>
            <button
              onClick={onRestart}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-lg font-semibold py-4 px-8 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🔄 Start New Test
            </button>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {index + 1}. {result.testName}
                  </h3>
                  {result.duration && (
                    <span className="text-sm text-gray-500">
                      Duration: {result.duration.toFixed(2)}s
                    </span>
                  )}
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-white font-semibold ${
                    result.status === 'PASS' ? 'bg-green-500' :
                    result.status === 'FAIL' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`}
                >
                  {result.status}
                </div>
              </div>

              {/* Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Details:</h4>
                <pre className="text-sm text-gray-600 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </div>

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-blue-800">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Error */}
              {result.error && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Error:</h4>
                  <p className="text-sm text-red-800">{result.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        {failCount > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Need Help?
            </h3>
            <p className="text-gray-600 mb-4">
              If you have critical failures, our support team can help you resolve them.
            </p>
            <a
              href="mailto:support@ilex.sg"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Contact Support
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
