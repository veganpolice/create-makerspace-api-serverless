const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const credentials = Buffer.from(`${email}:${password}`).toString('base64');
    
    const response = await fetch('https://www.amilia.com/api/v3/en/authenticate', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
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

      if (response.status === 404) {
        return res.status(404).json({
          error: 'Authentication endpoint not found',
          details: 'The authentication endpoint could not be found',
          hint: 'Please verify the API endpoint URL is correct'
        });
      }

      if (response.status === 401) {
        return res.status(401).json({
          error: 'Authentication failed',
          details: 'Invalid credentials',
          hint: 'Please verify your email and password'
        });
      }

      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.Token) {
      throw new Error('No token received in response');
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
