const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://amilia-cal.netlify.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      details: 'This endpoint only accepts GET requests',
      hint: 'Use GET method for authentication'
    });
  }

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        details: 'Email and password are required',
        hint: 'Please provide both email and password in the request body'
      });
    }

    const credentials = Buffer.from(`${email}:${password}`).toString('base64');
    const apiUrl = 'https://www.amilia.com/api/v3/authenticate';
    
    console.log('Attempting authentication with Amilia API');
    console.log('API URL:', apiUrl);
    console.log('Email:', email);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Authentication Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        body: errorText || 'No response body'
      });

      switch (response.status) {
        case 404:
          return res.status(404).json({
            error: 'Authentication endpoint not found',
            details: 'Could not reach the Amilia authentication service',
            hint: 'The API endpoint might have changed or is temporarily unavailable'
          });
        case 401:
          return res.status(401).json({
            error: 'Authentication failed',
            details: 'Invalid credentials provided',
            hint: 'Please verify your email and password'
          });
        case 403:
          return res.status(403).json({
            error: 'Access forbidden',
            details: 'The account might be locked or disabled',
            hint: 'Please contact your administrator'
          });
        default:
          return res.status(response.status).json({
            error: 'Authentication failed',
            details: `Server responded with status ${response.status}`,
            hint: 'Please try again later or contact support'
          });
      }
    }

    const data = await response.json();
    
    if (!data.Token) {
      console.error('No token in response:', data);
      throw new Error('Authentication successful but no token received');
    }

    res.json({ token: data.Token });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      details: error.message,
      hint: 'Please verify your credentials and try again'
    });
  }
};
