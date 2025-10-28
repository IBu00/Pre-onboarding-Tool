const archiver = require('archiver');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Create test files in memory
    const testFiles = [
      { name: 'Normal document.docx', content: Buffer.from('This is a test Word document for VDR testing.\n'.repeat(100)), type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { name: 'Test Excel.xlsx', content: Buffer.from('Test,Excel,Data\n1,2,3\n4,5,6\n'.repeat(50)), type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      { name: 'Test.jpg', content: Buffer.from('JFIF Test Image Data'.repeat(100)), type: 'image/jpeg' },
      { name: 'Confidential Business Info.docx', content: Buffer.from('Confidential VDR Test Document.\n'.repeat(100)), type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { name: 'Financial Report.pdf', content: Buffer.from('PDF Financial Report Test Data.\n'.repeat(200)), type: 'application/pdf' },
      { name: 'Contract.pdf', content: Buffer.from('PDF Contract Test Data.\n'.repeat(150)), type: 'application/pdf' },
      { name: 'Email.eml', content: Buffer.from('From: test@example.com\nTo: user@example.com\nSubject: Test\n\nTest email content.\n'.repeat(20)), type: 'message/rfc822' },
      { name: 'Presentation.pptx', content: Buffer.from('PowerPoint Test Presentation Data.\n'.repeat(300)), type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
      { name: 'Spreadsheet Data.xlsx', content: Buffer.from('Data,Analysis,Results\n'.repeat(100)), type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      { name: 'Meeting Notes.txt', content: Buffer.from('Meeting notes for VDR test.\n'.repeat(50)), type: 'text/plain' }
    ];

    // Create a zip archive in memory
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    const chunks = [];
    
    // Collect zip data
    archive.on('data', (chunk) => {
      chunks.push(chunk);
    });

    // Handle archive completion
    const zipPromise = new Promise((resolve, reject) => {
      archive.on('end', () => {
        const zipBuffer = Buffer.concat(chunks);
        resolve(zipBuffer);
      });
      
      archive.on('error', (err) => {
        reject(err);
      });
    });

    // Add all test files to the zip
    testFiles.forEach(file => {
      archive.append(file.content, { name: file.name });
    });

    // Finalize the archive
    archive.finalize();

    // Wait for zip to complete
    const zipBuffer = await zipPromise;
    const zipBase64 = zipBuffer.toString('base64');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Download test ready',
        details: `VDR Test Files package ready for download. Contains ${testFiles.length} test files in a single ZIP archive.`,
        metadata: {
          filesCount: testFiles.length,
          zipFile: {
            name: 'VDR-Test-Files.zip',
            content: zipBase64,
            size: zipBuffer.length,
            type: 'application/zip',
            encoding: 'base64'
          }
        }
      })
    };
  } catch (error) {
    console.error('Download preparation error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Download test failed',
        details: `Failed to prepare files for download testing. Error: ${error.message}`,
        blockers: [
          'Server file system access denied',
          'File preparation error',
          error.message
        ],
        metadata: { error: error.message }
      })
    };
  }
};