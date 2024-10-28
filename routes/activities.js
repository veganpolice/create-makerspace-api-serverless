const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Changed from 'create-makerspace' to '/:organizationId'
router.get('/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const authToken = req.headers.authorization;

    if (!authToken) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    // Ensure the token is in the correct Bearer format
    const token = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;

    console.log('Making request to Amilia API');
    console.log('Organization ID:', organizationId);
    console.log('Auth Token format:', token.substring(0, 20) + '...');

    const apiUrl = `https://www.amilia.com/api/v3/en/organizations/${organizationId}/activities`;
    console.log('Request URL:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText || 'No response body'
      });

      if (response.status === 404) {
        return res.status(404).json({
          error: 'Resource not found',
          details: 'The specified organization or endpoint could not be found',
          hint: 'Verify that the organization ID is correct and the API endpoint structure is valid'
        });
      }

      throw new Error(`Failed to fetch activities: ${response.statusText}`);
    }

    const activities = await response.json();
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      error: 'Failed to fetch activities',
      details: error.message,
      hint: 'Please verify: 1) Organization ID is correct, 2) Token is valid and not expired, 3) Token has correct permissions'
    });
  }
});

module.exports = router;
