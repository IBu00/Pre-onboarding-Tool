const busboy = require('busboy');

const parseMultipartForm = (event) => {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = [];
    
    const bb = busboy({ 
      headers: {
        ...event.headers,
        'content-type': event.headers['content-type'] || event.headers['Content-Type']
      },
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB per file
        files: 100 // Maximum 100 files
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
          details: 'File upload test requires files to be selected and uploaded.',
          blockers: ['No files selected', 'Upload request incomplete']
        })
      };
    }

    const uploadedFiles = [];
    const warnings = [];
    const maxSize = 100 * 1024 * 1024; // 100MB

    for (const file of files) {
      const fileInfo = {
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString()
      };

      // Check file size
      if (file.size > maxSize) {
        warnings.push(`File "${file.originalname}": Size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 100MB limit`);
      }

      uploadedFiles.push(fileInfo);
    }

    // Return success response with warnings if any
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: warnings.length > 0 ? 'Upload successful with warnings' : 'Upload test successful',
        details: `${uploadedFiles.length} file(s) uploaded successfully. ${warnings.length > 0 ? 'Some warnings were detected but files were uploaded.' : 'All files uploaded without issues.'}`,
        uploadedFiles: uploadedFiles.map(f => f.filename),
        warnings: warnings.length > 0 ? warnings : undefined,
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
        details: `Failed to upload files to the server. Error: ${error.message}`,
        blockers: [
          'Network interruption during upload',
          'Server rejected the files',
          'File processing error'
        ],
        metadata: { error: error.message }
      })
    };
  }
};
