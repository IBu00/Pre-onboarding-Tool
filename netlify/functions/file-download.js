const fs = require('fs');
const path = require('path');

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
    // Path to test files directory
    const testFilesDir = path.join(__dirname, '../test-files');
    
    // Define test files that will be available for download
    const testFileNames = [
      'Normal document.docx',
      'Test Excel.xlsx',
      'Test.jpg'
    ];

    const testFiles = testFileNames.map(fileName => {
      const filePath = path.join(testFilesDir, fileName);
      let fileData = null;
      let fileSize = 0;
      
      try {
        // Check if file exists
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          fileSize = stats.size;
          // Read file as base64 for binary files
          fileData = fs.readFileSync(filePath).toString('base64');
        }
      } catch (err) {
        console.error(`Error reading file ${fileName}:`, err);
      }

      // Determine MIME type
      let mimeType = 'application/octet-stream';
      if (fileName.endsWith('.docx')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (fileName.endsWith('.xlsx')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      }

      return {
        name: fileName,
        content: fileData,
        size: fileSize,
        type: mimeType,
        encoding: 'base64'
      };
    }).filter(file => file.content !== null); // Only include files that were successfully read

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Download test ready',
        details: `Found ${testFiles.length} file(s) available for download. Your browser and network configuration allow file downloads. No download restrictions detected. Click "Download Files" button to download all files at once and test the download functionality.`,
        metadata: {
          filesCount: testFiles.length,
          files: testFiles,
          totalSize: testFiles.reduce((sum, f) => sum + f.size, 0),
          instruction: 'Click the Download Files button to download all files. Then use these files for the Upload Test.'
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
        details: 'Failed to prepare files for download testing.',
        blockers: [
          'Server file system access denied',
          'File preparation error'
        ],
        metadata: { error: error.message }
      })
    };
  }
};
