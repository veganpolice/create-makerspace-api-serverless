const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const organizationId = "create-makerspace";
    const authToken = req.headers.authorization;

    if (!authToken) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    // Ensure the token is in the correct Bearer format
    const token = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;

    // Log the request details
    console.log('Request Headers:', req.headers);
    console.log('Organization ID:', organizationId);
    console.log('Auth Token:', token);

    // Try the base activities endpoint without 'programs'
    const apiUrl = `https://amilia.com/api/v3/organizations/${organizationId}/activities`;
    console.log('Attempting to fetch from:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Log the response details
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Amilia API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: apiUrl,
        headers: response.headers
      });
      throw new Error(`Failed to fetch activities: ${response.status} ${response.statusText}`);
    }

    const activities = await response.json();
    res.json(activities);
  } catch (error) {
    console.error('Detailed Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activities',
      details: error.message,
      hint: 'Please verify: 1) Organization ID is correct, 2) Token is valid and not expired, 3) Token has correct permissions'
    });
  }
};
