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

    // Ensure the token is in the correct Bearer format and validate its basic structure
    const token = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
    if (!token.split(' ')[1]?.startsWith('eyJ')) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    console.log('Making request to Amilia API');
    console.log('Organization ID:', organizationId);
    console.log('Auth Token format:', token.substring(0, 20) + '...');

    // Updated API endpoint structure with www subdomain
    const apiUrl = `https://www.amilia.com/api/v3/en/organizations/${organizationId}/activities`;
    console.log('Request URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText || 'No response body'
      });

      // Check specific error cases
      if (response.status === 404) {
        return res.status(404).json({
          error: 'Resource not found',
          details: 'The specified organization or endpoint could not be found',
          hint: 'Verify that the organization ID is correct and the API endpoint structure is valid'
        });
      }

      if (response.status === 401) {
        return res.status(401).json({
          error: 'Unauthorized',
          details: 'The provided token was rejected by the API',
          hint: 'Please ensure your token is valid and not expired'
        });
      }

      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const activities = await response.json();
    res.json(activities);
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({
      error: 'Failed to fetch activities',
      details: error.message,
      hint: 'Please verify your credentials and try again'
    });
  }
};
