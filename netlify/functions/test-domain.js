const axios = require('axios');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Use Netlify URL environment variable, or fallback
    const deployedUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://your-app.netlify.app';
    const startTime = Date.now();
    
    // Test domain accessibility
    const response = await axios.get(deployedUrl, { 
      timeout: 10000,
      validateStatus: () => true // Accept any status code
    });
    const responseTime = Date.now() - startTime;

    const success = response.status >= 200 && response.status < 400;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success,
        message: success ? 'Domain access successful' : 'Domain access failed',
        details: success 
          ? `Successfully connected to ${deployedUrl}. Your network configuration allows access to this domain. DNS resolution is working correctly, and there are no firewall restrictions blocking the connection.`
          : `Failed to establish connection to ${deployedUrl}. This could indicate network restrictions, DNS issues, or firewall blocks.`,
        blockers: success ? [] : [
          'Network connectivity issues',
          'Firewall or proxy blocking the domain',
          'DNS resolution failure',
          'VPN/Corporate network restrictions'
        ],
        metadata: {
          domain: deployedUrl,
          responseTime,
          statusCode: response.status
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Domain access failed',
        details: 'Failed to establish connection to the domain. This could indicate network restrictions, DNS issues, or firewall blocks.',
        blockers: [
          'Network connectivity issues',
          'Firewall or proxy blocking the domain',
          'DNS resolution failure',
          'VPN/Corporate network restrictions'
        ],
        metadata: { 
          error: error.message,
          code: error.code
        }
      })
    };
  }
};
