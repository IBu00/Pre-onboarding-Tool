import React, { useEffect } from 'react';
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

  // Scroll to top when results are displayed
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDownloadPDF = () => {
    generatePDFReport(results);
  };

  return (
    <div className="min-h-screen bg-primary p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6 border border-gray-200">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Test Results Summary
          </h1>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{results.length}</div>
              <div className="text-xs text-gray-600 mt-1">Total Tests</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{passCount}</div>
              <div className="text-xs text-gray-600 mt-1">Passed</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
              <div className="text-2xl font-bold text-yellow-700">{warnCount}</div>
              <div className="text-xs text-gray-600 mt-1">Warnings</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
              <div className="text-2xl font-bold text-red-700">{failCount}</div>
              <div className="text-xs text-gray-600 mt-1">Failed</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{totalDuration.toFixed(1)}s</div>
              <div className="text-xs text-gray-600 mt-1">Duration</div>
            </div>
          </div>

          {/* Overall Status */}
          <div className={`${statusColor} text-white rounded p-6 mb-6 text-center`}>
            <h2 className="text-xl md:text-2xl font-bold mb-2">{overallStatus}</h2>
            {failCount === 0 && warnCount === 0 && (
              <p className="text-sm mt-2">
                Your environment is fully compatible with the iLex platform.
              </p>
            )}
            {failCount === 0 && warnCount > 0 && (
              <p className="text-sm mt-2">
                Your environment meets minimum requirements. Some optimizations recommended.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded transition-colors"
            >
              Download Test Report
            </button>
            <button
              onClick={onRestart}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded transition-colors"
            >
              Start New Test
            </button>
            {failCount === 0 && (
              <button
                onClick={() => window.open('https://www.institutionallendingexchange.com/', '_blank')}
                className="flex-1 bg-accent hover:bg-green-700 text-white font-semibold py-3 px-6 rounded transition-colors animate-glow"
              >
                Proceed to iLex
              </button>
            )}
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {index + 1}. {result.testName}
                  </h3>
                  {result.duration && (
                    <span className="text-xs text-gray-500">
                      Duration: {result.duration.toFixed(2)}s
                    </span>
                  )}
                </div>
                <div
                  className={`px-3 py-1 rounded text-white text-sm font-medium ${
                    result.status === 'PASS' ? 'bg-green-600' :
                    result.status === 'FAIL' ? 'bg-red-600' :
                    'bg-yellow-600'
                  }`}
                >
                  {result.status}
                </div>
              </div>

              {/* Details */}
              <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Details:</h4>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </div>

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Error */}
              {result.error && (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Error:</h4>
                  <p className="text-xs text-gray-700">{result.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        {failCount > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6 text-center border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need Assistance?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Our support team can help resolve critical failures.
            </p>
            <a
              href="mailto:support@ilex.sg"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded transition-colors text-sm"
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
