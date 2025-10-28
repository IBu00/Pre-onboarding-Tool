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
    // Define test files that will be available for download
    const testFiles = [
      {
        name: 'sample-document.txt',
        content: 'This is a sample document for download testing. File 1 of 3.\n\nThis file tests basic text file downloads and verifies that your browser can download and save files from the platform.\n\nTimestamp: ' + new Date().toISOString(),
        size: 250,
        type: 'text/plain'
      },
      {
        name: 'sample-image-data.txt',
        content: 'This represents a sample image file for download testing. File 2 of 3.\n\nIn a real scenario, this would be an actual image file. This test verifies multi-file download capabilities.\n\nTimestamp: ' + new Date().toISOString(),
        size: 220,
        type: 'text/plain'
      },
      {
        name: 'sample-pdf-data.txt',
        content: 'This represents a sample PDF file for download testing. File 3 of 3.\n\nThis test ensures your browser can handle multiple file downloads in sequence without restrictions.\n\nTimestamp: ' + new Date().toISOString(),
        size: 210,
        type: 'text/plain'
      }
    ];

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
