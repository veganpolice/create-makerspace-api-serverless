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

    console.log('Making request to Amilia API');
    console.log('Organization ID:', organizationId);
    console.log('Auth Token format:', token.substring(0, 15) + '...');

    const response = await fetch(`https://amilia.com/api/v3/en/organizations/${organizationId}/programs/activities`, {
      headers: {
        'Authorization': token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Amilia API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: `https://amilia.com/api/v3/en/organizations/${organizationId}/programs/activities`
      });
      throw new Error(`Failed to fetch activities: ${response.status} ${response.statusText}`);
    }

    const activities = await response.json();
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activities',
      details: error.message,
      hint: 'Please verify your organization ID and ensure your token is valid'
    });
  }
};
