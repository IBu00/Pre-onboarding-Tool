const busboy = require('busboy');

const parseMultipartForm = (event) => {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = [];
    
    const bb = busboy({ 
      headers: {
        ...event.headers,
        'content-type': event.headers['content-type'] || event.headers['Content-Type']
      }
    });

    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      const chunks = [];
      
      file.on('data', (data) => {
        chunks.push(data);
      });
      
      file.on('end', () => {
        files.push({
          fieldname: name,
          originalname: filename,
          encoding: encoding,
          mimetype: mimeType,
          buffer: Buffer.concat(chunks),
          size: Buffer.concat(chunks).length
        });
      });
    });

    bb.on('field', (name, value) => {
      fields[name] = value;
    });

    bb.on('finish', () => {
      resolve({ fields, files });
    });

    bb.on('error', (error) => {
      reject(error);
    });

    bb.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
    bb.end();
  });
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { fields, files } = await parseMultipartForm(event);

    if (!files || files.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'No files uploaded',
          details: 'File upload test requires files to be selected and uploaded. Please choose the files you downloaded earlier and try again.',
          blockers: ['No files selected', 'Upload request incomplete']
        })
      };
    }

    const uploadedFiles = [];
    const blockers = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['text/plain', 'image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    let allFilesValid = true;

    for (const file of files) {
      const fileInfo = {
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString()
      };

      // Check file size
      if (file.size > maxSize) {
        blockers.push(`File "${file.originalname}": Size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds recommended limit of 10MB`);
        allFilesValid = false;
      }

      // Check file type - be lenient for test files
      if (!allowedTypes.includes(file.mimetype) && !file.mimetype.includes('text')) {
        blockers.push(`File "${file.originalname}": Type '${file.mimetype}' may not be supported by all platform features`);
      }

      // Check if file is empty
      if (file.size === 0) {
        blockers.push(`File "${file.originalname}": File is empty`);
        allFilesValid = false;
      }

      uploadedFiles.push(fileInfo);
    }

    // Determine success status
    const success = files.length > 0 && uploadedFiles.length === files.length;

    if (blockers.length > 0 && !allFilesValid) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Upload failed with errors',
          details: `${uploadedFiles.length} file(s) were processed, but critical errors were detected that prevent successful upload.`,
          blockers,
          metadata: {
            filesUploaded: uploadedFiles.length,
            files: uploadedFiles,
            totalSize: uploadedFiles.reduce((sum, f) => sum + f.size, 0)
          }
        })
      };
    }

    if (blockers.length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Upload successful with warnings',
          details: `${uploadedFiles.length} file(s) uploaded successfully, but some warnings were detected. The files were received by the server, but there are potential compatibility issues that may affect usage.`,
          blockers,
          metadata: {
            filesUploaded: uploadedFiles.length,
            files: uploadedFiles,
            totalSize: uploadedFiles.reduce((sum, f) => sum + f.size, 0)
          }
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Upload test successful',
        details: `File upload test passed successfully! ${uploadedFiles.length} file(s) uploaded without any issues. Your network and browser configuration properly support file uploads to the platform. All files meet the platform requirements.`,
        blockers: [],
        metadata: {
          filesUploaded: uploadedFiles.length,
          files: uploadedFiles,
          totalSize: uploadedFiles.reduce((sum, f) => sum + f.size, 0)
        }
      })
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Upload test failed',
        details: 'Failed to upload files to the server. This could be due to network issues, server restrictions, or file handling problems.',
        blockers: [
          'Network interruption during upload',
          'Server rejected the files',
          'File processing error',
          'Antivirus or security software blocking upload'
        ],
        metadata: { error: error.message }
      })
    };
  }
};
