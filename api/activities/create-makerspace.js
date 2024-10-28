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

    // Log the request details for debugging
    console.log('Making request to Amilia API');
    console.log('Organization ID:', organizationId);
    console.log('Auth Token present:', !!authToken);

    const response = await fetch(`https://amilia.com/api/v3/en/organizations/${organizationId}/activities`, {
      headers: {
        'Authorization': authToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Amilia API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch activities: ${response.status} ${response.statusText}`);
    }

    const activities = await response.json();
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activities',
      details: error.message
    });
  }
};
