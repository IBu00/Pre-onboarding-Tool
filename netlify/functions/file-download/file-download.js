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
    // Path to test files directory - now in the same function directory
    const testFilesDir = path.join(__dirname, 'test-files');
    
    console.log('Looking for test files in:', testFilesDir);
    console.log('__dirname:', __dirname);
    console.log('Directory exists:', fs.existsSync(testFilesDir));
    
    // Check if directory exists
    if (!fs.existsSync(testFilesDir)) {
      // List what's actually in __dirname
      const dirContents = fs.readdirSync(__dirname);
      console.error('Test files directory not found. Contents of __dirname:', dirContents);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Test files directory not found',
          debug: {
            __dirname: __dirname,
            dirContents: dirContents
          }
        })
      };
    }

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
        
        // Check if ZIP size exceeds Lambda's 6MB limit
        const zipSizeMB = zipBuffer.length / 1024 / 1024;
        console.log(`ZIP size: ${zipSizeMB.toFixed(2)}MB`);
        
        if (zipBuffer.length > 6 * 1024 * 1024) {
          // If too large, send in chunks or direct binary response
          resolve({
            statusCode: 200,
            headers: {
              ...headers,
              'Content-Type': 'application/zip',
              'Content-Disposition': 'attachment; filename="VDR-Test-Files.zip"',
              'Content-Length': zipBuffer.length.toString()
            },
            body: base64Zip,
            isBase64Encoded: true
          });
        } else {
          // If small enough, send as JSON
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
        }
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
        console.log('Found files:', files);
        
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
    console.error('Download error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: `Server error: ${error.message}`
      })
    };
  }
};
