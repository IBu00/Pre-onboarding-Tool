const fs = require('fs');
const path = require('path');
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
    // Path to VDR Test Files directory
    const testFilesDir = path.join(__dirname, '../../VDR Test Files');
    
    // Check if directory exists
    if (!fs.existsSync(testFilesDir)) {
      throw new Error('VDR Test Files directory not found');
    }

    // Read all files from the directory
    const allFiles = fs.readdirSync(testFilesDir);
    
    if (allFiles.length === 0) {
      throw new Error('No test files found in VDR Test Files directory');
    }

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

    // Add all files from VDR Test Files directory to the zip
    allFiles.forEach(fileName => {
      const filePath = path.join(testFilesDir, fileName);
      const stats = fs.statSync(filePath);
      
      // Only add files, not directories
      if (stats.isFile()) {
        archive.file(filePath, { name: fileName });
      }
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
        details: `VDR Test Files package ready for download. Contains ${allFiles.length} test files in a single ZIP archive. Click "Download Test Files" to download.`,
        metadata: {
          filesCount: allFiles.length,
          zipFile: {
            name: 'VDR-Test-Files.zip',
            content: zipBase64,
            size: zipBuffer.length,
            type: 'application/zip',
            encoding: 'base64'
          },
          fileList: allFiles,
          totalSize: zipBuffer.length,
          instruction: 'Download the ZIP file and extract it. Then use these files for the Upload Test.'
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
