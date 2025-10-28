// Store verification codes temporarily (shared with send-email)
// In production, use a proper database or cache
const verificationCodes = new Map();

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
    const { email, code } = JSON.parse(event.body);

    if (!email || !code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email and code are required',
          details: 'Please provide both email and verification code.'
        })
      };
    }

    const stored = verificationCodes.get(email);

    if (!stored) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          status: 'FAIL',
          message: 'No verification code found',
          details: 'No verification code was sent to this email address.',
          deliveryTime: 0
        })
      };
    }

    const currentTime = Date.now();
    const deliveryTime = (currentTime - stored.sentTime) / 1000; // in seconds

    // Check if code expired (5 minutes)
    if (currentTime - stored.sentTime > 300000) {
      verificationCodes.delete(email);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          status: 'FAIL',
          message: 'Verification code expired',
          details: 'The verification code has expired. Please request a new one.',
          deliveryTime
        })
      };
    }

    // Verify code
    if (stored.code === code) {
      verificationCodes.delete(email);
      
      // Determine status based on delivery time
      let status = 'PASS';
      if (stored.type === '2fa' && deliveryTime > 30) {
        status = 'WARNING';
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          status,
          message: 'Email verified successfully',
          details: `Email delivered in ${deliveryTime.toFixed(2)} seconds.`,
          deliveryTime: parseFloat(deliveryTime.toFixed(2))
        })
      };
    } else {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          status: 'FAIL',
          message: 'Invalid verification code',
          details: 'The code you entered is incorrect.',
          deliveryTime
        })
      };
    }
  } catch (error) {
    console.error('Verification error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        status: 'FAIL',
        message: 'Verification failed',
        details: 'An error occurred during verification.',
        deliveryTime: 0,
        metadata: { error: error.message }
      })
    };
  }
};
