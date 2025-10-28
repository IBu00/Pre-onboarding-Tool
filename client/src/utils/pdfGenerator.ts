import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TestResult } from '../types/test.types';

export const generatePDFReport = (testResults: TestResult[]): void => {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(217, 99, 2); // Primary color #d96302
  doc.text('Pre-Onboarding Test Report', 20, 25);
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Institutional Lending Exchange', 20, 35);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 42);
  
  // Add line
  doc.setDrawColor(217, 99, 2);
  doc.setLineWidth(0.5);
  doc.line(20, 47, 190, 47);
  
  // Summary Section
  const passCount = testResults.filter(t => t.status === 'PASS').length;
  const failCount = testResults.filter(t => t.status === 'FAIL').length;
  const warnCount = testResults.filter(t => t.status === 'WARNING').length;
  const totalDuration = testResults.reduce((sum, t) => sum + (t.duration || 0), 0);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Test Summary', 20, 58);
  
  autoTable(doc, {
    startY: 63,
    head: [['Metric', 'Value']],
    body: [
      ['Total Tests', testResults.length.toString()],
      ['Passed', `${passCount} (${Math.round(passCount / testResults.length * 100)}%)`],
      ['Warnings', `${warnCount} (${Math.round(warnCount / testResults.length * 100)}%)`],
      ['Failed', `${failCount} (${Math.round(failCount / testResults.length * 100)}%)`],
      ['Total Duration', `${totalDuration.toFixed(2)}s`],
      ['Overall Status', failCount > 0 ? 'NEEDS ATTENTION' : warnCount > 0 ? 'PASSED WITH WARNINGS' : 'ALL PASSED'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [217, 99, 2], textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
  });
  
  // Overall Status Box
  const finalY = (doc as any).lastAutoTable.finalY || 110;
  
  const overallStatus = failCount > 0 ? 'NEEDS ATTENTION' : warnCount > 0 ? 'PASSED WITH WARNINGS' : 'ALL PASSED';
  const statusColor = failCount > 0 ? [220, 38, 38] : warnCount > 0 ? [234, 179, 8] : [34, 197, 94];
  
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(20, finalY + 10, 170, 15, 3, 3, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(overallStatus, 105, finalY + 20, { align: 'center' });
  
  // Detailed Results
  doc.addPage();
  doc.setFontSize(18);
  doc.setTextColor(217, 99, 2);
  doc.text('Detailed Test Results', 20, 20);
  
  let yPos = 30;
  
  testResults.forEach((result, index) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Test number and name
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. ${result.testName}`, 20, yPos);
    
    // Status badge
    const statusColors: Record<string, [number, number, number]> = {
      PASS: [34, 197, 94],
      WARNING: [234, 179, 8],
      FAIL: [220, 38, 38],
    };
    
    const color = statusColors[result.status] || [128, 128, 128];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(150, yPos - 4, 30, 8, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(result.status, 165, yPos + 2, { align: 'center' });
    
    yPos += 8;
    
    // Duration
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    if (result.duration) {
      doc.text(`Duration: ${result.duration.toFixed(2)}s`, 25, yPos);
    }
    
    yPos += 6;
    
    // Details - use the result.details string (which is human-readable)
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    if (result.details && typeof result.details === 'string') {
      // Use the details string directly (it's already formatted for display)
      const splitDetails = doc.splitTextToSize(result.details, 160);
      doc.text(splitDetails, 25, yPos);
      yPos += splitDetails.length * 4 + 2;
    }
    
    // Metadata (if present and relevant)
    if (result.metadata && Object.keys(result.metadata).length > 0) {
      const metadataText = formatMetadata(result.metadata);
      if (metadataText) {
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        const splitMetadata = doc.splitTextToSize(metadataText, 160);
        doc.text(splitMetadata, 25, yPos);
        yPos += splitMetadata.length * 3.5 + 2;
      }
    }
    
    // Recommendations
    if (result.recommendations && result.recommendations.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(217, 99, 2);
      doc.text('Recommendations:', 25, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      result.recommendations.forEach(rec => {
        const splitRec = doc.splitTextToSize(`• ${rec}`, 155);
        doc.text(splitRec, 30, yPos);
        yPos += splitRec.length * 4 + 1;
      });
    }
    
    // Error message if present
    if (result.error) {
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'italic');
      const splitError = doc.splitTextToSize(`Error: ${result.error}`, 155);
      doc.text(splitError, 25, yPos);
      yPos += splitError.length * 4;
    }
    
    yPos += 8;
    
    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(20, yPos, 190, yPos);
    yPos += 6;
  });
  
  // Recommendations Page
  doc.addPage();
  doc.setFontSize(18);
  doc.setTextColor(217, 99, 2);
  doc.text('Action Items & Next Steps', 20, 20);
  
  yPos = 35;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  const failedTests = testResults.filter(t => t.status === 'FAIL');
  const warningTests = testResults.filter(t => t.status === 'WARNING');
  
  if (failedTests.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('⚠ Critical Issues (Must Fix):', 20, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    failedTests.forEach(test => {
      doc.text(`• ${test.testName}`, 25, yPos);
      yPos += 6;
      test.recommendations.forEach(rec => {
        const splitRec = doc.splitTextToSize(`  - ${rec}`, 155);
        doc.text(splitRec, 30, yPos);
        yPos += splitRec.length * 4 + 1;
      });
      yPos += 3;
    });
    yPos += 5;
  }
  
  if (warningTests.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(234, 179, 8);
    doc.text('⚡ Warnings (Recommended to Fix):', 20, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    warningTests.forEach(test => {
      doc.text(`• ${test.testName}`, 25, yPos);
      yPos += 6;
      test.recommendations.forEach(rec => {
        const splitRec = doc.splitTextToSize(`  - ${rec}`, 155);
        doc.text(splitRec, 30, yPos);
        yPos += splitRec.length * 4 + 1;
      });
      yPos += 3;
    });
  }
  
  if (failedTests.length === 0 && warningTests.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(34, 197, 94);
    doc.text('✓ All tests passed successfully!', 20, yPos);
    yPos += 8;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Your environment is ready for onboarding to ILex platform.', 20, yPos);
  }
  
  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Institutional Lending Exchange - Pre-Onboarding Test Report',
      105,
      285,
      { align: 'center' }
    );
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }
  
  // Save the PDF
  doc.save(`ilex-preonboarding-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Helper function to format metadata object (separate from details)
const formatMetadata = (metadata: any): string => {
  if (!metadata || Object.keys(metadata).length === 0) {
    return '';
  }
  
  const lines: string[] = [];
  
  // Skip certain keys that contain large/binary data
  const skipKeys = ['zipFile', 'content', 'buffer', 'data', 'blob', 'base64', 'files'];
  
  Object.entries(metadata).forEach(([key, value]) => {
    // Skip large binary data fields
    if (skipKeys.some(skip => key.toLowerCase().includes(skip))) {
      return;
    }
    
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    if (typeof value === 'boolean') {
      lines.push(`${formattedKey}: ${value ? 'Yes' : 'No'}`);
    } else if (typeof value === 'number') {
      // Format numbers nicely
      if (key.toLowerCase().includes('size') || key.toLowerCase().includes('byte')) {
        const sizeMB = value / (1024 * 1024);
        if (sizeMB >= 1) {
          lines.push(`${formattedKey}: ${sizeMB.toFixed(2)} MB`);
        } else {
          const sizeKB = value / 1024;
          lines.push(`${formattedKey}: ${sizeKB.toFixed(2)} KB`);
        }
      } else if (key.toLowerCase().includes('speed')) {
        lines.push(`${formattedKey}: ${value.toFixed(2)} Mbps`);
      } else if (key.toLowerCase().includes('latency') || key.toLowerCase().includes('duration')) {
        lines.push(`${formattedKey}: ${value.toFixed(0)} ms`);
      } else {
        lines.push(`${formattedKey}: ${value.toFixed ? value.toFixed(2) : value}`);
      }
    } else if (typeof value === 'string' && value.length < 50) {
      lines.push(`${formattedKey}: ${value}`);
    } else if (Array.isArray(value) && value.length > 0 && value.length <= 5) {
      lines.push(`${formattedKey}: ${value.join(', ')}`);
    }
  });
  
  return lines.length > 0 ? lines.join(' | ') : '';
};
