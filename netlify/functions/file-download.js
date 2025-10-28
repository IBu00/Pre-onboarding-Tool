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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    // Path to test files directory - in Netlify, it's relative to the functions directory
    // Try multiple possible paths
    let testFilesDir = path.join(__dirname, '../test-files');
    
    // If not found, try from the repo root
    if (!fs.existsSync(testFilesDir)) {
      testFilesDir = path.join(__dirname, '../../netlify/test-files');
    }
    
    // If still not found, try absolute path in build
    if (!fs.existsSync(testFilesDir)) {
      testFilesDir = '/opt/build/repo/netlify/test-files';
    }
    
    // Check if directory exists
    if (!fs.existsSync(testFilesDir)) {
      console.error('Test files directory not found. Tried paths:', {
        path1: path.join(__dirname, '../test-files'),
        path2: path.join(__dirname, '../../netlify/test-files'),
        path3: '/opt/build/repo/netlify/test-files',
        __dirname: __dirname
      });
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Test files directory not found'
        })
      };
    }
    
    console.log('Using test files directory:', testFilesDir);

    // Create a buffer to store the ZIP
    const chunks = [];
    
    return new Promise((resolve) => {
      // Create archiver instance
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      // Collect data chunks
      archive.on('data', (chunk) => {
        chunks.push(chunk);
      });

      // Handle archive completion
      archive.on('end', () => {
        const zipBuffer = Buffer.concat(chunks);
        const base64Zip = zipBuffer.toString('base64');
        
        resolve({
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            message: 'ZIP file created successfully',
            details: 'VDR Test Files ZIP ready for download. Extract the ZIP and use these files for the upload test.',
            metadata: {
              zipFile: {
                name: 'VDR-Test-Files.zip',
                content: base64Zip,
                size: zipBuffer.length,
                type: 'application/zip',
                encoding: 'base64'
              }
            }
          })
        });
      });

      // Handle errors
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: `Failed to create ZIP: ${err.message}`
          })
        });
      });

      // Add all files from test-files directory to the archive
      try {
        const files = fs.readdirSync(testFilesDir);
        
        files.forEach(file => {
          const filePath = path.join(testFilesDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isFile()) {
            archive.file(filePath, { name: file });
          }
        });

        // Finalize the archive
        archive.finalize();
      } catch (err) {
        console.error('Error reading files:', err);
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: `Error reading test files: ${err.message}`
          })
        });
      }
    });
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