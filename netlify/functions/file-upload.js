const busboy = require('busboy');

const parseMultipartForm = (event) => {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = [];
    
    try {
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
        let fileSize = 0;
        
        file.on('data', (data) => {
          chunks.push(data);
          fileSize += data.length;
        });
        
        file.on('end', () => {
          files.push({
            fieldname: name,
            originalname: filename,
            encoding: encoding,
            mimetype: mimeType,
            buffer: Buffer.concat(chunks),
            size: fileSize
          });
        });
        
        file.on('error', (error) => {
          console.error('File stream error:', error);
        });
      });

      bb.on('field', (name, value) => {
        fields[name] = value;
      });

      bb.on('finish', () => {
        resolve({ fields, files });
      });

      bb.on('error', (error) => {
        console.error('Busboy error:', error);
        reject(error);
      });

      const body = event.isBase64Encoded 
        ? Buffer.from(event.body, 'base64')
        : event.body;
      
      bb.write(body);
      bb.end();
    } catch (error) {
      console.error('Parse multipart error:', error);
      reject(error);
    }
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
        mimetype: file.mimetype
      };

      // Check file size
      if (file.size > maxSize) {
        warnings.push(`File "${file.originalname}": Size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 100MB limit`);
      }

      uploadedFiles.push(fileInfo);
    }

    // Return minimal response to avoid 6MB payload limit
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: warnings.length > 0 ? 'Upload successful with warnings' : 'Upload test successful',
        details: `${uploadedFiles.length} file(s) uploaded successfully. ${warnings.length > 0 ? 'Some warnings were detected.' : 'All files uploaded without issues.'}`,
        uploadedFiles: uploadedFiles.map(f => f.filename),
        warnings: warnings.length > 0 ? warnings : undefined,
        metadata: {
          filesUploaded: uploadedFiles.length,
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
        details: `Failed to upload files. Error: ${error.message}`,
        blockers: [
          'File upload processing error',
          'Server error during upload',
          error.message
        ],
        metadata: { error: error.message }
      })
    };
  }
};
