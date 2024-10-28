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
    
    const response = await fetch('https://www.amilia.com/api/v3/authenticate', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Authentication error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText || 'No response body'
      });
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
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
